import * as schema from 'src/shared/infrastructure/database/schema'

import { Inject, Injectable } from '@nestjs/common'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { sql, eq, asc, desc, and, SQL } from 'drizzle-orm'
import { DRIZZLE_PROVIDER } from 'src/shared/infrastructure/database/database.module'
import {
	FindFeedbacksParams,
	IFeedbackRepository,
} from '../../domain/repositories/feedback.repository.interface'
import { Feedback } from '../../domain/entities/feedback.entity'
import { FeedbackMapper } from '../database/mappers/feedback.mapper'
import { FeedbackNotFoundError } from '../../domain/errors/feedback/feedback-not-found.error'
import { FeedbackSort } from '../../domain/enums/feedback-sort.enum'
import { PaginatedResult } from 'src/shared/application/interfaces/paginated-result.interface'

@Injectable()
export class FeedbackDrizzleRepository implements IFeedbackRepository {
	constructor(
		@Inject(DRIZZLE_PROVIDER)
		private readonly db: NodePgDatabase<typeof schema>,
	) {}

	async create(feedback: Feedback): Promise<Feedback> {
		const persistenceData = FeedbackMapper.toPersistence(feedback)

		const [inserted] = await this.db
			.insert(schema.feedbacks)
			.values(persistenceData)
			.returning()

		return FeedbackMapper.toDomain(inserted)
	}

	async update(feedback: Feedback): Promise<Feedback> {
		return await this.db.transaction(async (tx) => {
			const persistenceData = FeedbackMapper.toPersistence(feedback)

			const [updated] = await tx
				.update(schema.feedbacks)
				.set(persistenceData)
				.where(eq(schema.feedbacks.id, feedback.id))
				.returning()

			return FeedbackMapper.toDomain(updated)
		})
	}

	async delete(feedback: Feedback): Promise<void> {
		await this.db
			.delete(schema.feedbacks)
			.where(eq(schema.feedbacks.id, feedback.id))
	}

	async findById(id: number, userId?: number): Promise<Feedback | null> {
		const [row] = await this.db
			.select({
				feedback: schema.feedbacks,
				hasUpvoted:
					sql<boolean>`CASE WHEN ${schema.upvotes.userId} IS NOT NULL THEN true ELSE false END`.as(
						'has_upvoted',
					),
			})
			.from(schema.feedbacks)
			.leftJoin(
				schema.upvotes,
				and(
					eq(schema.upvotes.feedbackId, schema.feedbacks.id),
					eq(schema.upvotes.userId, userId ?? 0),
				),
			)
			.where(eq(schema.feedbacks.id, id))

		if (!row) return null

		return FeedbackMapper.toDomain({
			...row.feedback,
			hasUpvoted: row.hasUpvoted,
		})
	}

	async findByIdOrThrow(id: number, userId?: number): Promise<Feedback> {
		const result = await this.findById(id, userId)
		if (!result) throw new FeedbackNotFoundError()
		return result
	}

	async findAll(
		params: FindFeedbacksParams,
	): Promise<PaginatedResult<Feedback>> {
		const { categorySlug, statusSlug, sort, page, perPage, userId } = params

		// Filtros base
		const filters: SQL[] = [eq(schema.feedbacks.enabled, true)]

		if (statusSlug && statusSlug !== 'all') {
			filters.push(eq(schema.feedbacks.statusSlug, statusSlug))
		}

		if (categorySlug && categorySlug !== 'all') {
			filters.push(eq(schema.feedbacks.categorySlug, categorySlug))
		}

		// Ordenação (Reutilizando a lógica que fizemos antes)
		let orderByClause = desc(schema.feedbacks.upvotesCount)

		// 3. Aplica Ordenação baseada no Enum
		switch (sort) {
			case FeedbackSort.LEAST_UPVOTES:
				orderByClause = asc(schema.feedbacks.upvotesCount)
				break

			case FeedbackSort.MOST_COMMENTS:
				orderByClause = desc(schema.feedbacks.upvotesCount)
				break

			case FeedbackSort.LEAST_COMMENTS:
				orderByClause = asc(schema.feedbacks.upvotesCount)
				break

			case FeedbackSort.MOST_UPVOTES:
				orderByClause = desc(schema.feedbacks.upvotesCount)
				break

			default:
				orderByClause = desc(schema.feedbacks.upvotesCount)
				break
		}

		// Cálculo do Offset
		const offset = (page - 1) * perPage

		// 🚀 Executa as duas queries em paralelo
		const [dataRaw, countResult] = await Promise.all([
			// 1. Busca os dados paginados
			this.db
				.select({
					feedback: schema.feedbacks,
					// Retorna true se encontrou o registro na tabela de upvotes, false caso contrário
					hasUpvoted:
						sql<boolean>`CASE WHEN ${schema.upvotes.userId} IS NOT NULL THEN true ELSE false END`.as(
							'has_upvoted',
						),
				})
				.from(schema.feedbacks)
				.leftJoin(
					schema.upvotes,
					and(
						eq(schema.upvotes.feedbackId, schema.feedbacks.id),
						// O coalesce para 0 garante que a query não quebre caso userId seja undefined
						eq(schema.upvotes.userId, userId ?? 0),
					),
				)
				.where(and(...filters))
				.orderBy(orderByClause)
				.limit(perPage)
				.offset(offset),

			// 2. Busca o total (Count)
			this.db
				.select({
					count: sql<number>`cast(count(${schema.feedbacks.id}) as int)`,
				})
				.from(schema.feedbacks)
				.where(and(...filters)),
		])

		const total = countResult[0].count
		const lastPage = Math.ceil(total / perPage)

		return {
			data: dataRaw.map((row) =>
				FeedbackMapper.toDomain({
					...row.feedback,
					hasUpvoted: row.hasUpvoted,
				}),
			),
			meta: { page, perPage, total, lastPage },
		}
	}

	async findAllByStatusSlug(statusSlug: string): Promise<Feedback[]> {
		const rows = await this.db
			.select()
			.from(schema.feedbacks)
			.where(
				and(
					eq(schema.feedbacks.statusSlug, statusSlug),
					eq(schema.feedbacks.enabled, true),
				),
			)

		return rows.map(FeedbackMapper.toDomain)
	}

	async countByAggregatedStatus(): Promise<Record<string, number>> {
		const rows = await this.db
			.select({
				status: schema.feedbacks.statusSlug,
				count: sql<number>`cast(count(${schema.feedbacks.id}) as int)`,
			})
			.from(schema.feedbacks)
			.where(eq(schema.feedbacks.enabled, true))
			.groupBy(schema.feedbacks.statusSlug)

		return rows.reduce(
			(acc, curr) => {
				acc[curr.status] = curr.count
				return acc
			},
			{} as Record<string, number>,
		)
	}

	async countByStatus(status: string): Promise<number> {
		const result = await this.db
			.select({
				count: sql<number>`cast(count(${schema.feedbacks.id}) as int)`,
			})
			.from(schema.feedbacks)
			.where(
				and(
					eq(schema.feedbacks.statusSlug, status),
					eq(schema.feedbacks.enabled, true),
				),
			)

		return result[0].count
	}

	async toggleUpvote(
		feedbackId: number,
		userId: number,
	): Promise<{ hasUpvoted: boolean; upvotesCount: number }> {
		return await this.db.transaction(async (tx) => {
			const [deletedVote] = await tx
				.delete(schema.upvotes)
				.where(
					and(
						eq(schema.upvotes.feedbackId, feedbackId),
						eq(schema.upvotes.userId, userId),
					),
				)
				.returning()

			if (deletedVote) {
				const [updated] = await tx
					.update(schema.feedbacks)
					.set({ upvotesCount: sql`${schema.feedbacks.upvotesCount} - 1` })
					.where(eq(schema.feedbacks.id, feedbackId))
					.returning({ upvotesCount: schema.feedbacks.upvotesCount })

				return { hasUpvoted: false, upvotesCount: updated.upvotesCount }
			}

			const [insertedVote] = await tx
				.insert(schema.upvotes)
				.values({ feedbackId, userId })
				.onConflictDoNothing()
				.returning()

			if (insertedVote) {
				const [updated] = await tx
					.update(schema.feedbacks)
					.set({ upvotesCount: sql`${schema.feedbacks.upvotesCount} + 1` })
					.where(eq(schema.feedbacks.id, feedbackId))
					.returning({ upvotesCount: schema.feedbacks.upvotesCount })

				return { hasUpvoted: true, upvotesCount: updated.upvotesCount }
			}

			const [current] = await tx
				.select({ upvotesCount: schema.feedbacks.upvotesCount })
				.from(schema.feedbacks)
				.where(eq(schema.feedbacks.id, feedbackId))

			return { hasUpvoted: true, upvotesCount: current.upvotesCount }
		})
	}
}
