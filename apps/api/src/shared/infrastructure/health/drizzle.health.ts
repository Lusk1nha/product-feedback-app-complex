import { Inject, Injectable } from '@nestjs/common'
import { HealthIndicatorService } from '@nestjs/terminus'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { sql } from 'drizzle-orm'
import { DRIZZLE_PROVIDER } from 'src/shared/infrastructure/database/database.module'
import * as schema from 'src/shared/infrastructure/database/schema'

@Injectable()
export class DrizzleHealthIndicator {
	constructor(
		@Inject(DRIZZLE_PROVIDER)
		private readonly db: NodePgDatabase<typeof schema>,

		private readonly healthIndicatorService: HealthIndicatorService,
	) {}

	async isHealthy(key: string) {
		// 1. Inicia o check com a chave (ex: 'database')
		const indicator = this.healthIndicatorService.check(key)

		try {
			// 2. Executa a query de teste
			await this.db.execute(sql`SELECT 1`)

			// 3. Sucesso: Marca como UP
			return indicator.up()
		} catch (error) {
			// 4. Falha: Marca como DOWN e anexa o erro
			return indicator.down({ message: error.message })
		}
	}
}
