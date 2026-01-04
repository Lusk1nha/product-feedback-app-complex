import { BaseEntity } from 'src/shared/domain/entities/base.entity'
import { FeedbackTitleTooShortError } from '../errors/feedback-title-too-short.error'
import { FeedbackDescriptionTooShortError } from '../errors/feedback-description-too-short.error'
import { FeedbackCategory } from './reference/feedback-category.entity'
import { FeedbackStatus } from './reference/feedback-status.entity'
import { FeedbackCategoryDisabledError } from '../errors/feedback-category-disabled.error'
import { FeedbackStatusDisabledError } from '../errors/feedback-status-disabled.error'

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
		authorId: number
		// MUDANÇA: Exigimos os objetos, não as strings
		category: FeedbackCategory
		initialStatus: FeedbackStatus
	}): Feedback {
		// 1. Validações de Texto
		if (props.title.trim().length < 3) {
			throw new FeedbackTitleTooShortError(3)
		}

		if (props.description.trim().length < 10) {
			throw new FeedbackDescriptionTooShortError(10)
		}

		if (!props.category.enabled) {
			throw new FeedbackCategoryDisabledError()
		}

		if (!props.initialStatus.enabled) {
			throw new FeedbackStatusDisabledError()
		}

		return new Feedback({
			title: props.title,
			description: props.description,
			authorId: props.authorId,

			// Extraímos os slugs seguros para salvar no estado interno
			categorySlug: props.category.slug,
			statusSlug: props.initialStatus.slug,

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

	public update(params: {
		title?: string
		description?: string
		newCategory?: FeedbackCategory
		newStatus?: FeedbackStatus
	}): void {
		this.updateTitle(params.title)
		this.updateDescription(params.description)
		this.changeCategory(params.newCategory)
		this.changeStatus(params.newStatus)
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

	// --- Métodos Granulares (SRP dentro da Classe) ---
	private updateTitle(title?: string): void {
		if (title === undefined) return
		if (title.trim().length < 3) throw new FeedbackTitleTooShortError(3)
		this.props.title = title
	}

	private updateDescription(description?: string): void {
		if (description === undefined) return
		if (description.trim().length < 10)
			throw new FeedbackDescriptionTooShortError(10)
		this.props.description = description
	}

	private changeCategory(category?: FeedbackCategory): void {
		if (!category) return

		if (!category.enabled) {
			throw new FeedbackCategoryDisabledError()
		}
		this.props.categorySlug = category.slug
	}

	private changeStatus(status?: FeedbackStatus): void {
		if (!status) return

		if (!status.enabled) {
			throw new FeedbackStatusDisabledError()
		}

		this.props.statusSlug = status.slug
	}
}
