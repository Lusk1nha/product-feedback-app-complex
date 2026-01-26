import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { LoggerModule } from 'nestjs-pino'

import { DatabaseModule } from './shared/infrastructure/database/database.module'
import { IamModule } from './modules/iam/iam.module'
import { SharedModule } from './shared/shared.module'
import { validate } from './shared/infrastructure/environment/env.validation'
import {
	Environment,
	Env,
} from './shared/infrastructure/environment/env.schema'
import { FeedbackModule } from './modules/feedback/feedback.module'
import { HealthModule } from './shared/infrastructure/health/health.module'

import { randomUUID } from 'crypto' // 👈 Importe nativo do Node.js
import { RedisModule } from './shared/infrastructure/redis/redis.module'
import { EventEmitterModule } from '@nestjs/event-emitter'

@Module({
	imports: [
		// 1. Configuração Global (Carrega primeiro)
		ConfigModule.forRoot({
			isGlobal: true,
			cache: true,
			expandVariables: true,
			envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
			validate,
		}),

		EventEmitterModule.forRoot(),

		// 2. Throttling (Rate Limiting) Assíncrono
		ThrottlerModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService<Env, true>) => [
				{
					ttl: 60000,
					limit: configService.get('THROTTLE_LIMIT', { infer: true }) || 100,
					ignoreUserAgents: [/googlebot/gi],
					skipIf: () => process.env.NODE_ENV === Environment.Test,
				},
			],
		}),

		// 3. Logger Assíncrono (Pino)
		LoggerModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService<Env, true>) => {
				const isProduction =
					configService.get('NODE_ENV', { infer: true }) ===
					Environment.Production

				return {
					pinoHttp: {
						// 👇 AQUI COMEÇA A MÁGICA DO TRACING
						genReqId: (req, res) => {
							const existingID = req.id ?? req.headers['x-request-id']
							if (existingID) return existingID

							const id = randomUUID()
							res.setHeader('X-Request-Id', id) // Devolve no header para o Frontend saber
							return id
						},
						// 👆 FIM DA MÁGICA

						customProps: (req, res) => ({
							context: 'HTTP',
						}),
						transport: !isProduction
							? {
									target: 'pino-pretty',
									options: {
										singleLine: true,
										colorize: true,
										translateTime: 'SYS:standard',
										ignore: 'pid,hostname', // Deixa o log mais limpo em dev
									},
								}
							: undefined,
						redact: {
							paths: [
								'req.headers.authorization',
								'req.body.password',
								'req.body.confirmPassword',
							],
							remove: true,
						},
						// Em produção 'info' é bom, mas 'warn' economiza mais disco se tiver muito tráfego
						level: isProduction ? 'info' : 'debug',
					},
				}
			},
		}),

		// 4. Módulos de Domínio e Infraestrutura
		DatabaseModule,
		RedisModule,

		SharedModule,
		HealthModule,

		IamModule,
		FeedbackModule,
	],
	controllers: [],
	providers: [
		// Torna o Throttler Global
		{ provide: APP_GUARD, useClass: ThrottlerGuard },
	],
})
export class AppModule {}
