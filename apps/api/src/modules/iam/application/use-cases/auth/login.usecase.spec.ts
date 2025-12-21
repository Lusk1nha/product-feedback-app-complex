import { Test, TestingModule } from '@nestjs/testing'
import { LoginCommand, LoginUseCase } from './login.usecase'
import { USER_REPOSITORY } from 'src/modules/iam/domain/repositories/user.repository.interface'
import { HashingService } from 'src/shared/application/services/hash.service'
import { TOKEN_PROVIDER } from '../../ports/token.provider.interface'
import { faker } from '@faker-js/faker'
import { InvalidCredentialsError } from 'src/modules/iam/domain/errors/invalid-credentials.error'
import { REFRESH_TOKEN_REPOSITORY } from 'src/modules/iam/domain/repositories/refresh-token.repository.interface'

const mockUserRepository = {
  findByEmailWithAccount: jest.fn(),
}

const mockTokenProvider = {
  generateAuthTokens: jest.fn(),
}

const mockHashingService = {
  compare: jest.fn(),
  hashToken: jest.fn(),
}

const mockRefreshTokenRepository = {
  create: jest.fn(),
}

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        { provide: USER_REPOSITORY, useValue: mockUserRepository },
        { provide: REFRESH_TOKEN_REPOSITORY, useValue: mockRefreshTokenRepository },
        { provide: TOKEN_PROVIDER, useValue: mockTokenProvider },
        { provide: HashingService, useValue: mockHashingService },
      ],
    }).compile()

    loginUseCase = module.get<LoginUseCase>(LoginUseCase)
    jest.clearAllMocks()
  })

  it('should login successfully', async () => {
    // Arrange - Preparação
    const command: LoginCommand = {
      email: faker.internet.email(),
      password: 'plain-password',
    }

    const tokens = { accessToken: 'access', refreshToken: 'refresh' }

    mockUserRepository.findByEmailWithAccount.mockResolvedValue({
      user: { id: 1, email: command.email },
      account: { password: 'hashed-password' },
    })

    mockHashingService.compare.mockResolvedValue(true) // Senha Correta
    mockHashingService.hashToken.mockResolvedValue('hashed-refresh-token')
    mockTokenProvider.generateAuthTokens.mockResolvedValue(tokens)
    mockRefreshTokenRepository.create.mockResolvedValue({})

    // Act - Execução
    const result = await loginUseCase.execute(command)

    // Assert - Verificar
    expect(result).toEqual(tokens) // ✅ Comparando com o objeto de retorno
    expect(mockUserRepository.findByEmailWithAccount).toHaveBeenCalledWith(command.email)
    expect(mockHashingService.compare).toHaveBeenCalledWith(command.password, 'hashed-password')
    expect(mockTokenProvider.generateAuthTokens).toHaveBeenCalled()
  })

  it('should throw InvalidCredentialsError if user not found', async () => {
    // Arrange - Preparação
    mockUserRepository.findByEmailWithAccount.mockResolvedValue(null) // Usuário não existe

    // Act & Assert - Execução e Verificação
    await expect(
      loginUseCase.execute({
        email: 'ghost@mail.com',
        password: '123',
      }),
    ).rejects.toThrow(InvalidCredentialsError)

    expect(mockHashingService.compare).not.toHaveBeenCalled()
  })

  it('should throw InvalidCredentialsError if password does not match', async () => {
    // Arrange
    mockUserRepository.findByEmailWithAccount.mockResolvedValue({
      user: { id: 1 },
      account: { password: 'hashed-password' },
    })

    mockHashingService.compare.mockResolvedValue(false) // Senha errada

    // Act & Assert
    await expect(
      loginUseCase.execute({
        email: 'user@mail.com',
        password: 'wrong-pass',
      }),
    ).rejects.toThrow(InvalidCredentialsError)
  })
})
