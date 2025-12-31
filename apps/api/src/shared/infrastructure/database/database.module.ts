import * as schema from './schema'
import { Module, Global, OnApplicationShutdown, Inject } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { Env } from '../environment/env.schema'

export const DRIZZLE_PROVIDER = Symbol('DRIZZLE_PROVIDER')
export const DATABASE_CONNECTION = Symbol('DATABASE_CONNECTION') // 👈 Novo token

@Global()
@Module({
	providers: [
		// 1. Provider da Conexão Pura (Pool)
		{
			provide: DATABASE_CONNECTION,
			inject: [ConfigService],
			useFactory: (configService: ConfigService<Env, true>) => {
				const connectionString = configService.get('DATABASE_URL', {
					infer: true,
				})
				return new Pool({ connectionString })
			},
		},
		// 2. Provider do Drizzle (Injeta a conexão acima)
		{
			provide: DRIZZLE_PROVIDER,
			inject: [DATABASE_CONNECTION], // 👈 Injeta o pool criado acima
			useFactory: (pool: Pool) => {
				return drizzle(pool, { schema })
			},
		},
	],
	exports: [DRIZZLE_PROVIDER], // Não precisamos exportar a conexão, só o ORM
})
export class DatabaseModule implements OnApplicationShutdown {
	constructor(@Inject(DATABASE_CONNECTION) private readonly pool: Pool) {}

	// 👇 Esse método é chamado automaticamente pelo Nest quando você mata o servidor
	async onApplicationShutdown() {
		console.log('🔌 Closing Database Connection Pool...')
		await this.pool.end()
		console.log('✅ Database Connection Pool Closed')
	}
}
