import * as request from 'supertest'
import * as schema from '../../../src/shared/infrastructure/database/schema'

import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common' // Importe ValidationPipe
import { AppModule } from '../../../src/app.module'
import { DRIZZLE_PROVIDER } from '../../../src/shared/infrastructure/database/database.module'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { sql } from 'drizzle-orm'
import { faker } from '@faker-js/faker'
import { DomainExceptionFilter } from 'src/shared/infrastructure/http/filters/domain-exception.filter'
import { ThrottlerGuard } from '@nestjs/throttler'

describe('Authentication - Register User (E2E)', () => {
  let app: INestApplication
  let db: NodePgDatabase<typeof schema>

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile()

    app = moduleFixture.createNestApplication()

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    )

    app.useGlobalFilters(new DomainExceptionFilter())

    db = moduleFixture.get(DRIZZLE_PROVIDER)
    await app.init()
  })

  beforeEach(async () => {
    await db.execute(sql`TRUNCATE TABLE users RESTART IDENTITY CASCADE`)
  })

  afterAll(async () => {
    await app.close()
  })

  it('/auth/register (POST) - Success', async () => {
    const payload = {
      username: faker.internet.username(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      fullName: faker.person.fullName(),
    }

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(payload)
      .expect(201)

    expect(response.statusCode).toBe(201)
  })

  it('/auth/register (POST) - Fail (Duplicate Email)', async () => {
    const email = faker.internet.email().toLowerCase()

    // Cria o primeiro
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        username: faker.internet.username(),
        email,
        password: faker.internet.password(),
        fullName: faker.person.fullName(),
      })
      .expect(201)

    // Tenta criar o segundo (Duplicado)
    const payload = {
      username: faker.internet.username(),
      email,
      password: faker.internet.password(),
      fullName: faker.person.fullName(),
    }

    // Agora o Filter vai pegar o UserAlreadyExistsError e transformar em 409
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(payload)
      .expect(409)
  })

  it('/auth/register (POST) - Fail (Validation)', async () => {
    const payload = {
      username: 'ab',
      email: 'not-an-email',
      password: 'short',
      fullName: faker.person.fullName(),
    }

    // ValidationPipe pega isso antes do domínio
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(payload)
      .expect(400)
  })
})
