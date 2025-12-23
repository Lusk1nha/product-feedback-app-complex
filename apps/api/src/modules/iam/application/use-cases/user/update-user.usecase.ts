import { Inject, Injectable } from '@nestjs/common'
import { User } from 'src/modules/iam/domain/entities/user.entity'
import { UserNotFoundError } from 'src/modules/iam/domain/errors/user-not-found.error'
import { UserConflictError } from 'src/modules/iam/domain/errors/user-conflict.error' // Novo erro
import {
	IUserRepository,
	USER_REPOSITORY,
} from 'src/modules/iam/domain/repositories/user.repository.interface'
import { IUseCase } from 'src/shared/application/interfaces/use-case.interface'
import {
	IPermissionService,
	PERMISSION_SERVICE,
} from 'src/modules/iam/application/ports/permission.service.interface'
import { Action } from 'src/modules/iam/infrastructure/types/permission.types'

export interface UpdateUserCommand {
	currentUser: User
	targetUserId: number
	params: {
		username?: string
		fullName?: string
		avatarUrl?: string | null
	}
}

@Injectable()
export class UpdateUserUseCase implements IUseCase<UpdateUserCommand, User> {
	constructor(
		@Inject(USER_REPOSITORY)
		private readonly userRepository: IUserRepository,

		@Inject(PERMISSION_SERVICE)
		private readonly permissionService: IPermissionService,
	) {}

	async execute(command: UpdateUserCommand): Promise<User> {
		const userToUpdate = await this.userRepository.findByIdOrThrow(
			command.targetUserId,
		)

		// 2. Valida Permissão (ABAC)
		this.permissionService.ensureCan(
			command.currentUser,
			Action.Update,
			userToUpdate,
		)

		// 3. Validação de Regra de Negócio: Username Único
		if (
			command.params.username &&
			command.params.username !== userToUpdate.username
		) {
			const usernameTaken = await this.userRepository.findByUsername(
				command.params.username,
			)

			if (usernameTaken && usernameTaken.id !== userToUpdate.id) {
				throw new UserConflictError('username')
			}
		}

		// 4. Modifica o estado na memória (A entidade se valida internamente também)
		userToUpdate.update(command.params)

		// 5. Persiste
		await this.userRepository.update(userToUpdate)

		return userToUpdate
	}
}
