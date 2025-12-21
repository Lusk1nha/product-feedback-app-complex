import { Account } from '../entities/account.entity'
import { User } from '../entities/user.entity'

export const USER_REPOSITORY = Symbol('USER_REPOSITORY')

export interface IUserRepository {
  create(user: User, initialAccount: Account): Promise<User>

  findByEmail(email: string): Promise<User | null>
  findById(id: number): Promise<User | null>

  findByEmailWithAccount(email: string): Promise<{ user: User; account: Account } | null>
}
