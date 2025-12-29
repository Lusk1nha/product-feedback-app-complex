import { FeedbackCategory } from '../value-objects/feedback-category.vo'
import { FeedbackStatus } from '../value-objects/feedback-status.vo'

export const METADATA_REPOSITORY = Symbol('METADATA_REPOSITORY')

export interface IMetadataRepository {
	findAllCategories(): Promise<FeedbackCategory[]>
	findAllStatuses(): Promise<FeedbackStatus[]>
}
