import { FeedbackCategory } from '../entities/reference/feedback-category.entity'
import { FeedbackStatus } from '../entities/reference/feedback-status.entity'

export const METADATA_REPOSITORY = Symbol('METADATA_REPOSITORY')

export interface IMetadataRepository {
	findAllCategories(): Promise<FeedbackCategory[]>
	findAllStatuses(): Promise<FeedbackStatus[]>
	findStatusesIncludedInRoadmap(): Promise<FeedbackStatus[]>

	findStatusBySlug(slug: string): Promise<FeedbackStatus | null>
	findCategoryBySlug(slug: string): Promise<FeedbackCategory | null>
}
