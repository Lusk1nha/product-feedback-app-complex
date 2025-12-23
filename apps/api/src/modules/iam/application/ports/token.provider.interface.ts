import { User } from '../../domain/entities/user.entity'
import { UserRole } from '../../domain/enums/user-role.enum'

export const TOKEN_PROVIDER = Symbol('TOKEN_PROVIDER')

export interface AuthTokens {
	accessToken: string
	refreshToken: string
}

export interface TokenPayload {
	sub: number
	email: string

	role: UserRole
}

export interface ITokenProvider {
	generateAuthTokens(user: User): Promise<AuthTokens>

	verifyRefreshToken(token: string): Promise<TokenPayload>
}
