import { Test, TestingModule } from '@nestjs/testing'
import { LogoutUseCase } from './logout.usecase'
import { USER_REPOSITORY } from 'src/modules/iam/domain/repositories/user.repository.interface'
import { REFRESH_TOKEN_REPOSITORY } from 'src/modules/iam/domain/repositories/refresh-token.repository.interface'
import { User } from 'src/modules/iam/domain/entities/user.entity'
import { faker } from '@faker-js/faker/.'
import { UserRole } from 'src/modules/iam/domain/enums/user-role.enum'
import { UserNotFoundError } from 'src/modules/iam/domain/errors/user-not-found.error'
import { HashingService } from 'src/shared/application/services/hash.service'

const mockUserRepository = {}

const mockRefreshTokenRepository = {
	deleteByTokenHash: jest.fn(),
}

const mockHashingService = {
	hash: jest.fn(),
}

describe('LogoutUseCase', () => {
	let useCase: LogoutUseCase

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				LogoutUseCase,
				{
					provide: USER_REPOSITORY,
					useValue: mockUserRepository,
				},
				{
					provide: REFRESH_TOKEN_REPOSITORY,
					useValue: mockRefreshTokenRepository,
				},
				{
					provide: HashingService,
					useValue: mockHashingService,
				},
			],
		}).compile()

		useCase = module.get<LogoutUseCase>(LogoutUseCase)
		jest.clearAllMocks()
	})

	it('should delete refresh token successfully', async () => {
		const user = User.create({
			username: faker.internet.username(),
			email: faker.internet.email(),
			fullName: faker.person.fullName(),
			role: UserRole.USER,
		})

		const tokenHash = 'tokenHash'
		mockHashingService.hash.mockResolvedValue(tokenHash)
		mockRefreshTokenRepository.deleteByTokenHash.mockImplementation(() =>
			Promise.resolve(),
		)

		await useCase.execute({
			refreshToken: 'refreshToken',
		})

		expect(mockRefreshTokenRepository.deleteByTokenHash).toHaveBeenCalledWith(
			'tokenHash',
		)
	})
})
