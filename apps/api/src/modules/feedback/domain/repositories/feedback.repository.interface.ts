import { PaginatedResult } from 'src/shared/application/interfaces/paginated-result.interface'
import { Feedback } from '../entities/feedback.entity'
import { FeedbackSort } from '../enums/feedback-sort.enum'

export const FEEDBACK_REPOSITORY = Symbol('FEEDBACK_REPOSITORY')

export interface FindFeedbacksParams {
	categorySlug?: string
	sort?: FeedbackSort
	page: number
	perPage: number
}

export interface IFeedbackRepository {
	create(feedback: Feedback): Promise<Feedback>
	update(feedback: Feedback): Promise<Feedback>
	delete(feedback: Feedback): Promise<void>

	countByStatus(): Promise<Record<string, number>>
	findById(id: number): Promise<Feedback | null>
	findByIdOrThrow(id: number): Promise<Feedback>

	findAll(params: FindFeedbacksParams): Promise<PaginatedResult<Feedback>>
}
