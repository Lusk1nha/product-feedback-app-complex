import { BaseEntity } from 'src/shared/domain/base.entity'
import { Email } from 'src/modules/iam/domain/value-objects/email.vo'
import { Account } from './account.entity'

export interface UserProps {
  username: string
  email: Email
  avatarUrl?: string | null
  fullName: string
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
  static create(props: { username: string; email: string; fullName: string; avatarUrl?: string }) {
    if (props.username.length < 3) {
      throw new Error('Username must be at least 3 characters long')
    }

    return new User({
      username: props.username,
      fullName: props.fullName,
      email: Email.create(props.email), // Validação acontece aqui
      avatarUrl: props.avatarUrl ?? null,
    })
  }

  // Reconstruction Method: Para carregar do Banco de Dados
  static rebuild(
    props: {
      username: string
      email: string
      fullName: string
      avatarUrl?: string | null
    },
    id: number,
  ) {
    return new User(
      {
        ...props,
        email: Email.create(props.email), // Revalida ou cria instância direta
      },
      id,
    )
  }

  addAccount(account: Account) {
    this._accounts.push(account)
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
