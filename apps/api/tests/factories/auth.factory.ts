import { Injectable } from '@nestjs/common'
import { LoginUseCase } from 'src/modules/iam/application/use-cases/auth/login.usecase'
import { User } from 'src/modules/iam/domain/entities/user.entity'

@Injectable()
export class AuthFactory {
	constructor(private readonly loginUseCase: LoginUseCase) {}

	async authenticate(user: User, password: string) {
		const response = await this.loginUseCase.execute({
			email: user.email.getValue(),
			password,
		})

		return {
			accessToken: response.accessToken, // AccessToken -> Bearer Token
			refreshToken: response.refreshToken, // RefreshToken -> Bearer Token
		}
	}
}
