import { Inject, Injectable } from '@nestjs/common'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { eq, asc, and, sql } from 'drizzle-orm'
import * as schema from 'src/shared/infrastructure/database/schema'
import { DRIZZLE_PROVIDER } from 'src/shared/infrastructure/database/database.module'

import { Comment } from '../../domain/entities/comment.entity'
import { CommentMapper } from '../database/mappers/comment.mapper'
import { ICommentRepository } from '../../domain/repositories/comment.repository.interface'

@Injectable()
export class CommentDrizzleRepository implements ICommentRepository {
	constructor(
		@Inject(DRIZZLE_PROVIDER)
		private readonly db: NodePgDatabase<typeof schema>,
	) {}

	async create(comment: Comment): Promise<Comment> {
		const [created] = await this.db
			.insert(schema.feedbackComments)
			.values(CommentMapper.toPersistence(comment))
			.returning()

		return CommentMapper.toDomain(created)
	}

	async update(comment: Comment): Promise<Comment> {
		const [updated] = await this.db
			.update(schema.feedbackComments)
			.set(CommentMapper.toPersistence(comment))
			.where(eq(schema.feedbackComments.id, comment.id))
			.returning()

		return CommentMapper.toDomain(updated)
	}

	async delete(comment: Comment): Promise<void> {
		// Soft delete muito bem aplicado!
		await this.db
			.update(schema.feedbackComments)
			.set({ enabled: false })
			.where(eq(schema.feedbackComments.id, comment.id))
	}

	// --- NOVO MÉTODO: FINDBYID ---
	async findById(id: number, userId?: number): Promise<Comment | null> {
		const [row] = await this.db
			.select({
				comment: schema.feedbackComments,
				hasUpvoted:
					sql<boolean>`CASE WHEN ${schema.commentUpvotes.userId} IS NOT NULL THEN true ELSE false END`.as(
						'has_upvoted',
					),
			})
			.from(schema.feedbackComments)
			.leftJoin(
				schema.commentUpvotes,
				and(
					eq(schema.commentUpvotes.commentId, schema.feedbackComments.id),
					eq(schema.commentUpvotes.userId, userId ?? 0),
				),
			)
			.where(
				and(
					eq(schema.feedbackComments.id, id),
					eq(schema.feedbackComments.enabled, true),
				),
			)

		if (!row) return null

		return CommentMapper.toDomain({
			...row.comment,
			hasUpvoted: row.hasUpvoted,
		})
	}

	// --- MÉTODO EXISTENTE (INTACTO) ---
	async findTreeByFeedbackId(
		feedbackId: number,
		userId?: number,
	): Promise<Comment[]> {
		const rows = await this.db
			.select({
				comment: schema.feedbackComments,
				hasUpvoted:
					sql<boolean>`CASE WHEN ${schema.commentUpvotes.userId} IS NOT NULL THEN true ELSE false END`.as(
						'has_upvoted',
					),
			})
			.from(schema.feedbackComments)
			.leftJoin(
				schema.commentUpvotes,
				and(
					eq(schema.commentUpvotes.commentId, schema.feedbackComments.id),
					eq(schema.commentUpvotes.userId, userId ?? 0),
				),
			)
			.where(
				and(
					eq(schema.feedbackComments.feedbackId, feedbackId),
					eq(schema.feedbackComments.enabled, true),
				),
			)
			.orderBy(asc(schema.feedbackComments.createdAt))

		const allComments = rows.map((row) =>
			CommentMapper.toDomain({
				...row.comment,
				hasUpvoted: row.hasUpvoted,
			}),
		)

		const commentMap = new Map<number, Comment>()
		const rootComments: Comment[] = []

		for (const comment of allComments) {
			commentMap.set(comment.id, comment)
		}

		for (const comment of allComments) {
			if (comment.parentId) {
				const parent = commentMap.get(comment.parentId)
				if (parent) {
					parent.addReply(comment)
				}
			} else {
				rootComments.push(comment)
			}
		}

		return rootComments
	}

	// --- NOVO MÉTODO: TOGGLE UPVOTE PARA COMENTÁRIOS ---
	async toggleUpvote(
		commentId: number,
		userId: number,
	): Promise<{ hasUpvoted: boolean; upvotesCount: number }> {
		return await this.db.transaction(async (tx) => {
			// 1. Tenta Deletar
			const [deletedVote] = await tx
				.delete(schema.commentUpvotes)
				.where(
					and(
						eq(schema.commentUpvotes.commentId, commentId),
						eq(schema.commentUpvotes.userId, userId),
					),
				)
				.returning()

			if (deletedVote) {
				const [updated] = await tx
					.update(schema.feedbackComments)
					.set({
						upvotesCount: sql`${schema.feedbackComments.upvotesCount} - 1`,
					})
					.where(eq(schema.feedbackComments.id, commentId))
					.returning({ upvotesCount: schema.feedbackComments.upvotesCount })

				return { hasUpvoted: false, upvotesCount: updated.upvotesCount }
			}

			// 2. Tenta Inserir
			const [insertedVote] = await tx
				.insert(schema.commentUpvotes)
				.values({ commentId, userId })
				.onConflictDoNothing()
				.returning()

			if (insertedVote) {
				const [updated] = await tx
					.update(schema.feedbackComments)
					.set({
						upvotesCount: sql`${schema.feedbackComments.upvotesCount} + 1`,
					})
					.where(eq(schema.feedbackComments.id, commentId))
					.returning({ upvotesCount: schema.feedbackComments.upvotesCount })

				return { hasUpvoted: true, upvotesCount: updated.upvotesCount }
			}

			// 3. Fallback contra concorrência e multiplos clicks simultaneos
			const [current] = await tx
				.select({ upvotesCount: schema.feedbackComments.upvotesCount })
				.from(schema.feedbackComments)
				.where(eq(schema.feedbackComments.id, commentId))

			return { hasUpvoted: true, upvotesCount: current.upvotesCount }
		})
	}
}
