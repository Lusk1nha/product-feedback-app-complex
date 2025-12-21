import { Module } from '@nestjs/common'
import { USER_REPOSITORY } from './domain/repositories/user.repository.interface'
import { UserController } from './http/controllers/user.controller'
import { UserDrizzleRepository } from './infrastructure/database/repositories/user.drizzle-repository'
import { RegisterUseCase } from './application/use-cases/auth/register.usecase'
import { JwtModule } from '@nestjs/jwt'
import { AuthenticationController } from './http/controllers/authentication.controller'
import { HashingService } from 'src/shared/application/services/hash.service'
import { BcryptHashingService } from 'src/shared/infrastructure/services/bcrypt-hashing.service'

import { RefreshTokenUseCase } from './application/use-cases/auth/refresh-token.usecase'
import { TOKEN_PROVIDER } from './application/ports/token.provider.interface'
import { JwtTokenService } from './infrastructure/tokens/jwt-token.service'
import { LoginUseCase } from './application/use-cases/auth/login.usecase'

@Module({
  imports: [JwtModule.register({})], // DatabaseModule já é Global, não precisa importar
  controllers: [UserController, AuthenticationController],
  providers: [
    { provide: USER_REPOSITORY, useClass: UserDrizzleRepository },
    { provide: HashingService, useClass: BcryptHashingService },

    RegisterUseCase,
    RefreshTokenUseCase,
    LoginUseCase,

    { provide: TOKEN_PROVIDER, useClass: JwtTokenService },
  ],
  exports: [],
})
export class IamModule {}
