import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Post,
} from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { GetRoadmapStatsUseCase } from '../../../application/use-cases/feedback/get-roadmap-stats.usecase'
import { Auth } from 'src/shared/infrastructure/http/decorators/auth.decorator'
import {
	FeedbackPresenter,
	FeedbackResponse,
	RoadmapStatsPresenter,
} from '../presenters/feedback.presenter'
import { CreateFeedbackDto } from '../dtos/feedback/create-feedback.dto'
import { User } from 'src/modules/iam/domain/entities/user.entity'
import { CurrentUser } from 'src/modules/iam/infrastructure/http/decorators/current-user.decorator'
import { CreateFeedbackUseCase } from 'src/modules/feedback/application/use-cases/feedback/create-feedback.usecase'

@ApiTags('Feedbacks')
@Controller('feedbacks')
@Auth()
export class FeedbackController {
	constructor(
		private readonly getRoadmapStatsUseCase: GetRoadmapStatsUseCase,

		private readonly createFeedbackUseCase: CreateFeedbackUseCase,
	) {}

	@ApiOperation({ summary: 'Get feedback counts by status' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Returns a map of status slugs to their counts',
	})
	@Get('stats')
	@HttpCode(HttpStatus.OK)
	async getStats() {
		const stats = await this.getRoadmapStatsUseCase.execute()
		return RoadmapStatsPresenter.toHTTP(stats)
	}

	@ApiOperation({ summary: 'Create a new feedback' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'The created feedback',
		type: FeedbackResponse,
	})
	@Post()
	@HttpCode(HttpStatus.CREATED)
	async create(
		@Body() dto: CreateFeedbackDto,
		@CurrentUser() currentUser: User,
	) {
		const feedback = await this.createFeedbackUseCase.execute({
			currentUser,
			params: dto,
		})

		return FeedbackPresenter.toHTTP(feedback)
	}
}
