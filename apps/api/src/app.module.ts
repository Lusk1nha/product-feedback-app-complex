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
						customProps: (req, res) => ({
							context: 'HTTP',
						}),
						transport: !isProduction
							? {
									target: 'pino-pretty',
									options: {
										singleLine: true,
										colorize: true,
										translateTime: 'SYS:standard', // Formato de hora legível
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
						level: isProduction ? 'info' : 'debug',
					},
				}
			},
		}),

		// 4. Módulos de Domínio e Infraestrutura
		DatabaseModule,
		SharedModule,
		IamModule,
	],
	controllers: [],
	providers: [
		// Torna o Throttler Global
		{ provide: APP_GUARD, useClass: ThrottlerGuard },
	],
})
export class AppModule {}
