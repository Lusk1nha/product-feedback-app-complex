import { BaseEntity } from 'src/shared/domain/entities/base.entity'

export type AuthProvider = 'local' | 'google'

export interface AccountProps {
  userId: number // Referência ao pai
  provider: AuthProvider
  providerAccountId: string
  password?: string | null
}

export class Account extends BaseEntity {
  private props: AccountProps

  private constructor(props: AccountProps, id?: number) {
    super({ id })
    this.props = props
  }

  static createLocal(props: {
    email: string
    passwordHash: string
    userId?: number
  }) {
    return new Account({
      userId: props.userId ?? 0, // Ou undefined, dependendo de como sua BaseEntity trata
      provider: 'local',
      providerAccountId: props.email,
      password: props.passwordHash,
    })
  }

  static createOAuth(
    userId: number,
    provider: AuthProvider,
    providerId: string,
  ) {
    return new Account({
      userId,
      provider,
      providerAccountId: providerId,
      password: null,
    })
  }

  get provider() {
    return this.props.provider
  }

  get password() {
    return this.props.password
  }

  get providerAccountId() {
    return this.props.providerAccountId
  }
}
