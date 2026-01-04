import { BaseEntity } from '@/shared/domain/entities/base.entity'

export interface FeedbackStatusProps {
	slug: string
	label: string
	description: string | null
	hexColor: string
	order: number
	includeInRoadmap: boolean
	enabled: boolean
	createdAt: Date
	updatedAt: Date
}

export class FeedbackStatus extends BaseEntity {
	private props: FeedbackStatusProps

	private constructor(props: FeedbackStatusProps) {
		super(props)
		this.props = props
	}

	static create(props: FeedbackStatusProps): FeedbackStatus {
		return new FeedbackStatus(props)
	}

	// Identificador Principal (Identity)
	get slug(): string {
		return this.props.slug
	}

	get label(): string {
		return this.props.label
	}

	get description(): string | null {
		return this.props.description
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
