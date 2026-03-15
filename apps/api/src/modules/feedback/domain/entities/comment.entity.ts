import { BaseEntity } from 'src/shared/domain/entities/base.entity'
import { CommentContentTooShortError } from '../errors/comment/comment-content-too-short.error'

export interface CommentProps {
	content: string
	feedbackId: number
	authorId: number
	parentId: number | null
	upvotesCount: number
	hasUpvoted?: boolean
	enabled: boolean
	createdAt: Date
	updatedAt: Date

	replies?: Comment[]
}

export class Comment extends BaseEntity {
	private props: CommentProps

	private constructor(props: CommentProps, id?: number) {
		super({ id })
		this.props = props
		this.props.replies = props.replies || []
	}

	static create(props: {
		content: string
		feedbackId: number
		authorId: number
		parentId?: number | null
	}): Comment {
		if (props.content.trim().length < 2) {
			throw new CommentContentTooShortError(2)
		}

		return new Comment({
			content: props.content,
			feedbackId: props.feedbackId,
			authorId: props.authorId,
			parentId: props.parentId ?? null,

			upvotesCount: 0,
			enabled: true,
			createdAt: new Date(),
			updatedAt: new Date(),
		})
	}

	static rebuild(props: CommentProps, id: number): Comment {
		return new Comment(props, id)
	}

	public updateContent(newContent: string): void {
		if (newContent.trim().length < 2) {
			throw new CommentContentTooShortError(2)
		}
		this.props.content = newContent
		this.props.updatedAt = new Date()
	}

	// Getters
	get content() {
		return this.props.content
	}

	get feedbackId() {
		return this.props.feedbackId
	}

	get authorId() {
		return this.props.authorId
	}

	get parentId() {
		return this.props.parentId
	}

	get upvotesCount() {
		return this.props.upvotesCount
	}

	get isUpvoted() {
		return this.props.hasUpvoted
	}

	get enabled() {
		return this.props.enabled
	}

	get createdAt() {
		return this.props.createdAt
	}

	get updatedAt() {
		return this.props.updatedAt
	}

	get replies() {
		return this.props.replies
	}

	addReply(reply: Comment) {
		this.props.replies?.push(reply)
	}
}
