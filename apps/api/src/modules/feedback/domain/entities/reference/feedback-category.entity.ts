import { BaseEntity } from '@/shared/domain/entities/base.entity'

export interface FeedbackCategoryProps {
	slug: string
	label: string
	order: number
	enabled: boolean
	createdAt: Date
	updatedAt: Date
}

export class FeedbackCategory extends BaseEntity {
	private props: FeedbackCategoryProps

	private constructor(props: FeedbackCategoryProps) {
		super(props)
		this.props = props
	}

	static create(props: FeedbackCategoryProps): FeedbackCategory {
		return new FeedbackCategory(props)
	}

	// Identificador Principal (Identity)
	get slug(): string {
		return this.props.slug
	}

	get label(): string {
		return this.props.label
	}

	get order(): number {
		return this.props.order
	}

	get enabled(): boolean {
		return this.props.enabled ?? true
	}

	get createdAt(): Date {
		return this.props.createdAt
	}

	get updatedAt(): Date {
		return this.props.updatedAt
	}

	getValue(): FeedbackCategoryProps {
		return this.props
	}
}
