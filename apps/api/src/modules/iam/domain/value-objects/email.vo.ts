import { ValueObject } from 'src/shared/domain/value-objects/base.vo'
import { InvalidEmailError } from '../errors/invalid-email.error'

interface EmailProps {
	value: string
}

export class Email extends ValueObject<EmailProps> {
	private constructor(props: EmailProps) {
		super(props)
	}

	static create(email: string): Email {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

		if (!emailRegex.test(email)) {
			throw new InvalidEmailError(email)
		}

		return new Email({ value: email.toLowerCase() })
	}

	getValue(): string {
		return this.props.value
	}

	get value(): string {
		return this.props.value
	}
}
