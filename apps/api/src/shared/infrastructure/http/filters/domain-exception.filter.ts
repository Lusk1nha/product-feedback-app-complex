import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common'
import { Response } from 'express'
import { DomainError } from 'src/shared/domain/errors/domain.error'
import { UserAlreadyExistsError } from 'src/modules/iam/domain/errors/user-already-exists.error'
import { InvalidEmailError } from 'src/modules/iam/domain/errors/invalid-email.error'
import { InvalidCredentialsError } from 'src/modules/iam/domain/errors/invalid-credentials.error'
import { UserNotFoundError } from 'src/modules/iam/domain/errors/user-not-found.error'
import { InvalidRefreshTokenError } from 'src/modules/iam/domain/errors/invalid-refresh-token.error'

@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly errorStatusMap: Record<string, HttpStatus> = {
    [UserAlreadyExistsError.name]: HttpStatus.CONFLICT, // 409
    [InvalidEmailError.name]: HttpStatus.BAD_REQUEST, // 400
    [InvalidCredentialsError.name]: HttpStatus.UNAUTHORIZED, // 401
    [UserNotFoundError.name]: HttpStatus.UNAUTHORIZED, // 404
    [InvalidRefreshTokenError.name]: HttpStatus.UNAUTHORIZED,
  }

  catch(exception: DomainError, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    // Busca o status no mapa. Se esquecer de mapear, retorna 400 por segurança.
    const status = this.errorStatusMap[exception.constructor.name] || HttpStatus.BAD_REQUEST

    response.status(status).json({
      statusCode: status,
      error: exception.constructor.name,
      message: exception.message,
      timestamp: new Date().toISOString(),
    })
  }
}
