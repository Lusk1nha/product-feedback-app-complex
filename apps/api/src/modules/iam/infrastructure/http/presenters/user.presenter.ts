import { IPresenter } from 'src/shared/application/interfaces/presenter.interface'
import { User } from '../../../domain/entities/user.entity'
import { UserRole } from '../../../domain/enums/user-role.enum'
import { ApiProperty } from '@nestjs/swagger'

export class UserResponse {
  @ApiProperty({ example: 1 })
  id: number

  @ApiProperty({ example: 'lucas_dev' })
  username: string

  @ApiProperty({ example: 'lucas@email.com', required: false })
  email?: string

  @ApiProperty({ example: 'Lucas Pedro' })
  fullName: string

  @ApiProperty({ example: 'https://avatar.url', nullable: true })
  avatarUrl: string | null

  @ApiProperty({ enum: UserRole, example: UserRole.USER })
  role: UserRole
}

export class UserPublicResponse {
  @ApiProperty({ example: 1 })
  id: number

  @ApiProperty({ example: 'lucas_dev' })
  username: string

  @ApiProperty({ example: 'Lucas Pedro' })
  fullName: string

  @ApiProperty({ example: 'https://avatar.url', nullable: true })
  avatarUrl: string | null
}

export class MeResponse {
  @ApiProperty({ type: UserResponse })
  user: UserResponse

  @ApiProperty({ type: [String] })
  rules: string[]
}

export class UserPresenter {
  // Tornamos static para facilitar o uso no controller
  static toHTTP(user: User): UserResponse {
    return {
      id: user.id,
      username: user.username,
      email: user.email.getValue(),
      fullName: user.fullName,
      avatarUrl: user.avatarUrl ?? null,
      role: user.role,
    }
  }

  static toPublicHTTP(user: User): UserPublicResponse {
    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl ?? null,
    }
  }
}
