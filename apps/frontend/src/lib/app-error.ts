import type { ApiError } from '@/types/api.types'

export class AppError extends Error {
	public readonly statusCode: number
	public readonly path: string
	public readonly method: string

	public readonly raw: ApiError

	constructor(data: ApiError) {
		// O super(message) define a mensagem padrão do Error do JS.
		// Assim, se você fizer alert(error.message), vai aparecer a mensagem do backend.
		super(data.message)

		this.name = 'AppError'
		this.statusCode = data.statusCode
		this.path = data.path
		this.method = data.method
		this.raw = data
	}
}
