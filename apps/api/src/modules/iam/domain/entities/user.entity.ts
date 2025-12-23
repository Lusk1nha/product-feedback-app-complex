import { BaseEntity } from 'src/shared/domain/entities/base.entity'
import { Email } from 'src/modules/iam/domain/value-objects/email.vo'

import { Account } from './account.entity'
import { UserRole } from '../enums/user-role.enum'

import { UserUsernameTooShortError } from '../errors/user-username-too-short.error'

export interface UserProps {
	username: string
	email: Email
	fullName: string

	role: UserRole
	avatarUrl?: string | null
}

export class User extends BaseEntity {
	private props: UserProps
	private _accounts: Account[] = [] // O usuário carrega suas contas

	// Construtor privado para uso interno
	private constructor(props: UserProps, id?: number) {
		super({ id })
		this.props = props
	}

	// Factory Method: Criação de um NOVO usuário
	static create(props: {
		username: string
		email: string
		fullName: string
		avatarUrl?: string
		role?: UserRole
	}) {
		if (props.username.length < 3) {
			throw new UserUsernameTooShortError()
		}

		return new User({
			username: props.username,
			fullName: props.fullName,
			email: Email.create(props.email), // Validação acontece aqui
			avatarUrl: props.avatarUrl ?? null,
			role: props.role ?? UserRole.USER,
		})
	}

	// Reconstruction Method: Para carregar do Banco de Dados
	static rebuild(
		props: {
			username: string
			email: string
			fullName: string
			avatarUrl?: string | null
			role?: UserRole
		},
		id: number,
	) {
		return new User(
			{
				...props,
				email: Email.create(props.email), // Revalida ou cria instância direta
				role: props.role ?? UserRole.USER,
			},
			id,
		)
	}

	update(params: {
		username?: string
		fullName?: string
		avatarUrl?: string | null
	}) {
		if (params.username !== undefined) {
			if (params.username.length < 3) {
				throw new UserUsernameTooShortError()
			}

			this.props.username = params.username
		}

		if (params.fullName !== undefined) {
			this.props.fullName = params.fullName
		}

		if (params.avatarUrl !== undefined) {
			this.props.avatarUrl = params.avatarUrl
		}
	}

	addAccount(account: Account) {
		this._accounts.push(account)
	}

	get role() {
		return this.props.role
	}

	get accounts() {
		return this._accounts
	}

	get username() {
		return this.props.username
	}

	get email() {
		return this.props.email
	}

	get fullName() {
		return this.props.fullName
	}

	get avatarUrl() {
		return this.props.avatarUrl
	}
}
