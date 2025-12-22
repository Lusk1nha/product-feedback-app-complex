import { Inject, Injectable } from '@nestjs/common'
import { UserNotFoundError } from 'src/modules/iam/domain/errors/user-not-found.error'
import { IUserRepository, USER_REPOSITORY } from 'src/modules/iam/domain/repositories/user.repository.interface'

@Injectable()
export class GetProfileUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository) {}

  async execute(userId: number) {
    return this.getUserOrThrow(userId)
  }

  private async getUserOrThrow(userId: number) {
    const user = await this.userRepository.findById(userId)

    if (!user) {
      throw new UserNotFoundError()
    }

    return user
  }
}
