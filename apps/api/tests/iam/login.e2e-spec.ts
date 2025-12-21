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
import { CreateUserUseCase } from '../../src/modules/iam/application/use-cases/users/create-user.usecase'

describe('Authentication - Login (E2E)', () => {
  let app: INestApplication
  let db: NodePgDatabase<typeof schema>

  // Variável para nossa factory
  let userFactory: UserFactory

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      // REMOVA A FACTORY DAQUI. Deixe vazio ou só com o que for estritamente necessário.
      providers: [],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.use(cookieParser())
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }))
    app.useGlobalFilters(new DomainExceptionFilter())

    await app.init()

    db = moduleFixture.get(DRIZZLE_PROVIDER)

    // --- A CORREÇÃO MÁGICA ---
    // 1. Recuperamos o UseCase que JÁ ESTÁ pronto dentro do AppModule/IamModule
    const createUserUseCase = moduleFixture.get(CreateUserUseCase)

    // 2. Instanciamos a Factory manualmente injetando o UseCase
    userFactory = new UserFactory(createUserUseCase)
  })

  beforeEach(async () => {
    await db.execute(sql`TRUNCATE TABLE users RESTART IDENTITY CASCADE`)
  })

  afterAll(async () => {
    // Verificação de segurança para não quebrar se o app não subir
    if (app) {
      await app.close()
    }
  })

  describe('/auth/login (POST)', () => {
    it('should login successfully and return httpOnly cookies', async () => {
      // Agora a factory funciona perfeitamente
      const { email, originalPassword } = await userFactory.make()

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email,
          password: originalPassword,
        })
        .expect(200)

      expect(response.body).toEqual({ message: 'Logged in successfully' })

      const cookies = (response.headers['set-cookie'] as unknown as string[]).join(';')
      expect(cookies).toContain('accessToken=')
      expect(cookies).toContain('refreshToken=')
      expect(cookies).toContain('HttpOnly')
    })

    it('should throw 401 with invalid password', async () => {
      const { email } = await userFactory.make()

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email,
          password: 'WrongPassword!',
        })
        .expect(401)
    })

    it('should throw 401 with non-existent email', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'ghost@casper.com',
          password: 'AnyPassword',
        })
        .expect(401)
    })

    it('should throw 400 with invalid email format', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'not-an-email',
          password: 'password',
        })
        .expect(400)
    })
  })
})
