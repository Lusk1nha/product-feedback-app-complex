import { BaseEntity } from 'src/shared/domain/entities/base.entity'

export interface RefreshTokenProps {
	userId: number
	tokenHash: string
	expiresAt: Date
}

export class RefreshToken extends BaseEntity {
	private props: RefreshTokenProps

	// Construtor privado para forçar uso do método create
	private constructor(props: RefreshTokenProps, id?: number) {
		super({ id })
		this.props = props
	}

	/**
	 * Cria uma nova instância (para ser salva no banco).
	 */
	static create(props: RefreshTokenProps) {
		return new RefreshToken(props)
	}

	/**
	 * Reconstrói uma instância vinda do banco de dados (Hydration).
	 */
	static rebuild(props: RefreshTokenProps, id: number) {
		return new RefreshToken(props, id)
	}

	// Getters para proteger a imutabilidade das props
	get userId() {
		return this.props.userId
	}

	get tokenHash() {
		return this.props.tokenHash
	}

	get expiresAt() {
		return this.props.expiresAt
	}

	// Regra de Domínio: Verifica se já expirou
	get isExpired(): boolean {
		return new Date() > this.props.expiresAt
	}
}
