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

describe('Authentication - Logout (E2E)', () => {
	let app: INestApplication
	let db: NodePgDatabase<typeof schema>

	let userFactory: UserFactory

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile()

		app = moduleFixture.createNestApplication()
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

		db = moduleFixture.get(DRIZZLE_PROVIDER)

		const registerUseCase = moduleFixture.get(RegisterUseCase)
		userFactory = new UserFactory(registerUseCase)
	})

	afterEach(async () => {
		await db.execute(sql`TRUNCATE TABLE users RESTART IDENTITY CASCADE`)
		await db.execute(sql`TRUNCATE TABLE accounts RESTART IDENTITY CASCADE`)
	})

	afterAll(async () => {
		if (app) {
			await app.close()
		}
	})

	describe('/auth/logout (POST)', () => {
		it('should logout successfully and return httpOnly cookies', async () => {
			const { email, originalPassword } = await userFactory.make()

			const response = await request(app.getHttpServer())
				.post('/auth/login')
				.send({
					email,
					password: originalPassword,
				})
				.expect(200)

			expect(response.statusCode).toBe(200)

			const cookies = (
				response.headers['set-cookie'] as unknown as string[]
			).join(';')
			expect(cookies).toContain('accessToken=')
			expect(cookies).toContain('refreshToken=')
			expect(cookies).toContain('HttpOnly')

			const logoutResponse = await request(app.getHttpServer())
				.post('/auth/logout')
				.set('Cookie', cookies)
				.expect(200)

			expect(logoutResponse.statusCode).toBe(200)

			const cookiesAfterLogout = (
				logoutResponse.headers['set-cookie'] as unknown as string[]
			).join(';')
			expect(cookiesAfterLogout).toContain('accessToken=')
			expect(cookiesAfterLogout).toContain('refreshToken=')
			expect(cookiesAfterLogout).toContain('HttpOnly')
		})
	})
})
