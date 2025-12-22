import { Inject, Injectable } from '@nestjs/common'
import {
  IUserRepository,
  USER_REPOSITORY,
} from 'src/modules/iam/domain/repositories/user.repository.interface'
import { IUseCase } from 'src/shared/application/interfaces/use-case.interface'
import {
  IPermissionService,
  PERMISSION_SERVICE,
} from '../../ports/permission.service.interface'

import { Action } from 'src/modules/iam/infrastructure/types/permission.types'
import { User } from 'src/modules/iam/domain/entities/user.entity'

interface DeleteUserCommand {
  currentUser: User
  targetUserId: number
}

@Injectable()
export class DeleteUserUseCase implements IUseCase<DeleteUserCommand, void> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(PERMISSION_SERVICE)
    private readonly permissionService: IPermissionService,
  ) {}

  async execute(command: DeleteUserCommand) {
    const user = await this.userRepository.findByIdOrThrow(command.targetUserId)
    this.permissionService.ensureCan(command.currentUser, Action.Delete, user)

    return this.userRepository.delete(user)
  }
}
