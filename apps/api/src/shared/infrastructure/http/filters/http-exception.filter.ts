import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	Logger,
} from '@nestjs/common'
import { Request, Response } from 'express'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger(HttpExceptionFilter.name)

	catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp()
		const response = ctx.getResponse<Response>()
		const request = ctx.getRequest<Request>()
		const status = exception.getStatus()

		// O Nest retorna o corpo do erro (message, error, statusCode) aqui
		const exceptionResponse = exception.getResponse()

		let errorCode = 'HTTP_ERROR'
		let message = exception.message

		// Lógica para tratar erros de validação (DTO)
		if (
			typeof exceptionResponse === 'object' &&
			exceptionResponse !== null &&
			'message' in exceptionResponse
		) {
			const rawMessage = (exceptionResponse as any).message

			// O class-validator retorna um array de strings, ex: ["email must be an email"]
			// Vamos juntar tudo ou pegar o primeiro para ficar limpo no frontend
			if (Array.isArray(rawMessage)) {
				errorCode = 'VALIDATION_ERROR'
				message = rawMessage.join('; ') // Ex: "email inválido; senha curta"
			} else {
				message = rawMessage
			}

			// Se tiver o campo 'error' no body (ex: "Bad Request"), usamos como código
			if ((exceptionResponse as any).error) {
				// Se já definimos VALIDATION_ERROR, mantemos, senão pegamos do Nest (ex: Not Found)
				errorCode =
					errorCode === 'VALIDATION_ERROR'
						? 'VALIDATION_ERROR'
						: (exceptionResponse as any).error.toUpperCase().replace(/\s/g, '_')
			}
		}

		this.logger.warn(`Http Exception: ${errorCode} - ${message}`)

		response.status(status).json({
			statusCode: status,
			error: errorCode,
			message: message,
			path: request.url,
			method: request.method,
			timestamp: new Date().toISOString(),
		})
	}
}
