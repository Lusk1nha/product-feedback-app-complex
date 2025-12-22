import { Test, TestingModule } from '@nestjs/testing'
import { GetProfileUseCase } from './get-profile.usecase'
import { USER_REPOSITORY } from 'src/modules/iam/domain/repositories/user.repository.interface'
import { User } from 'src/modules/iam/domain/entities/user.entity'
import { faker } from '@faker-js/faker/.'
import { UserRole } from 'src/modules/iam/domain/enums/user-role.enum'
import { UserNotFoundError } from 'src/modules/iam/domain/errors/user-not-found.error'

const mockUserRepository = {
  findByIdOrThrow: jest.fn(),
}

describe('GetProfileUseCase', () => {
  let useCase: GetProfileUseCase

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProfileUseCase,
        {
          provide: USER_REPOSITORY,
          useValue: mockUserRepository,
        },
      ],
    }).compile()

    useCase = module.get<GetProfileUseCase>(GetProfileUseCase)
    jest.clearAllMocks()
  })

  it('should get user profile', async () => {
    const userId = 1
    const emailValue = faker.internet.email()

    const user: User = User.create({
      username: faker.internet.username(),
      email: emailValue,
      fullName: faker.person.fullName(),
      avatarUrl: faker.image.avatar(),
      role: faker.helpers.enumValue(UserRole),
    })

    mockUserRepository.findByIdOrThrow.mockResolvedValue(user)

    const result = await useCase.execute({ targetUserId: userId })

    expect(result).toEqual(user)
    expect(mockUserRepository.findByIdOrThrow).toHaveBeenCalledWith(userId)
  })

  it('should throw UserNotFoundError if user is not found', async () => {
    const userId = 1
    mockUserRepository.findByIdOrThrow.mockRejectedValue(
      new UserNotFoundError(),
    )

    await expect(useCase.execute({ targetUserId: userId })).rejects.toThrow(
      UserNotFoundError,
    )
    expect(mockUserRepository.findByIdOrThrow).toHaveBeenCalledWith(userId)
  })
})
