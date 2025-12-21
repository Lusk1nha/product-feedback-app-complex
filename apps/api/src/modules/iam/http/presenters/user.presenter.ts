import { User } from '../../domain/entities/user.entity'

export class UserPresenter {
  static toHTTP(user: User) {
    return {
      id: user.id,
      username: user.username,
      email: user.email.getValue(),
      fullName: user.fullName,
      avatar: user.avatarUrl,
    }
  }
}
