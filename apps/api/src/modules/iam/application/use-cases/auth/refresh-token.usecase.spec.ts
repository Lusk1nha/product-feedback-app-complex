import { Test, TestingModule } from '@nestjs/testing'
import { RefreshTokenCommand, RefreshTokenUseCase } from './refresh-token.usecase'
import { USER_REPOSITORY } from 'src/modules/iam/domain/repositories/user.repository.interface'
import { TOKEN_PROVIDER } from '../../ports/token.provider.interface'
import { UserNotFoundError } from 'src/modules/iam/domain/errors/user-not-found.error'
import { InvalidRefreshTokenError } from 'src/modules/iam/domain/errors/invalid-refresh-token.error'
import { faker } from '@faker-js/faker'
import { REFRESH_TOKEN_REPOSITORY } from 'src/modules/iam/domain/repositories/refresh-token.repository.interface'

// Mocks
const mockUserRepository = {
  findById: jest.fn(),
}

const mockTokenProvider = {
  verifyRefreshToken: jest.fn(),
  generateAuthTokens: jest.fn(),
}

const mockRefreshTokenRepository = {
  create: jest.fn(),
  deleteByTokenHash: jest.fn(),
}

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenUseCase,
        {
          provide: USER_REPOSITORY,
          useValue: mockUserRepository,
        },
        {
          provide: REFRESH_TOKEN_REPOSITORY,
          useValue: mockRefreshTokenRepository,
        },
        {
          provide: TOKEN_PROVIDER,
          useValue: mockTokenProvider,
        },
      ],
    }).compile()

    useCase = module.get<RefreshTokenUseCase>(RefreshTokenUseCase)

    jest.clearAllMocks()
  })

  it('should rotate tokens successfully if refresh token and user are valid', async () => {
    // Arrange
    const command: RefreshTokenCommand = {
      refreshToken: 'valid-refresh-token',
    }

    const payload = { sub: 123, email: faker.internet.email() }
    const user = { id: 123, email: payload.email }
    const newTokens = { accessToken: 'new-access', refreshToken: 'new-refresh' }

    // Configurando comportamento dos mocks
    mockTokenProvider.verifyRefreshToken.mockResolvedValue(payload)
    mockUserRepository.findById.mockResolvedValue(user)
    mockTokenProvider.generateAuthTokens.mockResolvedValue(newTokens)
    mockRefreshTokenRepository.create.mockResolvedValue({})
    mockRefreshTokenRepository.deleteByTokenHash.mockResolvedValue({})

    // Act
    const result = await useCase.execute(command)

    // Assert
    expect(result).toEqual(newTokens)
    expect(mockTokenProvider.verifyRefreshToken).toHaveBeenCalledWith(command.refreshToken)
    expect(mockUserRepository.findById).toHaveBeenCalledWith(payload.sub)
    expect(mockTokenProvider.generateAuthTokens).toHaveBeenCalledWith(user)
  })

  it('should propagate InvalidRefreshTokenError if provider fails verification', async () => {
    // Arrange
    const command = { refreshToken: 'invalid-token' }

    // Simulamos o Provider lançando erro (ex: token expirado)
    mockTokenProvider.verifyRefreshToken.mockRejectedValue(new InvalidRefreshTokenError())

    // Act & Assert
    await expect(useCase.execute(command)).rejects.toThrow(InvalidRefreshTokenError)

    // Garante que parou o fluxo e não foi no banco
    expect(mockUserRepository.findById).not.toHaveBeenCalled()
  })

  it('should throw UserNotFoundError if token is valid but user was deleted', async () => {
    // Arrange
    const command = { refreshToken: 'valid-token' }

    // Token válido...
    mockTokenProvider.verifyRefreshToken.mockResolvedValue({ sub: 999 })
    // ... mas usuário não existe mais no banco
    mockUserRepository.findById.mockResolvedValue(null)

    // Act & Assert
    await expect(useCase.execute(command)).rejects.toThrow(UserNotFoundError)

    // Garante que NÃO gerou novos tokens
    expect(mockTokenProvider.generateAuthTokens).not.toHaveBeenCalled()
  })
})
