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
						genReqId: (req, res) => {
							const id = req.headers['x-request-id'] || randomUUID()
							res.setHeader('X-Request-Id', id)
							return id
						},

						autoLogging: true,
						quietReqLogger: true,

						serializers: {
							req: (req) => ({
								method: req.method,
								url: req.url,
								id: req.id,
							}),
							res: (res) => ({
								statusCode: res.statusCode,
							}),
							err: (err) => err,
						},

						customSuccessMessage: (req, res) => {
							return `${req.method} ${req.url} completed with status ${res.statusCode}`
						},

						transport: !isProduction
							? {
									target: 'pino-pretty',
									options: {
										singleLine: true,
										colorize: true,
										translateTime: 'SYS:HH:MM:ss',
										ignore: 'pid,hostname,reqId,res',
									},
								}
							: undefined,

						level: isProduction ? 'info' : 'debug',
					},
				}
			},
		}),

		EventEmitterModule.forRoot(),

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
