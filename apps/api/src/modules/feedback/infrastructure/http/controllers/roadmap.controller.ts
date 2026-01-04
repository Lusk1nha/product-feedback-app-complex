import {
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	UseInterceptors,
} from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'
import { GetRoadmapStatsUseCase } from '../../../application/use-cases/feedback/get-roadmap-stats.usecase'
import { Auth } from 'src/shared/infrastructure/http/decorators/auth.decorator'
import {
	RoadmapStatsPresenter,
	RoadmapDataPresenter,
} from '../presenters/roadmap.presenter'
import { User } from 'src/modules/iam/domain/entities/user.entity'
import { CurrentUser } from 'src/modules/iam/infrastructure/http/decorators/current-user.decorator'
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager'
import { GetRoadmapDataUseCase } from '@/modules/feedback/application/use-cases/feedback/get-roadmap-data.usecase'

@Controller('roadmap')
@Auth()
export class RoadmapController {
	constructor(
		private readonly getRoadmapStatsUseCase: GetRoadmapStatsUseCase,
		private readonly getRoadmapDataUseCase: GetRoadmapDataUseCase,
	) {}

	@ApiOperation({ summary: 'Get feedback counts by status' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Returns a map of status slugs to their counts',
	})
	@Get('stats')
	@UseInterceptors(CacheInterceptor)
	@CacheTTL(60000)
	@HttpCode(HttpStatus.OK)
	async getStats() {
		const stats = await this.getRoadmapStatsUseCase.execute()
		return RoadmapStatsPresenter.toHTTP(stats)
	}

	@ApiOperation({ summary: 'Get roadmap data' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Returns roadmap data',
	})
	@Get('data')
	@UseInterceptors(CacheInterceptor)
	@CacheTTL(60000)
	@HttpCode(HttpStatus.OK)
	async getData(@CurrentUser() currentUser: User) {
		const data = await this.getRoadmapDataUseCase.execute({
			currentUser,
		})

		return RoadmapDataPresenter.toHTTP(data)
	}
}
