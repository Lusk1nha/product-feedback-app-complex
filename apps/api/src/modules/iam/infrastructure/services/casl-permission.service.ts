import { Injectable } from '@nestjs/common'
import { AbilityBuilder, createMongoAbility } from '@casl/ability'
import { IPermissionService } from '../../application/ports/permission.service.interface'
import { User } from '../../domain/entities/user.entity'
import { PermissionDeniedError } from '../../domain/errors/permission-denied.error'
import { Action, AppAbility } from '../types/permission.types'

import { AppPolicy } from '../../domain/policies/app.policy'
import { IPermissionBuilder } from '../../domain/policies/permission-builder.interface'

@Injectable()
export class CaslPermissionService implements IPermissionService {
  ensureCan(user: User, action: Action, subject: any): void {
    const ability = this.createAbility(user)

    if (!ability.can(action, subject)) {
      throw new PermissionDeniedError(action, subject)
    }
  }

  getRules(user: User) {
    const ability = this.createAbility(user)
    return ability.rules
  }

  private createAbility(user: User): AppAbility {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      createMongoAbility,
    )

    const caslAdapter: IPermissionBuilder = {
      can: (action, subject, conditions) => {
        const subjectName = this.parseSubjectName(subject)
        can(action, subjectName as any, conditions)
      },

      cannot: (action, subject, conditions) => {
        const subjectName = this.parseSubjectName(subject)
        cannot(action, subjectName as any, conditions)
      },
    }

    AppPolicy.define(user, caslAdapter)

    return build({
      // Quando verificamos permissão: ability.can(Action.Update, userInstance)
      // O CASL chama essa função. Precisamos retornar a STRING "User" para bater com a regra salva acima.
      detectSubjectType: (item) => {
        return item.constructor.name as any
      },
    })
  }

  private parseSubjectName(subject: any): string {
    if (typeof subject === 'string') return subject
    if (typeof subject === 'function') return subject.name
    return 'Unknown'
  }
}
