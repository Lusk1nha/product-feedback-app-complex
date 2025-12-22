import * as schema from 'src/shared/infrastructure/database/schema'

import { Injectable, Inject } from '@nestjs/common'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { eq } from 'drizzle-orm'
import { DRIZZLE_PROVIDER } from 'src/shared/infrastructure/database/database.module'
import { IUserRepository } from '../../../domain/repositories/user.repository.interface'
import { User } from '../../../domain/entities/user.entity'
import { UserMapper } from '../mappers/user.mapper'
import { Account } from 'src/modules/iam/domain/entities/account.entity'
import { UserNotFoundError } from 'src/modules/iam/domain/errors/user-not-found.error'

@Injectable()
export class UserDrizzleRepository implements IUserRepository {
  constructor(
    @Inject(DRIZZLE_PROVIDER)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async create(user: User, initialAccount: Account): Promise<User> {
    return await this.db.transaction(async (tx) => {
      const userData = UserMapper.toPersistence(user)
      const [insertedUser] = await tx
        .insert(schema.users)
        .values(userData)
        .returning()

      const accountData = {
        userId: insertedUser.id,
        provider: initialAccount.provider,
        providerAccountId: initialAccount.providerAccountId,
        password: initialAccount.password,
      }

      await tx.insert(schema.accounts).values(accountData)

      // Retorna o domínio completo
      return UserMapper.toDomain(insertedUser)
    })
  }

  async update(user: User): Promise<User> {
    return await this.db.transaction(async (tx) => {
      const userData = UserMapper.toPersistence(user)
      const [updatedUser] = await tx
        .update(schema.users)
        .set(userData)
        .where(eq(schema.users.id, user.id))
        .returning()

      return UserMapper.toDomain(updatedUser)
    })
  }

  async delete(user: User): Promise<void> {
    return await this.db
      .delete(schema.users)
      .where(eq(schema.users.id, user.id))
  }

  async findByEmailWithAccount(
    email: string,
  ): Promise<{ user: User; account: Account } | null> {
    const result = await this.db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
      with: {
        accounts: {
          where: (accounts, { eq }) => eq(accounts.provider, 'local'),
          limit: 1,
        },
      },
    })

    if (!result || !result.accounts[0]) return null

    const userDomain = UserMapper.toDomain(result)
    const accountDomain = Account.createLocal({
      email: result.email,
      passwordHash: result.accounts[0].password!,
      userId: result.id,
    })

    return { user: userDomain, account: accountDomain }
  }

  async findByEmail(email: string): Promise<User | null> {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1)

    return user ? UserMapper.toDomain(user) : null
  }

  async findById(id: number): Promise<User | null> {
    const result = await this.db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, id),
    })

    if (!result) return null
    return UserMapper.toDomain(result)
  }

  async findByIdOrThrow(id: number): Promise<User> {
    const result = await this.findById(id)
    if (!result) throw new UserNotFoundError()
    return result
  }

  async findByUsername(username: string): Promise<User | null> {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, username))
      .limit(1)
    return user ? UserMapper.toDomain(user) : null
  }
}
