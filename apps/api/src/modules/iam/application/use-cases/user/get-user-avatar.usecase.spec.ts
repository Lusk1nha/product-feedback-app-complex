import { Test, TestingModule } from '@nestjs/testing'
import { GetProfileUseCase } from './get-profile.usecase'
import { USER_REPOSITORY } from 'src/modules/iam/domain/repositories/user.repository.interface'
import { User } from 'src/modules/iam/domain/entities/user.entity'
import { faker } from '@faker-js/faker/.'
import { UserRole } from 'src/modules/iam/domain/enums/user-role.enum'
import { UserNotFoundError } from 'src/modules/iam/domain/errors/user-not-found.error'
import { GetUserAvatarUseCase } from './get-user-avatar.usecase'

const mockUserRepository = {
	findAvatarById: jest.fn(),
}

describe('GetUserAvatarUseCase', () => {
	let useCase: GetUserAvatarUseCase

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				GetUserAvatarUseCase,
				{
					provide: USER_REPOSITORY,
					useValue: mockUserRepository,
				},
			],
		}).compile()

		useCase = module.get<GetUserAvatarUseCase>(GetUserAvatarUseCase)
		jest.clearAllMocks()
	})

	it('should get user avatar', async () => {
		const userId = 1
		const emailValue = faker.internet.email()

		const user: User = User.create({
			username: faker.internet.username(),
			email: emailValue,
			fullName: faker.person.fullName(),
			avatarUrl: faker.image.avatar(),
			role: faker.helpers.enumValue(UserRole),
		})

		mockUserRepository.findAvatarById.mockResolvedValue(user.avatarUrl)

		const result = await useCase.execute({ userId })

		expect(result).toEqual(user.avatarUrl)
		expect(mockUserRepository.findAvatarById).toHaveBeenCalledWith(userId)
	})

	it('should throw UserNotFoundError if user is not found', async () => {
		const userId = 1
		mockUserRepository.findAvatarById.mockRejectedValue(new UserNotFoundError())

		await expect(useCase.execute({ userId })).rejects.toThrow(UserNotFoundError)
		expect(mockUserRepository.findAvatarById).toHaveBeenCalledWith(userId)
	})
})
