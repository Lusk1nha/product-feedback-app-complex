import { Injectable, Inject } from '@nestjs/common'
import { User } from 'src/modules/iam/domain/entities/user.entity'
import { IUserRepository, USER_REPOSITORY } from 'src/modules/iam/domain/repositories/user.repository.interface'
import { UserAlreadyExistsError } from 'src/modules/iam/domain/errors/user-already-exists.error'
import { HashingService } from 'src/shared/application/services/hash.service'
import { Account } from 'src/modules/iam/domain/entities/account.entity'

export interface RegisterCommand {
  username: string
  email: string
  fullName: string
  password: string
  avatarUrl?: string
}

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    private readonly hashingService: HashingService,
  ) {}

  async execute(command: RegisterCommand): Promise<User> {
    await this.checkUserDoesNotExists(command.email)

    const hashedPassword = await this.hashingService.hash(command.password)

    const newUser = User.create({
      username: command.username,
      email: command.email,
      fullName: command.fullName,
      avatarUrl: command.avatarUrl,
    })

    const newAccount = Account.createLocal({
      email: command.email,
      passwordHash: hashedPassword,
    })

    return this.userRepository.create(newUser, newAccount)
  }

  private async checkUserDoesNotExists(email: string): Promise<void> {
    const userExists = await this.userRepository.findByEmail(email)
    if (userExists) {
      throw new UserAlreadyExistsError(email)
    }
  }
}
