import { Injectable, ForbiddenException } from '@nestjs/common'
import { AbilityBuilder, createMongoAbility } from '@casl/ability'

import { IPermissionService, Action } from '../../application/ports/permission.service.interface'
import { User } from '../../domain/entities/user.entity'
import { Feedback } from 'src/modules/feedback/domain/entities/feedback.entity'
import { AppAbility } from '../types/permission.types'

@Injectable()
export class CaslPermissionService implements IPermissionService {
  requirePermission(user: User, action: Action, subject: any): void {
    const ability = this.createAbility(user)

    if (!ability.can(action, subject)) {
      throw new ForbiddenException(`You cannot ${action} this resource`)
    }
  }

  getRules(user: User) {
    const ability = this.createAbility(user)
    return ability.rules
  }

  private createAbility(user: User): AppAbility {
    const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility)

    if (user.role === 'ADMIN') {
      can(Action.Manage, 'all')
    } else {
      can(Action.Update, Feedback, { authorId: user.id })
    }

    return build({
      detectSubjectType: (item) => item.constructor as any,
    })
  }
}
