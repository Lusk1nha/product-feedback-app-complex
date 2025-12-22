import { User } from '../../../domain/entities/user.entity'
import { UserRole } from '../../../domain/enums/user-role.enum'

export interface UserResponse {
  id: number
  username: string
  email: string
  fullName: string
  avatar: string | null
  role: UserRole
}

export class UserPresenter {
  static toHTTP(user: User): UserResponse {
    return {
      id: user.id,
      username: user.username,
      email: user.email.getValue(),
      fullName: user.fullName,
      avatar: user.avatarUrl ?? null, // Garante null se for undefined
      role: user.role, // <--- O getter da entidade que corrigimos
    }
  }
}
