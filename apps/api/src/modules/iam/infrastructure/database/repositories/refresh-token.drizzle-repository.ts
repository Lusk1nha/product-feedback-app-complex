import { Inject, Injectable } from '@nestjs/common'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { eq } from 'drizzle-orm'

import * as schema from 'src/shared/infrastructure/database/schema'
import { RefreshToken } from 'src/modules/iam/domain/entities/refresh-token.entity'
import { IRefreshTokenRepository } from 'src/modules/iam/domain/repositories/refresh-token.repository.interface'
import { DRIZZLE_PROVIDER } from 'src/shared/infrastructure/database/database.module'
import { RefreshTokenMapper } from '../mappers/refresh-token.mapper'

@Injectable()
export class RefreshTokenDrizzleRepository implements IRefreshTokenRepository {
	constructor(
		@Inject(DRIZZLE_PROVIDER)
		private readonly db: NodePgDatabase<typeof schema>,
	) {}

	async create(entity: RefreshToken): Promise<RefreshToken> {
		const data = RefreshTokenMapper.toPersistence(entity)

		const [created] = await this.db
			.insert(schema.refreshTokens)
			.values(data)
			.returning()

		return RefreshTokenMapper.toDomain(created)
	}

	async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
		const found = await this.db.query.refreshTokens.findFirst({
			where: (refreshTokens, { eq }) => eq(refreshTokens.tokenHash, tokenHash),
		})

		if (!found) return null

		return RefreshTokenMapper.toDomain(found)
	}

	async deleteByTokenHash(tokenHash: string): Promise<void> {
		await this.db
			.delete(schema.refreshTokens)
			.where(eq(schema.refreshTokens.tokenHash, tokenHash))
	}

	async deleteAllByUserId(userId: number): Promise<void> {
		await this.db
			.delete(schema.refreshTokens)
			.where(eq(schema.refreshTokens.userId, userId))
	}
}
