import { Feedback } from '../entities/feedback.entity'

export const FEEDBACK_REPOSITORY = Symbol('FEEDBACK_REPOSITORY')

export interface IFeedbackRepository {
	create(feedback: Feedback): Promise<Feedback>

	countByStatus(): Promise<Record<string, number>>
}
