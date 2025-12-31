import * as schema from 'src/shared/infrastructure/database/schema'

import { Inject, Injectable } from '@nestjs/common'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { sql, eq } from 'drizzle-orm'
import { DRIZZLE_PROVIDER } from 'src/shared/infrastructure/database/database.module'
import { IFeedbackRepository } from '../../domain/repositories/feedback.repository.interface'
import { Feedback } from '../../domain/entities/feedback.entity'
import { FeedbackMapper } from '../database/mappers/feedback.mapper'

@Injectable()
export class FeedbackDrizzleRepository implements IFeedbackRepository {
	constructor(
		@Inject(DRIZZLE_PROVIDER)
		private readonly db: NodePgDatabase<typeof schema>,
	) {}

	async create(feedback: Feedback): Promise<Feedback> {
		const persistenceData = FeedbackMapper.toPersistence(feedback)

		const [inserted] = await this.db
			.insert(schema.feedbacks)
			.values(persistenceData)
			.returning()

		return FeedbackMapper.toDomain(inserted)
	}

	async countByStatus(): Promise<Record<string, number>> {
		const rows = await this.db
			.select({
				status: schema.feedbacks.statusSlug,
				count: sql<number>`cast(count(${schema.feedbacks.id}) as int)`,
			})
			.from(schema.feedbacks)
			.where(eq(schema.feedbacks.enabled, true))
			.groupBy(schema.feedbacks.statusSlug)

		return rows.reduce(
			(acc, curr) => {
				acc[curr.status] = curr.count
				return acc
			},
			{} as Record<string, number>,
		)
	}
}
