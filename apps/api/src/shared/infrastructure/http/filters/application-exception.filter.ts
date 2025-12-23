import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpStatus,
	Logger,
} from '@nestjs/common'
import { Response } from 'express'
import { ApplicationError } from 'src/shared/domain/errors/application.error'

const ERROR_STATUS_MAP: Record<string, HttpStatus> = {
	RefreshTokenNotFoundError: HttpStatus.BAD_REQUEST,
}

@Catch(ApplicationError)
export class ApplicationExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger(ApplicationExceptionFilter.name)

	catch(exception: ApplicationError, host: ArgumentsHost) {
		const ctx = host.switchToHttp()
		const response = ctx.getResponse<Response>()
		const request = ctx.getRequest<Request>()

		const errorCode = exception.code || exception.constructor.name

		const status = ERROR_STATUS_MAP[errorCode] || HttpStatus.BAD_REQUEST

		// Se for 500 ou 400 crítico, logamos como error/warn. Se for 404/401 comum, logamos como verbose/debug.
		if (status >= 500) {
			this.logger.error(`Application Error: ${errorCode}`, exception.stack)
		} else {
			this.logger.warn(`Application Error: ${errorCode} - ${exception.message}`)
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
