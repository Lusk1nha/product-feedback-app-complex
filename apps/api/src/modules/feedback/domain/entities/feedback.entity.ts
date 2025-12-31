import { BaseEntity } from 'src/shared/domain/entities/base.entity'
import { FeedbackTitleTooShortError } from '../errors/feedback-title-too-short.error'
import { FeedbackDescriptionTooShortError } from '../errors/feedback-description-too-short.error'

export interface FeedbackProps {
	title: string
	description: string

	authorId: number
	categorySlug: string
	statusSlug: string

	upvotesCount: number
	hasUpvoted?: boolean // Propriedade de leitura (se o usuário atual já votou)

	enabled: boolean
	createdAt: Date
	updatedAt: Date
}

export class Feedback extends BaseEntity {
	private props: FeedbackProps

	private constructor(props: FeedbackProps, id?: number) {
		super({ id })
		this.props = props
	}

	static create(props: {
		title: string
		description: string
		categorySlug: string
		authorId: number
	}): Feedback {
		if (props.title.length < 3) {
			throw new FeedbackTitleTooShortError(3)
		}

		if (props.description.length < 10) {
			throw new FeedbackDescriptionTooShortError(10)
		}

		return new Feedback({
			title: props.title,
			description: props.description,
			authorId: props.authorId,
			categorySlug: props.categorySlug,

			// Defaults na criação
			statusSlug: 'suggestion',
			upvotesCount: 0,
			enabled: true,

			createdAt: new Date(),
			updatedAt: new Date(),
		})
	}

	// Rebuild: Para carregar do banco (sem validação de criação)
	static rebuild(props: FeedbackProps, id: number): Feedback {
		return new Feedback(props, id)
	}

	update(params: {
		title?: string
		description?: string
		categorySlug?: string
		statusSlug?: string
	}) {
		if (params.title !== undefined) {
			if (params.title.length < 3) {
				throw new FeedbackTitleTooShortError(3)
			}

			this.props.title = params.title
		}

		if (params.description !== undefined) {
			if (params.description.length < 10) {
				throw new FeedbackDescriptionTooShortError(10)
			}

			this.props.description = params.description
		}

		if (params.categorySlug !== undefined) {
			this.props.categorySlug = params.categorySlug
		}

		if (params.statusSlug !== undefined) {
			this.props.statusSlug = params.statusSlug
		}
	}

	// Getters
	get title() {
		return this.props.title
	}

	get description() {
		return this.props.description
	}

	get authorId() {
		return this.props.authorId
	}

	get categorySlug() {
		return this.props.categorySlug
	}

	get statusSlug() {
		return this.props.statusSlug
	}

	get upvotesCount() {
		return this.props.upvotesCount
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

	get isUpvoted() {
		return this.props.hasUpvoted
	}
}
