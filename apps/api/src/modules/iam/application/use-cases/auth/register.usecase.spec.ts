import { Test, TestingModule } from '@nestjs/testing'
import { RegisterUseCase } from './register.usecase'
import { USER_REPOSITORY } from 'src/modules/iam/domain/repositories/user.repository.interface'
import { User } from 'src/modules/iam/domain/entities/user.entity'
import { faker } from '@faker-js/faker'
import { UserAlreadyExistsError } from 'src/modules/iam/domain/errors/user-already-exists.error'
import { HashingService } from 'src/shared/application/services/hash.service' // Importe isso

// 1. Mock do Repositório
const mockUserRepository = {
  create: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
}

// 2. Mock do Hashing Service (NOVO)
const mockHashingService = {
  hash: jest.fn(),
  compare: jest.fn(),
}

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUseCase,
        {
          provide: USER_REPOSITORY,
          useValue: mockUserRepository,
        },
        // 3. Fornecemos o Mock do Hashing Service
        {
          provide: HashingService,
          useValue: mockHashingService,
        },
      ],
    }).compile()

    useCase = module.get<RegisterUseCase>(RegisterUseCase)

    jest.clearAllMocks()
  })

  it('should create a user successfully', async () => {
    // Arrange
    const command = {
      username: faker.internet.username(),
      email: faker.internet.email(),
      fullName: faker.person.fullName(),
      avatarUrl: faker.image.avatar(),
      password: faker.internet.password(),
    }

    // Configura os retornos dos Mocks
    mockUserRepository.findByEmail.mockResolvedValue(null) // Usuário não existe
    mockHashingService.hash.mockResolvedValue('hashed-password-123') // Simula o hash

    // Simula o create retornando o user (O repositorio real agora retorna User, não Account junto no retorno direto do create se seguir a interface antiga, mas vamos assumir sucesso)
    mockUserRepository.create.mockImplementation((user) => Promise.resolve(user))

    // Act
    const result = await useCase.execute(command)

    // Assert
    expect(result).toBeInstanceOf(User)
    expect(result.username).toBe(command.username)

    expect(mockHashingService.hash).toHaveBeenCalledWith(command.password)
    expect(mockUserRepository.create).toHaveBeenCalled()
  })

  it('should throw UserAlreadyExistsError if email already exists', async () => {
    // Arrange
    const command = {
      username: faker.internet.username(),
      email: faker.internet.email(),
      fullName: faker.person.fullName(),
      password: faker.internet.password(),
      avatarUrl: faker.image.avatar(),
    }

    mockUserRepository.findByEmail.mockResolvedValue({ id: 1, ...command })

    // Act & Assert
    await expect(useCase.execute(command)).rejects.toThrow(UserAlreadyExistsError)

    // Verifica que NÃO tentou fazer hash nem salvar
    expect(mockHashingService.hash).not.toHaveBeenCalled()
    expect(mockUserRepository.create).not.toHaveBeenCalled()
  })
})
