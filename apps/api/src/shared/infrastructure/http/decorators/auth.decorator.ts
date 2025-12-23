import { applyDecorators, UseGuards } from '@nestjs/common'
import {
	ApiBearerAuth,
	ApiForbiddenResponse,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { UserRole } from 'src/modules/iam/domain/enums/user-role.enum'
import { JwtAuthGuard } from 'src/modules/iam/infrastructure/http/guards/jwt-auth.guard'
import { RolesGuard } from 'src/modules/iam/infrastructure/http/guards/roles.guard'
import { Roles } from './roles.decorator'

export function Auth(...roles: UserRole[]) {
	const decorators = [
		ApiBearerAuth(),
		UseGuards(JwtAuthGuard, RolesGuard),
		ApiUnauthorizedResponse({ description: 'Unauthorized' }),
	]

	if (roles.length > 0) {
		decorators.push(Roles(...roles))
		decorators.push(
			ApiForbiddenResponse({
				description: 'Forbidden - Insufficient permissions',
			}),
		)
	}

	return applyDecorators(...decorators)
}
