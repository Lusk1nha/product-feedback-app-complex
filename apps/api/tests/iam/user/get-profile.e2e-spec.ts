import * as request from 'supertest'
import * as cookieParser from 'cookie-parser'
import * as schema from '../../../src/shared/infrastructure/database/schema'

import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { AppModule } from '../../../src/app.module'
import { DRIZZLE_PROVIDER } from '../../../src/shared/infrastructure/database/database.module'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { sql } from 'drizzle-orm'
import { DomainExceptionFilter } from '../../../src/shared/infrastructure/http/filters/domain-exception.filter'
import { UserFactory } from '../../factories/user.factory'
import { RegisterUseCase } from '../../../src/modules/iam/application/use-cases/auth/register.usecase'

describe('User - Get Profile (E2E)', () => {
  let app: INestApplication
  let db: NodePgDatabase<typeof schema>
  let userFactory: UserFactory

  // --- Setup & Teardown Otimizados ---

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()

    // Configurações globais idênticas ao main.ts
    app.use(cookieParser())
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    )
    app.useGlobalFilters(new DomainExceptionFilter())

    await app.init()

    // Dependências
    db = moduleFixture.get(DRIZZLE_PROVIDER)
    const registerUseCase = moduleFixture.get(RegisterUseCase)
    userFactory = new UserFactory(registerUseCase)
  })

  // Limpa o banco ANTES de cada teste para garantir isolamento
  beforeEach(async () => {
    await db.execute(sql`TRUNCATE TABLE users RESTART IDENTITY CASCADE`)
  })

  afterAll(async () => {
    await app.close()
  })

  // --- Helpers ---

  /**
   * Helper para criar usuário, logar e retornar o token.
   * Evita repetição de código nos testes.
   */
  const createAuthenticatedUser = async () => {
    const { email, originalPassword, user } = await userFactory.make()

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: originalPassword })
      .expect(200)

    // Lógica robusta de extração de cookie
    const cookies = response.headers['set-cookie'] as unknown as string[]
    const accessTokenCookie = cookies.find((c) => c.startsWith('accessToken'))

    if (!accessTokenCookie) {
      throw new Error('Access Token cookie not found in login response')
    }

    // Extrai o valor do token (accessToken=xyz; Path=/...)
    const accessToken = accessTokenCookie.split(';')[0].split('=')[1]

    return { accessToken, user, email }
  }

  // --- Testes ---

  describe('/users/me (GET)', () => {
    it('should return user profile and permissions successfully', async () => {
      // 1. Arrange
      const { accessToken, email } = await createAuthenticatedUser()

      // 2. Act
      const response = await request(app.getHttpServer())
        .get('/users/me') // Ajustado para /users/me conforme padrão REST
        .set('Authorization', `Bearer ${accessToken}`)

      // 3. Assert
      expect(response.status).toBe(200)

      // Valida estrutura do retorno (User + Rules)
      expect(response.body).toEqual({
        user: expect.objectContaining({
          email: email,
          id: expect.any(Number),
          role: 'USER', // Validando a Role padrão
        }),
        rules: expect.any(Array), // Validando que o CASL enviou as regras
      })

      // Valida se as regras fazem sentido (Ex: pode ler tudo)
      const hasReadPermission = response.body.rules.some(
        (r: any) => r.action === 'read' && r.subject === 'all',
      )
      expect(hasReadPermission).toBe(true)
    })

    it('users/me/rules (GET)', async () => {
      // 1. Arrange
      const { accessToken } = await createAuthenticatedUser()

      // 2. Act
      const response = await request(app.getHttpServer())
        .get('/users/me/rules')
        .set('Authorization', `Bearer ${accessToken}`)

      // 3. Assert
      expect(response.status).toBe(200)

      // Valida estrutura do retorno (User + Rules)
      expect(response.body).toEqual(expect.any(Array))
    })

    it('should throw 401 Unauthorized when token is missing', async () => {
      await request(app.getHttpServer()).get('/users/me').expect(401)
    })

    it('should throw 401 Unauthorized when token is invalid', async () => {
      await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', 'Bearer invalid-token-123')
        .expect(401)
    })
  })
})
