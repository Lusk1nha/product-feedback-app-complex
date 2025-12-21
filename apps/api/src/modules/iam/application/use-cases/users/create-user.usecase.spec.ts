import { Test, TestingModule } from '@nestjs/testing'
import { CreateUserUseCase } from './create-user.usecase'
import { USER_REPOSITORY } from 'src/modules/iam/domain/repositories/user.repository.interface'
import { User } from 'src/modules/iam/domain/entities/user.entity'

import { faker } from '@faker-js/faker'
import { UserAlreadyExistsError } from 'src/modules/iam/domain/errors/user-already-exists.error'

// 1. Criamos um Mock do Repositório
// Não queremos conectar no banco real aqui.
const mockUserRepository = {
  create: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
}

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserUseCase,
        {
          provide: USER_REPOSITORY,
          useValue: mockUserRepository, // Injetamos o Mock
        },
      ],
    }).compile()

    useCase = module.get<CreateUserUseCase>(CreateUserUseCase)

    // Limpa os mocks antes de cada teste
    jest.clearAllMocks()
  })

  it('should create a user successfully', async () => {
    // Arrange (Preparação)
    const command = {
      username: faker.internet.username(),
      email: faker.internet.email(),
      fullName: faker.person.fullName(),
      avatarUrl: faker.image.avatar(),

      password: faker.internet.password(),
    }

    // Simulamos que NÃO existe usuário com esse email
    mockUserRepository.findByEmail.mockResolvedValue(null)
    // Simulamos o retorno do create (fingindo que o banco salvou)
    mockUserRepository.create.mockImplementation((user) => Promise.resolve(user))

    // Act (Ação)
    const result = await useCase.execute(command)

    // Assert (Verificação)
    expect(result).toBeInstanceOf(User)
    expect(result.username).toBe(command.username)
    expect(mockUserRepository.create).toHaveBeenCalled() // Garante que chamou o repo
  })

  it('should throw ConflictException if email already exists', async () => {
    // Arrange
    const command = {
      username: faker.internet.username(),
      email: faker.internet.email(),
      fullName: faker.person.fullName(),
      password: faker.internet.password(),

      avatarUrl: faker.image.avatar(),
    }

    // Simulamos que JÁ EXISTE usuário
    mockUserRepository.findByEmail.mockResolvedValue({ id: 1, ...command })

    // Act & Assert
    await expect(useCase.execute(command)).rejects.toThrow(UserAlreadyExistsError)

    // Garante que NÃO tentou criar
    expect(mockUserRepository.create).not.toHaveBeenCalled()
  })
})
