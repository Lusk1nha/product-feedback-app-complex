import { Injectable } from '@nestjs/common'
import { faker } from '@faker-js/faker'
import {
  CreateUserUseCase,
  CreateUserCommand,
} from '../../src/modules/iam/application/use-cases/users/create-user.usecase'

@Injectable()
export class UserFactory {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  async make(overrides: Partial<CreateUserCommand> = {}) {
    const password = overrides.password ?? 'StrongPass123!'

    const command: CreateUserCommand = {
      username: overrides.username ?? faker.internet.username(),
      email: (overrides.email ?? faker.internet.email()).toLowerCase(),
      fullName: overrides.fullName ?? faker.person.fullName(),
      password: password,
      avatarUrl: overrides.avatarUrl,
    }

    const user = await this.createUserUseCase.execute(command)

    // Retornamos um objeto composto para ajudar nos testes
    return {
      user, // A entidade criada (com ID, etc)
      originalPassword: password, // A senha "raw" para fazer login
      email: command.email, // O email usado
    }
  }
}
