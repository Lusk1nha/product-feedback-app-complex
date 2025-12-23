import { Inject, Injectable } from '@nestjs/common'
import { User } from 'src/modules/iam/domain/entities/user.entity'
import {
	IRefreshTokenRepository,
	REFRESH_TOKEN_REPOSITORY,
} from 'src/modules/iam/domain/repositories/refresh-token.repository.interface'
import { IUseCase } from 'src/shared/application/interfaces/use-case.interface'
import { HashingService } from 'src/shared/application/services/hash.service'

export interface LogoutCommand {
	refreshToken: string
}

@Injectable()
export class LogoutUseCase implements IUseCase<LogoutCommand, void> {
	constructor(
		@Inject(REFRESH_TOKEN_REPOSITORY)
		private readonly refreshTokenRepo: IRefreshTokenRepository,
		private readonly hashingService: HashingService,
	) {}

	async execute(command: LogoutCommand): Promise<void> {
		if (!command.refreshToken) return

		const tokenHash = await this.hashingService.hash(command.refreshToken)

		await this.refreshTokenRepo.deleteByTokenHash(tokenHash)
	}
}
