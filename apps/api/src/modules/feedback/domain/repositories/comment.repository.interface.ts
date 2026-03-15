import { Comment } from '../entities/comment.entity'

export const COMMENT_REPOSITORY = Symbol('COMMENT_REPOSITORY')

export interface ICommentRepository {
	create(comment: Comment): Promise<Comment>
	update(comment: Comment): Promise<Comment>
	delete(comment: Comment): Promise<void>

	findById(id: number, userId?: number): Promise<Comment | null>
	findTreeByFeedbackId(feedbackId: number, userId?: number): Promise<Comment[]>

	toggleUpvote(
		commentId: number,
		userId: number,
	): Promise<{ hasUpvoted: boolean; upvotesCount: number }>
}
