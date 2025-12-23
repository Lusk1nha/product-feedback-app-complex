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
import { AuthFactory } from '../../factories/auth.factory'
import { LoginUseCase } from 'src/modules/iam/application/use-cases/auth/login.usecase'

describe('User - Update (E2E)', () => {
	let app: INestApplication
	let db: NodePgDatabase<typeof schema>
	let userFactory: UserFactory
	let authFactory: AuthFactory

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
		const loginUseCase = moduleFixture.get(LoginUseCase)

		userFactory = new UserFactory(registerUseCase)
		authFactory = new AuthFactory(loginUseCase)
	})

	// Limpa o banco ANTES de cada teste para garantir isolamento
	beforeEach(async () => {
		await db.execute(sql`TRUNCATE TABLE users RESTART IDENTITY CASCADE`)
	})

	afterAll(async () => {
		await app.close()
	})

	const createAuthenticatedUser = async () => {
		const { email, originalPassword, user } = await userFactory.make()
		const { accessToken } = await authFactory.authenticate(
			user,
			originalPassword,
		)

		return { accessToken, user, email }
	}

	describe('Update User', () => {
		it('should update user successfully', async () => {
			const { accessToken, user, email } = await createAuthenticatedUser()

			const response = await request(app.getHttpServer())
				.put(`/users/${user.id}`)
				.set('Authorization', `Bearer ${accessToken}`)
				.send({
					username: 'new-username',
					fullName: 'New Full Name',
					avatarUrl: 'https://example.com/new-avatar.jpg',
				})
				.expect(200)

			expect(response.body).toEqual({
				id: user.id,
				username: 'new-username',
				fullName: 'New Full Name',
				avatarUrl: 'https://example.com/new-avatar.jpg',
				email: email,
				role: 'USER',
				createdAt: expect.any(String),
				updatedAt: expect.any(String),
			})
		})
	})
})
