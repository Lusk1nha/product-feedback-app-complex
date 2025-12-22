import { InferSubjects, MongoAbility } from '@casl/ability'
import { Feedback } from 'src/modules/feedback/domain/entities/feedback.entity'
import { Action } from '../../application/ports/permission.service.interface'
import { User } from '../../domain/entities/user.entity'

export type Subjects = InferSubjects<typeof Feedback | typeof User> | 'all'
export type AppAbility = MongoAbility<[Action, Subjects]>
