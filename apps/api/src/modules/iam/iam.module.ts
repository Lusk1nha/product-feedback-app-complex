import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport' // <--- Recomendado

// Controllers
import { UserController } from './infrastructure/http/controllers/user.controller'
import { AuthenticationController } from './infrastructure/http/controllers/authentication.controller'

// Repositories
import { USER_REPOSITORY } from './domain/repositories/user.repository.interface'
import { UserDrizzleRepository } from './infrastructure/database/repositories/user.drizzle-repository'
import { REFRESH_TOKEN_REPOSITORY } from './domain/repositories/refresh-token.repository.interface'
import { RefreshTokenDrizzleRepository } from './infrastructure/database/repositories/refresh-token.drizzle-repository'

// Services & Providers
import { HashingService } from 'src/shared/application/services/hash.service'
import { BcryptHashingService } from 'src/shared/infrastructure/services/bcrypt-hashing.service'
import { TOKEN_PROVIDER } from './application/ports/token.provider.interface'
import { JwtTokenService } from './infrastructure/tokens/jwt-token.service'
import { PERMISSION_SERVICE } from './application/ports/permission.service.interface' // <--- Novo
import { CaslPermissionService } from './infrastructure/services/casl-permission.service' // <--- Novo

// Use Cases
import { RegisterUseCase } from './application/use-cases/auth/register.usecase'
import { LoginUseCase } from './application/use-cases/auth/login.usecase'
import { RefreshTokenUseCase } from './application/use-cases/auth/refresh-token.usecase'
import { LogoutUseCase } from './application/use-cases/auth/logout.usecase'

// Auth Strategies
import { JwtStrategy } from './infrastructure/auth/strategies/jwt.strategy'
import { GetProfileUseCase } from './application/use-cases/user/get-profile.usecase'

@Module({
  imports: [
    // Registra o Passport (padrão do NestJS para Auth)
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
  ],
  controllers: [UserController, AuthenticationController],
  providers: [
    // 1. Repositories
    { provide: USER_REPOSITORY, useClass: UserDrizzleRepository },
    { provide: REFRESH_TOKEN_REPOSITORY, useClass: RefreshTokenDrizzleRepository },

    // 2. Infra Services
    { provide: HashingService, useClass: BcryptHashingService },
    { provide: TOKEN_PROVIDER, useClass: JwtTokenService },

    // 3. Permission Service (Adicionado para funcionar o CASL)
    { provide: PERMISSION_SERVICE, useClass: CaslPermissionService },

    // 4. Use Cases
    RegisterUseCase,
    RefreshTokenUseCase,
    LoginUseCase,
    LogoutUseCase,

    GetProfileUseCase,

    // 5. Strategies
    JwtStrategy,
  ],
  exports: [PERMISSION_SERVICE],
})
export class IamModule {}
