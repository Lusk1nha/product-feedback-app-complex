import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import {
	HealthCheck,
	HealthCheckService,
	MemoryHealthIndicator,
} from '@nestjs/terminus'
import { DrizzleHealthIndicator } from './drizzle.health'
import { IgnoreTransform } from 'src/shared/infrastructure/http/decorators/response.decorator'

@ApiTags('Health')
@Controller('health')
export class HealthController {
	constructor(
		private health: HealthCheckService,
		private db: DrizzleHealthIndicator,
		private memory: MemoryHealthIndicator,
	) {}

	@ApiOperation({ summary: 'Application Health Check' })
	@Get()
	@HealthCheck()
	@IgnoreTransform()
	check() {
		return this.health.check([
			() => this.db.isHealthy('database'),
			() => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
		])
	}
}
