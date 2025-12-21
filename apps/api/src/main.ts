import { NestFactory } from '@nestjs/core'
import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AppModule } from './app.module'
import { Env } from './shared/infrastructure/environment/env.schema'
import {
  configureCors,
  configureDocumentation,
  configurePipesAndFilters,
  configureSecurity,
} from './shared/infrastructure/http/app.setup'

async function bootstrap() {
  const logger = new Logger('Bootstrap')

  const app = await NestFactory.create(AppModule)
  const configService = app.get<ConfigService<Env, true>>(ConfigService)

  app.setGlobalPrefix('api')

  configureSecurity(app)
  configurePipesAndFilters(app)
  configureDocumentation(app, configService)

  const frontendUrl = configureCors(app, configService)

  app.enableShutdownHooks()

  const port = configService.get('PORT', { infer: true })
  await app.listen(port)

  logger.log(`🚀 Application is running on: http://localhost:${port}/api`)
  logger.log(`📑 Swagger documentation: http://localhost:${port}/docs`)
  logger.log(`🌍 CORS accepting origin: ${frontendUrl}`)
}

bootstrap()
