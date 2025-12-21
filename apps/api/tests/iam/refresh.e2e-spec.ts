import * as request from 'supertest'
import * as cookieParser from 'cookie-parser'
import * as schema from '../../src/shared/infrastructure/database/schema'

import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { AppModule } from '../../src/app.module'
import { DRIZZLE_PROVIDER } from '../../src/shared/infrastructure/database/database.module'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { sql } from 'drizzle-orm'
import { DomainExceptionFilter } from '../../src/shared/infrastructure/http/filters/domain-exception.filter'
import { UserFactory } from '../factories/user.factory'
import { RegisterUseCase } from '../../src/modules/iam/application/use-cases/auth/register.usecase'
import { InvalidRefreshTokenError } from 'src/modules/iam/domain/errors/invalid-refresh-token.error'

describe('Authentication - Refresh Token (E2E)', () => {
  let app: INestApplication
  let db: NodePgDatabase<typeof schema>

  let userFactory: UserFactory

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.use(cookieParser())
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }))
    app.useGlobalFilters(new DomainExceptionFilter())

    await app.init()

    db = moduleFixture.get(DRIZZLE_PROVIDER)

    const registerUseCase = moduleFixture.get(RegisterUseCase)
    userFactory = new UserFactory(registerUseCase)
  })

  beforeEach(async () => {
    await db.execute(sql`TRUNCATE TABLE users RESTART IDENTITY CASCADE`)
    await db.execute(sql`TRUNCATE TABLE accounts RESTART IDENTITY CASCADE`)
  })

  afterAll(async () => {
    if (app) {
      await app.close()
    }
  })

  describe('/auth/refresh (POST)', () => {
    it('should refresh successfully and return httpOnly cookies', async () => {
      const { email, originalPassword } = await userFactory.make()

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email,
          password: originalPassword,
        })
        .expect(200)

      expect(loginResponse.body).toEqual({ message: 'Logged in successfully' })

      const cookies = (loginResponse.headers['set-cookie'] as unknown as string[]).join(';')
      expect(cookies).toContain('accessToken=')
      expect(cookies).toContain('refreshToken=')
      expect(cookies).toContain('HttpOnly')

      const refreshResponse = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', cookies)
        .expect(200)

      expect(refreshResponse.body).toEqual({ message: 'Tokens refreshed successfully' })

      const refreshCookies = (refreshResponse.headers['set-cookie'] as unknown as string[]).join(';')
      expect(refreshCookies).toContain('accessToken=')
      expect(refreshCookies).toContain('refreshToken=')
      expect(refreshCookies).toContain('HttpOnly')
    })

    it('should throw 401 with invalid refresh token', async () => {
      const { email, originalPassword } = await userFactory.make()

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email,
          password: originalPassword,
        })
        .expect(200)

      expect(loginResponse.body).toEqual({ message: 'Logged in successfully' })

      const cookies = (loginResponse.headers['set-cookie'] as unknown as string[]).join(';')
      expect(cookies).toContain('accessToken=')
      expect(cookies).toContain('refreshToken=')
      expect(cookies).toContain('HttpOnly')

      const refreshResponse = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', 'accessToken=invalidAccessToken; refreshToken=invalidRefreshToken')
        .expect(401)

      expect(refreshResponse.body).toEqual(
        expect.objectContaining({
          message: new InvalidRefreshTokenError().message,
          statusCode: 401,
          error: 'InvalidRefreshTokenError',
        }),
      )
    })
  })
})
