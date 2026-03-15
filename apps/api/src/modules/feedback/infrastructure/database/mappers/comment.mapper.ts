import { Comment } from '../../../domain/entities/comment.entity'
import { feedbackComments } from '../schema/comment.schema'

type CommentSelect = typeof feedbackComments.$inferSelect

export class CommentMapper {
	static toDomain(raw: CommentSelect & { hasUpvoted?: boolean }): Comment {
		return Comment.rebuild(
			{
				content: raw.content,
				feedbackId: raw.feedbackId,
				authorId: raw.authorId,
				parentId: raw.parentId,
				upvotesCount: raw.upvotesCount,
				hasUpvoted: raw.hasUpvoted ?? false,
				enabled: raw.enabled,
				createdAt: raw.createdAt,
				updatedAt: raw.updatedAt,
				replies: [], // Começa vazio, o repositório vai preencher
			},
			raw.id,
		)
	}

	static toPersistence(entity: Comment): typeof feedbackComments.$inferInsert {
		return {
			content: entity.content,
			feedbackId: entity.feedbackId,
			authorId: entity.authorId,
			parentId: entity.parentId,
			upvotesCount: entity.upvotesCount,
			enabled: entity.enabled,
		}
	}
}
