import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger, // Logger nativo ou do Pino se injetado
} from '@nestjs/common'
import { Request, Response } from 'express'
import { DomainError } from 'src/shared/domain/errors/domain.error'

const ERROR_STATUS_MAP: Record<string, HttpStatus> = {
  // Common
  InvalidEmailError: HttpStatus.BAD_REQUEST,

  // Auth & Permissions
  InvalidCredentialsError: HttpStatus.UNAUTHORIZED, // 401
  InvalidRefreshTokenError: HttpStatus.UNAUTHORIZED, // 401
  PermissionDeniedError: HttpStatus.FORBIDDEN, // 403
  UserNotFoundError: HttpStatus.NOT_FOUND, // 404 (Corrigido de 401)

  // Conflicts & Validation
  UserAlreadyExistsError: HttpStatus.CONFLICT, // 409
  UserConflictError: HttpStatus.CONFLICT, // 409
  UserUsernameTooShortError: HttpStatus.BAD_REQUEST, // 400
}

@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name)

  catch(exception: DomainError, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    // 1. Busca pelo CODE fixo ou pelo nome da classe como fallback
    const errorCode = exception.code || exception.constructor.name

    // 2. Resolve o Status HTTP
    const status = ERROR_STATUS_MAP[errorCode] || HttpStatus.BAD_REQUEST

    // 3. Log do erro (Crucial para debug em produção)
    // Se for 500 ou 400 crítico, logamos como error/warn. Se for 404/401 comum, logamos como verbose/debug.
    if (status >= 500) {
      this.logger.error(`Domain Error: ${errorCode}`, exception.stack)
    } else {
      this.logger.warn(`Domain Error: ${errorCode} - ${exception.message}`)
    }

    // 4. Resposta padronizada (RFC 7807 inspired)
    response.status(status).json({
      statusCode: status,
      error: errorCode, // Útil para o frontend traduzir mensagens (i18n)
      message: exception.message,
      path: request.url, // Ajuda a saber onde deu erro
      method: request.method,
      timestamp: new Date().toISOString(),
    })
  }
}
