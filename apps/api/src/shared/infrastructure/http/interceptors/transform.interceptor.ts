import {
	Injectable,
	NestInterceptor,
	ExecutionContext,
	CallHandler,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { Reflector } from '@nestjs/core'
import {
	RESPONSE_MESSAGE_KEY,
	IGNORE_TRANSFORM_KEY,
} from '../decorators/response.decorator'

export interface Response<T> {
	statusCode: number
	message?: string
	data: T
	timestamp: string
	path: string
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
	T,
	Response<T>
> {
	constructor(private reflector: Reflector) {}

	intercept(
		context: ExecutionContext,
		next: CallHandler,
	): Observable<Response<T>> {
		const ctx = context.switchToHttp()
		const response = ctx.getResponse()
		const request = ctx.getRequest()

		// 1. Checa se a rota deve ser IGNORADA (ex: downloads, health check)
		const ignoreTransform = this.reflector.getAllAndOverride<boolean>(
			IGNORE_TRANSFORM_KEY,
			[context.getHandler(), context.getClass()],
		)

		if (ignoreTransform) {
			return next.handle()
		}

		// 2. Busca mensagem customizada (ex: "Logged in successfully")
		const message = this.reflector.getAllAndOverride<string>(
			RESPONSE_MESSAGE_KEY,
			[context.getHandler(), context.getClass()],
		)

		return next.handle().pipe(
			map((data) => {
				// Se o controller retornar apenas { message: '...' }, usamos isso
				// Isso ajuda se você não usar o decorator, mas retornar objeto com message
				const finalMessage =
					message || (data && data.message ? data.message : null)

				// Se o data for exatamente o objeto { message: ... }, podemos limpar o data
				// para não duplicar, ou manter. Aqui mantemos a estrutura padrão.

				return {
					statusCode: response.statusCode,
					message: finalMessage,
					data: data ?? null,
					timestamp: new Date().toISOString(),
					path: request.url,
				}
			}),
		)
	}
}
