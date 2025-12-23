import { RefreshToken } from '../../../domain/entities/refresh-token.entity'
import { refreshTokens } from '../schema/iam.schema'

// Tipos inferidos do Drizzle
type RefreshTokenSelect = typeof refreshTokens.$inferSelect
type RefreshTokenInsert = typeof refreshTokens.$inferInsert

export class RefreshTokenMapper {
	static toDomain(raw: RefreshTokenSelect): RefreshToken {
		return RefreshToken.rebuild(
			{
				userId: raw.userId,
				tokenHash: raw.tokenHash,
				expiresAt: new Date(raw.expiresAt), // Garante que é Date
			},
			raw.id,
		)
	}

	static toPersistence(entity: RefreshToken): RefreshTokenInsert {
		return {
			// Se tiver ID, usa (update), senão undefined (insert auto-increment)
			id: entity.id || undefined,
			userId: entity.userId,
			tokenHash: entity.tokenHash,
			expiresAt: entity.expiresAt,
			// createdAt é gerenciado pelo defaultNow() do banco se for undefined
		}
	}
}
