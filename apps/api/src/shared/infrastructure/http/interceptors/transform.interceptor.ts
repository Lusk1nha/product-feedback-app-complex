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
	meta?: any // 👈 Adicionamos o campo opcional meta
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

		const ignoreTransform = this.reflector.getAllAndOverride<boolean>(
			IGNORE_TRANSFORM_KEY,
			[context.getHandler(), context.getClass()],
		)

		if (ignoreTransform) {
			return next.handle()
		}

		const message = this.reflector.getAllAndOverride<string>(
			RESPONSE_MESSAGE_KEY,
			[context.getHandler(), context.getClass()],
		)

		return next.handle().pipe(
			map((data) => {
				const finalMessage =
					message || (data && data.message ? data.message : null)

				// --- LÓGICA DE PAGINAÇÃO INTELIGENTE ---
				// Verifica se o retorno tem o formato { data: [], meta: {} }
				const isPaginated =
					data &&
					typeof data === 'object' &&
					'data' in data &&
					'meta' in data &&
					Array.isArray(data.data)

				// Se for paginado, extraímos o meta para fora do 'data' principal
				if (isPaginated) {
					return {
						statusCode: response.statusCode,
						message: finalMessage,
						data: data.data, // 👈 A lista vai direto aqui
						meta: data.meta, // 👈 O meta fica no nível raiz
						timestamp: new Date().toISOString(),
						path: request.url,
					}
				}

				// Fluxo padrão para respostas normais (ex: create, getById)
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
