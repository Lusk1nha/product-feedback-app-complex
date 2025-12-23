import { Inject, Injectable } from '@nestjs/common'
import {
	IUserRepository,
	USER_REPOSITORY,
} from 'src/modules/iam/domain/repositories/user.repository.interface'
import { IUseCase } from 'src/shared/application/interfaces/use-case.interface'

interface GetUserAvatarUseCaseCommand {
	userId: number
}

@Injectable()
export class GetUserAvatarUseCase implements IUseCase<
	GetUserAvatarUseCaseCommand,
	string | null
> {
	constructor(
		@Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
	) {}

	async execute(command: GetUserAvatarUseCaseCommand) {
		return await this.userRepository.findAvatarById(command.userId)
	}
}
