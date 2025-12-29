import { ValueObject } from 'src/shared/domain/value-objects/base.vo'

interface CategoryProps {
	slug: string
	label: string
	order: number
	enabled?: boolean
	createdAt: Date
	updatedAt: Date
}

export class FeedbackCategory extends ValueObject<CategoryProps> {
	private constructor(props: CategoryProps) {
		super(props)
	}

	static create(props: CategoryProps): FeedbackCategory {
		return new FeedbackCategory(props)
	}

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

	getValue(): CategoryProps {
		return this.props
	}
}
