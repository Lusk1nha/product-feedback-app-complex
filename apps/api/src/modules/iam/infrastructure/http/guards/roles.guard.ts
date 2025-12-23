import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { User } from 'src/modules/iam/domain/entities/user.entity'
import { UserRole } from 'src/modules/iam/domain/enums/user-role.enum'
import { ROLES_KEY } from 'src/shared/infrastructure/http/decorators/roles.decorator'

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
			ROLES_KEY,
			[context.getHandler(), context.getClass()],
		)

		if (!requiredRoles) {
			return true
		}

		const { user } = context.switchToHttp().getRequest() as { user: User }

		if (!user) return false
		return requiredRoles.some((role) => user.role === role)
	}
}
