import { Injectable, Inject } from '@nestjs/common'
import { User } from 'src/modules/iam/domain/entities/user.entity'
import {
	IUserRepository,
	USER_REPOSITORY,
} from 'src/modules/iam/domain/repositories/user.repository.interface'
import { UserAlreadyExistsError } from 'src/modules/iam/domain/errors/user-already-exists.error'
import { HashingService } from 'src/shared/application/services/hash.service'
import { Account } from 'src/modules/iam/domain/entities/account.entity'
import { IUseCase } from 'src/shared/application/interfaces/use-case.interface'
import { UserConflictError } from 'src/modules/iam/domain/errors/user-conflict.error'

export interface RegisterCommand {
	username: string
	email: string
	fullName: string
	password: string
	avatarUrl?: string
}

@Injectable()
export class RegisterUseCase implements IUseCase<RegisterCommand, User> {
	constructor(
		@Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
		private readonly hashingService: HashingService,
	) {}

	async execute(command: RegisterCommand): Promise<User> {
		// ✅ MELHORIA 1: Performance com Promise.all
		// Validamos email e username em paralelo. Se um falhar, o Promise.all rejeita.
		await Promise.all([
			this.checkUserDoesNotExists(command.email),
			this.checkUsernameIsAvailable(command.username),
		])

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

		const savedUser = await this.userRepository.create(newUser, newAccount)
		return savedUser
	}

	private async checkUserDoesNotExists(email: string): Promise<void> {
		const userExists = await this.userRepository.findByEmail(email)
		if (userExists) {
			throw new UserAlreadyExistsError(email)
		}
	}

	private async checkUsernameIsAvailable(username: string): Promise<void> {
		const userExists = await this.userRepository.findByUsername(username)
		if (userExists) {
			throw new UserConflictError(username)
		}
	}
}
