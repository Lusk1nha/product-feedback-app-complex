import { Injectable, Logger } from '@nestjs/common'
import { AbilityBuilder, createMongoAbility } from '@casl/ability'
import { IPermissionService } from '../../application/ports/permission.service.interface'
import { User } from '../../domain/entities/user.entity'
import { PermissionDeniedError } from '../../domain/errors/permission-denied.error'
import { Action, AppAbility } from '../types/permission.types'
import { AppPolicy } from '../../domain/policies/app.policy'
import { IPermissionBuilder } from '../../domain/policies/permission-builder.interface'

@Injectable()
export class CaslPermissionService implements IPermissionService {
	private readonly logger = new Logger(CaslPermissionService.name)

	ensureCan(user: User, action: Action, subject: any): void {
		const ability = this.createAbility(user)

		// Log para debug: O que estamos tentando fazer?
		console.log('[CASL Check]', {
			action,
			subjectName: this.getSubjectNameSafe(subject),
		})

		if (!ability.can(action, subject)) {
			// Se falhar, vamos ver quais regras existem para entender o porquê
			console.log('[CASL Denied] Rules for User:', ability.rules)
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
				const name = this.parseSubjectName(subject)
				can(action, name as any, conditions)
			},
			cannot: (action, subject, conditions) => {
				const name = this.parseSubjectName(subject)
				cannot(action, name as any, conditions)
			},
		}

		AppPolicy.define(user, caslAdapter)

		return build({
			detectSubjectType: (item) => {
				return this.getSubjectNameSafe(item) as any
			},
		})
	}

	// Extraímos a lógica para um método helper seguro
	/**
	 * Tenta descobrir o nome da Entidade de todas as formas possíveis.
	 */
	private getSubjectNameSafe(item: any): string {
		if (!item) return 'Unknown'

		// 1. Se já for string (ex: passou 'Feedback' manualmente), retorna ela
		if (typeof item === 'string') return item

		// 2. Se for CLASSE (Create)
		if (typeof item === 'function') {
			// Se o nome estiver correto (diferente de 'Function'), usa ele
			if (item.name && item.name !== 'Function') {
				return item.name
			}

			// FALLBACK: Se o nome for 'Function', tentamos extrair do código fonte da classe
			// Ex: "class Feedback extends ..." -> regex pega "Feedback"
			const match = item.toString().match(/class\s+(\w+)/)
			if (match && match[1]) {
				return match[1]
			}

			// Última tentativa: Se não achou nada, retorna o .name mesmo (Function)
			return item.name
		}

		// 3. Se for INSTÂNCIA (Update/Delete)
		if (typeof item === 'object' && item.constructor) {
			// Mesma lógica de proteção para instância
			if (item.constructor.name && item.constructor.name !== 'Function') {
				return item.constructor.name
			}
			// Fallback da instância
			const match = item.constructor.toString().match(/class\s+(\w+)/)
			if (match && match[1]) {
				return match[1]
			}
			return item.constructor.name
		}

		return 'Unknown'
	}

	private parseSubjectName(subject: any): string {
		if (typeof subject === 'string') return subject
		if (typeof subject === 'function') return subject.name
		return 'Unknown'
	}
}
