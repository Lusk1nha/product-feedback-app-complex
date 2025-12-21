import { Injectable } from '@nestjs/common'
import { faker } from '@faker-js/faker'
import { RegisterCommand, RegisterUseCase } from '../../src/modules/iam/application/use-cases/auth/register.usecase'

@Injectable()
export class UserFactory {
  constructor(private readonly registerUseCase: RegisterUseCase) {}

  async make(overrides: Partial<RegisterCommand> = {}) {
    const password = overrides.password ?? 'StrongPass123!'

    const command: RegisterCommand = {
      username: overrides.username ?? faker.internet.username(),
      email: (overrides.email ?? faker.internet.email()).toLowerCase(),
      fullName: overrides.fullName ?? faker.person.fullName(),
      password: password,
      avatarUrl: overrides.avatarUrl,
    }

    const user = await this.registerUseCase.execute(command)

    // Retornamos um objeto composto para ajudar nos testes
    return {
      user, // A entidade criada (com ID, etc)
      originalPassword: password, // A senha "raw" para fazer login
      email: command.email, // O email usado
    }
  }
}
