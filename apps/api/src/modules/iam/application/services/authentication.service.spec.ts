import { Test, TestingModule } from '@nestjs/testing'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { AuthenticationService } from './authentication.service'
import { HashingService } from 'src/shared/application/services/hash.service'
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.interface'
import { User } from '../../domain/entities/user.entity'
import { Account } from '../../domain/entities/account.entity'
import { InvalidCredentialsError } from '../../domain/errors/invalid-credentials.error'
import { LoginDto } from '../../http/dtos/login.dto'

// Mocks simples para simular as dependências
const mockUserRepository = {
  findByEmailWithAccount: jest.fn(),
}

const mockHashingService = {
  compare: jest.fn(),
}

const mockJwtService = {
  signAsync: jest.fn(),
}

const mockConfigService = {
  get: jest.fn((key: string) => {
    // Retorna valores fake dependendo da chave pedida
    const configMap = {
      JWT_ACCESS_SECRET: 'access-secret',
      JWT_REFRESH_SECRET: 'refresh-secret',
      JWT_ACCESS_TTL: '15m',
      JWT_REFRESH_TTL: '7d',
    }
    return configMap[key]
  }),
}

describe('AuthenticationService', () => {
  let service: AuthenticationService
  let userRepo: typeof mockUserRepository
  let hashingService: typeof mockHashingService
  let jwtService: typeof mockJwtService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        { provide: USER_REPOSITORY, useValue: mockUserRepository },
        { provide: HashingService, useValue: mockHashingService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile()

    service = module.get<AuthenticationService>(AuthenticationService)
    userRepo = module.get(USER_REPOSITORY)
    hashingService = module.get(HashingService)
    jwtService = module.get(JwtService)

    jest.clearAllMocks() // Limpa chamadas anteriores
  })

  // Helper para criar entidade fake rápida
  const createMockUser = () => {
    const user = { id: 1, email: { getValue: () => 'test@example.com' } } as User
    const account = { password: 'hashed-password' } as Account
    return { user, account }
  }

  describe('login', () => {
    const loginDto: LoginDto = { email: 'test@example.com', password: 'password123' }

    it('should return tokens when credentials are valid', async () => {
      // Arrange
      const { user, account } = createMockUser()
      userRepo.findByEmailWithAccount.mockResolvedValue({ user, account })
      hashingService.compare.mockResolvedValue(true) // Senha bateu
      jwtService.signAsync
        .mockResolvedValueOnce('access-token') // 1ª chamada
        .mockResolvedValueOnce('refresh-token') // 2ª chamada

      // Act
      const result = await service.login(loginDto)

      // Assert
      expect(result).toEqual({ accessToken: 'access-token', refreshToken: 'refresh-token' })
      expect(userRepo.findByEmailWithAccount).toHaveBeenCalledWith(loginDto.email)
      expect(hashingService.compare).toHaveBeenCalledWith(loginDto.password, account.password)
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2) // Access + Refresh
    })

    it('should throw InvalidCredentialsError if user not found', async () => {
      // Arrange
      userRepo.findByEmailWithAccount.mockResolvedValue(null)

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(InvalidCredentialsError)
      expect(hashingService.compare).not.toHaveBeenCalled() // Não deve nem tentar comparar senha
    })

    it('should throw InvalidCredentialsError if account has no password (e.g. Google Auth)', async () => {
      // Arrange
      const { user } = createMockUser()
      const accountNoPass = { password: null } as unknown as Account

      userRepo.findByEmailWithAccount.mockResolvedValue({ user, account: accountNoPass })

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(InvalidCredentialsError)
      expect(hashingService.compare).not.toHaveBeenCalled()
    })

    it('should throw InvalidCredentialsError if password does not match', async () => {
      // Arrange
      const { user, account } = createMockUser()
      userRepo.findByEmailWithAccount.mockResolvedValue({ user, account })
      hashingService.compare.mockResolvedValue(false) // Senha errada!

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(InvalidCredentialsError)
    })
  })

  describe('generateTokens', () => {
    it('should generate access and refresh tokens correctly', async () => {
      // Arrange
      const { user } = createMockUser()
      jwtService.signAsync.mockResolvedValueOnce('access-token-123').mockResolvedValueOnce('refresh-token-456')

      // Act
      const tokens = await service.generateTokens(user)

      // Assert
      expect(tokens).toEqual({
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
      })

      // Verifica se chamou com os parâmetros certos (Payload e Configs)
      const expectedPayload = { sub: user.id, email: 'test@example.com' }

      // Chamada 1: Access Token
      expect(jwtService.signAsync).toHaveBeenNthCalledWith(1, expectedPayload, {
        secret: 'access-secret',
        expiresIn: '15m',
      })

      // Chamada 2: Refresh Token
      expect(jwtService.signAsync).toHaveBeenNthCalledWith(2, expectedPayload, {
        secret: 'refresh-secret',
        expiresIn: '7d',
      })
    })
  })
})
