import { User } from '../../domain/entities/user.entity'
import { Action } from '../../infrastructure/types/permission.types'

// Interface agnóstica (não retorna tipos do CASL, retorna boolean/void)
export const PERMISSION_SERVICE = Symbol('PERMISSION_SERVICE')

export interface IPermissionService {
	/**
	 * Verifica permissão.
	 * subject: pode ser string ('all', 'Feedback') ou uma instância de entidade.
	 */
	ensureCan(user: User, action: Action, subject: any): void

	getRules(user: User): unknown
}
