import { Account } from '../entities/account.entity'
import { User } from '../entities/user.entity'

export const USER_REPOSITORY = Symbol('USER_REPOSITORY')

export interface IUserRepository {
	create(user: User, initialAccount: Account): Promise<User>
	update(user: User): Promise<User>
	delete(user: User): Promise<void>

	findById(id: number): Promise<User | null>
	findByIdOrThrow(id: number): Promise<User>

	findAvatarById(id: number): Promise<string | null>

	findByUsername(username: string): Promise<User | null>
	findByEmail(email: string): Promise<User | null>

	findByEmailWithAccount(
		email: string,
	): Promise<{ user: User; account: Account } | null>
}
