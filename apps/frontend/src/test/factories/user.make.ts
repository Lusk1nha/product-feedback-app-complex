import type { User } from '@/modules/iam/types/user.schemas'
import { faker } from '@faker-js/faker'

export class UserMakeFake {
	private static generateUser(overrides?: Partial<User>): User {
		return {
			id: faker.number.int(),
			username: faker.internet.username(),
			email: faker.internet.email(),
			fullName: faker.person.fullName(),
			role: faker.helpers.arrayElement(['USER', 'ADMIN']) as User['role'],
			avatarUrl: faker.image.avatar(),
			createdAt: faker.date.past().toISOString(),
			updatedAt: faker.date.recent().toISOString(),
			...overrides,
		}
	}

	public static build(overrides?: Partial<User>) {
		return this.generateUser(overrides)
	}

	public static buildMany(count: number, overrides?: Partial<User>) {
		return Array.from({ length: count }, () => this.generateUser(overrides))
	}
}
