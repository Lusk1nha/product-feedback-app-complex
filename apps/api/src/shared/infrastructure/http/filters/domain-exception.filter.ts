import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpStatus,
	Logger,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { DomainError } from 'src/shared/domain/errors/domain.error'

// ✅ CORREÇÃO: Usar os códigos em CAIXA_ALTA (SNAKE_CASE)
const ERROR_STATUS_MAP: Record<string, HttpStatus> = {
	// Common
	INVALID_EMAIL: HttpStatus.BAD_REQUEST,

	// Auth & Permissions
	INVALID_CREDENTIALS: HttpStatus.UNAUTHORIZED, // <--- Agora vai bater!
	INVALID_REFRESH_TOKEN: HttpStatus.UNAUTHORIZED,
	PERMISSION_DENIED: HttpStatus.FORBIDDEN,
	USER_NOT_FOUND: HttpStatus.NOT_FOUND,

	// Conflicts & Validation
	USER_ALREADY_EXISTS: HttpStatus.CONFLICT,
	USER_CONFLICT: HttpStatus.CONFLICT,
	USER_USERNAME_TOO_SHORT: HttpStatus.BAD_REQUEST,
}

@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger(DomainExceptionFilter.name)

	catch(exception: DomainError, host: ArgumentsHost) {
		const ctx = host.switchToHttp()
		const response = ctx.getResponse<Response>()
		const request = ctx.getRequest<Request>()

		// Prioriza o .code, se não tiver usa o nome da classe, se não tiver 'UNKNOWN'
		const errorCode = exception.code || exception.constructor.name || 'UNKNOWN'

		// Se não achar no mapa, cai no BAD_REQUEST (400)
		const status = ERROR_STATUS_MAP[errorCode] || HttpStatus.BAD_REQUEST

		// --- DICA DE DEBUG ---
		// Se ainda der erro, descomente isso para ver o que está chegando
		// this.logger.debug(`Recebido ErrorCode: "${errorCode}" | Mapeado para Status: ${status}`);

		if (status >= 500) {
			this.logger.error(`Domain Error: ${errorCode}`, exception.stack)
		} else {
			this.logger.warn(`Domain Error: ${errorCode} - ${exception.message}`)
		}

		response.status(status).json({
			statusCode: status,
			error: errorCode,
			message: exception.message,
			path: request.url,
			method: request.method,
			timestamp: new Date().toISOString(),
		})
	}
}
