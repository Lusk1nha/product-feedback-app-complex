import { Feedback } from '../../../domain/entities/feedback.entity'
import { feedbacks } from '../schema/feedback.schema'

type FeedbackSelect = typeof feedbacks.$inferSelect
type FeedbackInsert = typeof feedbacks.$inferInsert

export class FeedbackMapper {
	static toDomain(raw: FeedbackSelect): Feedback {
		return Feedback.rebuild(
			{
				title: raw.title,
				description: raw.description,
				authorId: raw.authorId,
				categorySlug: raw.categorySlug,
				statusSlug: raw.statusSlug,
				upvotesCount: raw.upvotesCount,
				enabled: raw.enabled,
				createdAt: raw.createdAt,
				updatedAt: raw.updatedAt,
			},
			raw.id,
		)
	}

	static toPersistence(entity: Feedback): FeedbackInsert {
		return {
			// id é serial/autoincrement, não passamos no insert
			// se fosse update, passaríamos o id no where clause, não no body
			title: entity.title,
			description: entity.description,
			authorId: entity.authorId,
			categorySlug: entity.categorySlug,
			statusSlug: entity.statusSlug,
			upvotesCount: entity.upvotesCount,
			enabled: entity.enabled,
		}
	}
}
