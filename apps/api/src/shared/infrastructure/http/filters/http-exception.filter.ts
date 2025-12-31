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

		// --- 🔍 NOVO: DETECÇÃO DE HEALTH CHECK ---
		// O pacote @nestjs/terminus lança um erro com um formato específico (status, error, details).
		// Se detectarmos esse formato, retornamos direto para facilitar o debug da infraestrutura.
		if (
			typeof exceptionResponse === 'object' &&
			exceptionResponse !== null &&
			'status' in exceptionResponse &&
			'error' in exceptionResponse &&
			'details' in exceptionResponse
		) {
			this.logger.warn(`Health Check Failed: Service Unavailable`)
			return response.status(status).json(exceptionResponse)
		}
		// -----------------------------------------

		let errorCode = 'HTTP_ERROR'
		let message = exception.message

		// Lógica para tratar erros de validação (DTO)
		if (
			typeof exceptionResponse === 'object' &&
			exceptionResponse !== null &&
			'message' in exceptionResponse
		) {
			const rawMessage = (exceptionResponse as any).message

			// O class-validator retorna um array de strings
			if (Array.isArray(rawMessage)) {
				errorCode = 'VALIDATION_ERROR'
				message = rawMessage.join('; ')
			} else {
				message = rawMessage
			}

			// Se tiver o campo 'error' no body
			if ((exceptionResponse as any).error) {
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
