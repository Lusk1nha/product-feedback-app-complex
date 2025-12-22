import { User } from '../../domain/entities/user.entity'
import { AppAbility } from '../../infrastructure/types/permission.types'

// Interface agnóstica (não retorna tipos do CASL, retorna boolean/void)
export const PERMISSION_SERVICE = Symbol('PERMISSION_SERVICE')

// Enums de Ação pertencem ao DOMÍNIO (Regra de Negócio)
export enum Action {
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
  Manage = 'manage',
}

export interface IPermissionService {
  /**
   * Verifica permissão.
   * subject: pode ser string ('all', 'Feedback') ou uma instância de entidade.
   */
  requirePermission(user: User, action: Action, subject: any): void

  getRules(user: User): unknown
}
