import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Comment } from '../../../domain/entities/comment.entity'

export class CommentResponse {
	@ApiProperty({ example: 1 })
	id: number

	@ApiProperty({
		example: 'Essa funcionalidade seria incrível para o nosso fluxo!',
	})
	content: string

	@ApiProperty({ example: 42 })
	feedbackId: number

	@ApiProperty({ example: 5 })
	authorId: number

	@ApiPropertyOptional({
		example: 2,
		description:
			'ID of the parent comment if this is a reply. Null if it is a root comment.',
		type: Number,
		nullable: true,
	})
	parentId: number | null

	@ApiProperty({ example: 12 })
	upvotesCount: number

	@ApiProperty({ example: false })
	isUpvoted: boolean

	@ApiProperty({ example: '2026-03-15T10:00:00.000Z' })
	createdAt: Date

	@ApiProperty({ example: '2026-03-15T10:00:00.000Z' })
	updatedAt: Date

	@ApiPropertyOptional({ type: () => [CommentResponse] })
	replies: CommentResponse[]
}

export class CommentPresenter {
	static toHTTP(comment: Comment): CommentResponse {
		return {
			id: Number(comment.id),
			content: comment.content,
			feedbackId: Number(comment.feedbackId),
			authorId: Number(comment.authorId),
			parentId: comment.parentId ? Number(comment.parentId) : null,

			upvotesCount: comment.upvotesCount,
			isUpvoted: comment.isUpvoted ?? false,

			createdAt: comment.createdAt,
			updatedAt: comment.updatedAt,

			replies: comment.replies?.map(CommentPresenter.toHTTP) ?? [],
		}
	}
}
