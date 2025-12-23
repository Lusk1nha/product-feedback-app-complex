import { InferSubjects, MongoAbility } from '@casl/ability'
import { User } from '../../domain/entities/user.entity'
import { Feedback } from 'src/modules/feedback/domain/entities/feedback.entity'

export enum Action {
	Manage = 'manage',
	Create = 'create',
	Read = 'read',
	Update = 'update',
	Delete = 'delete',
}

// CORREÇÃO DEFINITIVA:
export type Subjects =
	| InferSubjects<typeof Feedback>
	| User // Aceita a INSTÂNCIA (para checagem: ability.can(act, user))
	| { new (...args: any[]): User } // Aceita a CLASSE (para regras: can(act, UserClass))
	| 'all'

export type AppAbility = MongoAbility<[Action, Subjects]>
