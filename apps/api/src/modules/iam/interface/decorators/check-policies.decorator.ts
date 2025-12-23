import { SetMetadata } from '@nestjs/common'
import { IPermissionService } from '../../application/ports/permission.service.interface'
import { User } from '../../domain/entities/user.entity'

export type PolicyHandler = (ability: IPermissionService, user: User) => boolean

export const CHECK_POLICIES_KEY = 'check_policies'

export const CheckPolicies = (...handlers: PolicyHandler[]) =>
	SetMetadata(CHECK_POLICIES_KEY, handlers)
