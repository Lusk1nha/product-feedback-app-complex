import * as cookieParser from 'cookie-parser'
import * as compression from 'compression'

import helmet from 'helmet'

import {
	ClassSerializerInterceptor,
	INestApplication,
	ValidationPipe,
	VersioningType,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Env, Environment } from '../environment/env.schema'
import { DomainExceptionFilter } from './filters/domain-exception.filter'
import { setupSwaggerWithScalar } from './scalar.setup'
import { ApplicationExceptionFilter } from './filters/application-exception.filter'
import { TransformInterceptor } from './interceptors/transform.interceptor'
import { Reflector } from '@nestjs/core'
import { HttpExceptionFilter } from './filters/http-exception.filter'

/**
 * Configurações de Segurança (Helmet, Cookies)
 */
export function configureSecurity(app: INestApplication) {
	app.use(cookieParser())

	app.use(
		helmet({
			crossOriginEmbedderPolicy: false,
			contentSecurityPolicy: {
				directives: {
					defaultSrc: [`'self'`, 'unpkg.com'],
					styleSrc: [
						`'self'`,
						`'unsafe-inline'`,
						'cdn.jsdelivr.net',
						'fonts.googleapis.com',
						'unpkg.com',
					],
					fontSrc: [`'self'`, 'fonts.gstatic.com', 'data:'],
					imgSrc: [`'self'`, 'data:', 'cdn.jsdelivr.net'],
					scriptSrc: [
						`'self'`,
						`https: 'unsafe-inline'`,
						`cdn.jsdelivr.net`,
						`'unsafe-eval'`,
					],
				},
			},
		}),
	)
}

/**
 * Configurações de Performance (Compressão)
 */
export function configurePerformance(app: INestApplication) {
	app.use(compression())
}

/**
 * Configurações de Versionamento
 */
export function configureVersioning(app: INestApplication) {
	app.enableVersioning({
		type: VersioningType.URI,
		defaultVersion: '1',
	})
}

/**
 * Configurações de Pipes Globais e Filtros de Exceção
 */
export function configurePipesAndFilters(app: INestApplication) {
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
			transformOptions: { enableImplicitConversion: true },
		}),
	)

	app.useGlobalFilters(
		new HttpExceptionFilter(),
		new DomainExceptionFilter(),
		new ApplicationExceptionFilter(),
	)
}

export function configureResponseDecorators(app: INestApplication) {
	const reflector = app.get(Reflector)
	app.useGlobalInterceptors(
		new TransformInterceptor(reflector),

		new ClassSerializerInterceptor(reflector, {
			excludeExtraneousValues: false, // Se true, só retorna o que tiver @Expose()
		}),
	)
}

/**
 * Configurações de CORS
 */
export function configureCors(
	app: INestApplication,
	configService: ConfigService<Env, true>,
) {
	const frontendUrl = configService.get('FRONTEND_URL', { infer: true })

	app.enableCors({
		origin: frontendUrl, // Importante: '*' quebra com credentials: true
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
		credentials: true,
	})

	return frontendUrl
}

/**
 * Configuração do Swagger/Scalar
 */
export function configureDocumentation(
	app: INestApplication,
	configService: ConfigService<Env, true>,
) {
	if (configService.get('NODE_ENV') !== Environment.Production) {
		setupSwaggerWithScalar(app, '/docs')
	}
}
