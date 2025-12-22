import { Action } from '../../infrastructure/types/permission.types'

/**
 * Contrato Abstrato: O Domínio usa isso para definir regras
 * sem saber que o CASL existe.
 */
export interface IPermissionBuilder {
  can(action: Action, subject: any, conditions?: any): void
  cannot(action: Action, subject: any, conditions?: any): void
}
