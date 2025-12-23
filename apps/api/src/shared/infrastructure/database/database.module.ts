import * as schema from './schema'

import { Module, Global } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { Env } from '../environment/env.schema'

export const DRIZZLE_PROVIDER = Symbol('DRIZZLE_PROVIDER')

@Global()
@Module({
	providers: [
		{
			provide: DRIZZLE_PROVIDER,
			inject: [ConfigService],
			useFactory: async (configService: ConfigService<Env, true>) => {
				const connectionString = configService.get('DATABASE_URL', {
					infer: true,
				})

				const pool = new Pool({ connectionString })

				return drizzle(pool, { schema })
			},
		},
	],
	exports: [DRIZZLE_PROVIDER],
})
export class DatabaseModule {}
