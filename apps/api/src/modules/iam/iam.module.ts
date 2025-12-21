import { Module } from '@nestjs/common'
import { USER_REPOSITORY } from './domain/repositories/user.repository.interface'
import { UserController } from './http/controllers/user.controller'
import { UserDrizzleRepository } from './infrastructure/database/repositories/user.drizzle-repository'
import { CreateUserUseCase } from './application/use-cases/users/create-user.usecase'
import { JwtModule } from '@nestjs/jwt'
import { AuthenticationController } from './http/controllers/authentication.controller'
import { HashingService } from 'src/shared/application/services/hash.service'
import { BcryptHashingService } from 'src/shared/infrastructure/services/bcrypt-hashing.service'
import { AuthenticationService } from './application/services/authentication.service'

@Module({
  imports: [JwtModule.register({})], // DatabaseModule já é Global, não precisa importar
  controllers: [UserController, AuthenticationController],
  providers: [
    { provide: USER_REPOSITORY, useClass: UserDrizzleRepository },
    { provide: HashingService, useClass: BcryptHashingService },
    CreateUserUseCase,
    AuthenticationService,
  ],
  exports: [CreateUserUseCase, AuthenticationService],
})
export class IamModule {}
