import * as cookieParser from 'cookie-parser'
import helmet from 'helmet'

import { INestApplication, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Env, Environment } from '../environment/env.schema'
import { DomainExceptionFilter } from './filters/domain-exception.filter'
import { setupSwaggerWithScalar } from './scalar.setup'
import { ApplicationExceptionFilter } from './filters/application-exception.filter'

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
 * Configurações de Pipes Globais e Filtros de Exceção
 */
export function configurePipesAndFilters(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  app.useGlobalFilters(new DomainExceptionFilter())
  app.useGlobalFilters(new ApplicationExceptionFilter())
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
