import { USER_REPOSITORY } from 'src/modules/iam/domain/repositories/user.repository.interface'
import { DeleteUserUseCase } from './delete-user.usecase'
import { Test, TestingModule } from '@nestjs/testing'
import { PERMISSION_SERVICE } from '../../ports/permission.service.interface'
import { User } from 'src/modules/iam/domain/entities/user.entity'
import { faker } from '@faker-js/faker/.'
import { UserRole } from 'src/modules/iam/domain/enums/user-role.enum'
import { UserNotFoundError } from 'src/modules/iam/domain/errors/user-not-found.error'

const mockUserRepository = {
	findByIdOrThrow: jest.fn(),
	delete: jest.fn(),
}

const mockPermissionService = {
	ensureCan: jest.fn(),
}

describe('DeleteUserUseCase', () => {
	let useCase: DeleteUserUseCase

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				DeleteUserUseCase,
				{
					provide: USER_REPOSITORY,
					useValue: mockUserRepository,
				},
				{
					provide: PERMISSION_SERVICE,
					useValue: mockPermissionService,
				},
			],
		}).compile()

		useCase = module.get<DeleteUserUseCase>(DeleteUserUseCase)
		jest.clearAllMocks()
	})

	it('should delete user successfully', async () => {
		const user = User.create({
			username: faker.internet.username(),
			email: faker.internet.email(),
			fullName: faker.person.fullName(),
			role: UserRole.USER,
		})

		mockUserRepository.findByIdOrThrow.mockResolvedValue(user)
		mockPermissionService.ensureCan.mockImplementation(() => undefined)

		await useCase.execute({
			currentUser: user,
			targetUserId: user.id,
		})

		expect(mockUserRepository.delete).toHaveBeenCalledWith(user)
	})

	it('should throw UserNotFoundError if user is not found', async () => {
		const user = User.create({
			username: faker.internet.username(),
			email: faker.internet.email(),
			fullName: faker.person.fullName(),
			role: UserRole.USER,
		})

		mockUserRepository.findByIdOrThrow.mockRejectedValue(
			new UserNotFoundError(),
		)

		await expect(
			useCase.execute({
				currentUser: user,
				targetUserId: user.id,
			}),
		).rejects.toThrow(UserNotFoundError)

		expect(mockUserRepository.delete).not.toHaveBeenCalled()
	})
})
