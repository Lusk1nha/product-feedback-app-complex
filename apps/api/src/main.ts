import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { AppModule } from './app.module'
import { Env } from './shared/infrastructure/environment/env.schema'
import {
	configureCors,
	configureDocumentation,
	configurePerformance,
	configurePipesAndFilters,
	configureResponseDecorators,
	configureSecurity,
	configureVersioning,
} from './shared/infrastructure/http/app.setup'

import { Logger } from 'nestjs-pino'

async function bootstrap() {
	const app = await NestFactory.create(AppModule, { bufferLogs: true })

	const logger = app.get(Logger)
	app.useLogger(logger)

	const configService = app.get<ConfigService<Env, true>>(ConfigService)

	app.setGlobalPrefix('api')

	configureSecurity(app)
	configurePipesAndFilters(app)
	configureResponseDecorators(app)
	configurePerformance(app)
	configureVersioning(app)

	configureDocumentation(app, configService)

	const frontendUrl = configureCors(app, configService)

	// 📝 Configuração de desligamento
	app.enableShutdownHooks()

	const port = configService.get('PORT', { infer: true })
	await app.listen(port, '0.0.0.0')

	// ✅ Agora a variável 'logger' existe neste escopo
	logger.log(`🚀 Application is running on: http://localhost:${port}/api`)
	logger.log(`📑 Swagger documentation: http://localhost:${port}/docs`)
	logger.log(`🌍 CORS accepting origin: ${frontendUrl}`)
}

bootstrap()
