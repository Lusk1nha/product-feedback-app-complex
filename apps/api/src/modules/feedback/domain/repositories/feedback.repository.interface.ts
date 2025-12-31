import { Feedback } from '../entities/feedback.entity'

export const FEEDBACK_REPOSITORY = Symbol('FEEDBACK_REPOSITORY')

export interface IFeedbackRepository {
	create(feedback: Feedback): Promise<Feedback>
	update(feedback: Feedback): Promise<Feedback>
	delete(feedback: Feedback): Promise<void>

	countByStatus(): Promise<Record<string, number>>
	findById(id: number): Promise<Feedback | null>
	findByIdOrThrow(id: number): Promise<Feedback>
}
