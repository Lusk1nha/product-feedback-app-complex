import { ValueObject } from 'src/shared/domain/value-objects/base.vo'

export interface FeedbackStatusProps {
	slug: string
	label: string
	hexColor: string
	order: number
	includeInRoadmap: boolean
	enabled?: boolean
	createdAt: Date
	updatedAt: Date
}

export class FeedbackStatus extends ValueObject<FeedbackStatusProps> {
	private constructor(props: FeedbackStatusProps) {
		super(props)
	}

	static create(props: FeedbackStatusProps): FeedbackStatus {
		return new FeedbackStatus(props)
	}

	get slug(): string {
		return this.props.slug
	}

	get label(): string {
		return this.props.label
	}

	get hexColor(): string {
		return this.props.hexColor
	}

	get order(): number {
		return this.props.order
	}

	get enabled(): boolean {
		return this.props.enabled ?? true
	}

	includeInRoadmap(): boolean {
		return this.props.includeInRoadmap
	}

	get createdAt(): Date {
		return this.props.createdAt
	}

	get updatedAt(): Date {
		return this.props.updatedAt
	}

	getValue(): FeedbackStatusProps {
		return this.props
	}
}
