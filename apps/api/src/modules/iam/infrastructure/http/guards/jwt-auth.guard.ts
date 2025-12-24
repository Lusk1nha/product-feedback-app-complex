import { Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken' // Tipos de erro do JWT

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
	handleRequest(err: any, user: any, info: any) {
		if (err || !user) {
			if (info instanceof TokenExpiredError) {
				throw new UnauthorizedException(
					'The access token has expired. Please log in again or use the refresh token.',
				)
			}

			// 2. Token Malformado ou Inválido
			if (info instanceof JsonWebTokenError) {
				throw new UnauthorizedException('Invalid or malformed token.')
			}

			// 3. Token não enviado
			if (!info && !user) {
				throw new UnauthorizedException('Authentication token not provided.')
			}

			// Erro genérico
			throw err || new UnauthorizedException('Unauthorized access.')
		}

		return user
	}
}
