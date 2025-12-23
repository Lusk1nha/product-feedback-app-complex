import { Inject, Injectable } from '@nestjs/common'
import { User } from 'src/modules/iam/domain/entities/user.entity'

import {
	IUserRepository,
	USER_REPOSITORY,
} from 'src/modules/iam/domain/repositories/user.repository.interface'
import { IUseCase } from 'src/shared/application/interfaces/use-case.interface'

interface GetProfileCommand {
	targetUserId: number
}

@Injectable()
export class GetProfileUseCase implements IUseCase<GetProfileCommand, User> {
	constructor(
		@Inject(USER_REPOSITORY)
		private readonly userRepository: IUserRepository,
	) {}

	async execute(command: GetProfileCommand): Promise<User> {
		const user = await this.userRepository.findByIdOrThrow(command.targetUserId)
		return user
	}
}
