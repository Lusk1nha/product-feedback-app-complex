import { UserRole } from 'src/modules/iam/domain/enums/user-role.enum'
import { User } from '../../../domain/entities/user.entity'
import { users } from '../schema/iam.schema'

type UserSelect = typeof users.$inferSelect
type UserInsert = typeof users.$inferInsert

export class UserMapper {
  static toDomain(raw: UserSelect): User {
    return User.rebuild(
      {
        username: raw.username,
        email: raw.email,
        fullName: raw.fullName,
        avatarUrl: raw.avatarUrl,

        role: raw.role as UserRole,
      },
      raw.id,
    )
  }

  static toPersistence(entity: User): UserInsert {
    return {
      // id é serial, não precisa passar no insert
      username: entity.username,
      email: entity.email.getValue(),
      fullName: entity.fullName,
      avatarUrl: entity.avatarUrl ?? null,

      role: entity.role,
    }
  }
}
