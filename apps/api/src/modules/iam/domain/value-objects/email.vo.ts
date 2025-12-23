import { InvalidEmailError } from '../errors/invalid-email.error'

export class Email {
	private readonly value: string

	private constructor(value: string) {
		this.value = value
	}

	static create(email: string): Email {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

		if (!emailRegex.test(email)) {
			throw new InvalidEmailError(email)
		}

		return new Email(email.toLowerCase())
	}

	getValue(): string {
		return this.value
	}
}
