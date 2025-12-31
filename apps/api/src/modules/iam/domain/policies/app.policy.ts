import { User } from '../entities/user.entity'
import { Feedback } from 'src/modules/feedback/domain/entities/feedback.entity'
import { Action } from '../../infrastructure/types/permission.types'
import { IPermissionBuilder } from './permission-builder.interface'

/**
 * PURE DOMAIN LOGIC
 * Aqui centralizamos todas as regras de negócio de permissão.
 */
export class AppPolicy {
	static define(user: User, builder: IPermissionBuilder) {
		// 1. Regras de SUPER ADMIN
		if (user.role === 'ADMIN') {
			builder.can(Action.Manage, 'all')
			return // Admin sai cedo, tem poder total
		}

		// 2. Regras de USUÁRIO COMUM
		builder.can(Action.Read, 'all')

		// Regra: Pode ler e criar feedbacks
		builder.can(Action.Read, Feedback)
		builder.can(Action.Create, Feedback)
		// Regra: Pode gerenciar seus próprios feedbacks
		builder.can(Action.Update, Feedback, { authorId: user.id,  })
		// Regra: Pode deletar seus próprios feedbacks
		builder.can(Action.Delete, Feedback, { authorId: user.id })

		// Regra: Pode atualizar seu próprio perfil
		// Nota: Passamos a classe User aqui. O Adapter na infra vai lidar com o construtor privado.
		builder.can(Action.Update, User, { id: user.id })
		builder.can(Action.Delete, User, { id: user.id })
	}
}
