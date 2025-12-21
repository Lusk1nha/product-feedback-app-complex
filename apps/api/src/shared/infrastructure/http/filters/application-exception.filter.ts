import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common'
import { Response } from 'express'
import { ApplicationError } from 'src/shared/domain/errors/application.error'
import { RefreshTokenNotFoundError } from 'src/modules/iam/http/errors/refresh-token-not-found.error'

@Catch(ApplicationError)
export class ApplicationExceptionFilter implements ExceptionFilter {
  private readonly errorStatusMap: Record<string, HttpStatus> = {
    [RefreshTokenNotFoundError.name]: HttpStatus.UNAUTHORIZED,
  }

  catch(exception: ApplicationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    const status = this.errorStatusMap[exception.constructor.name] || HttpStatus.BAD_REQUEST

    response.status(status).json({
      statusCode: status,
      error: exception.constructor.name,
      message: exception.message,
      timestamp: new Date().toISOString(),
    })
  }
}
