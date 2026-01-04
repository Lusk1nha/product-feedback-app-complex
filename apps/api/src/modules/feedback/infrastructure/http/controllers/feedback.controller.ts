import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseIntPipe,
	Post,
	Put,
	Query,
} from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { Auth } from 'src/shared/infrastructure/http/decorators/auth.decorator'
import {
	FeedbackPresenter,
	FeedbackResponse,
} from '../presenters/feedback.presenter'
import { CreateFeedbackDto } from '../dtos/feedback/create-feedback.dto'
import { User } from 'src/modules/iam/domain/entities/user.entity'
import { CurrentUser } from 'src/modules/iam/infrastructure/http/decorators/current-user.decorator'
import { CreateFeedbackUseCase } from 'src/modules/feedback/application/use-cases/feedback/create-feedback.usecase'
import { GetFeedbackByIdUseCase } from 'src/modules/feedback/application/use-cases/feedback/get-feedback-by-id.usecase'
import { UpdateFeedbackUseCase } from 'src/modules/feedback/application/use-cases/feedback/update-feedback.usecase'
import { DeleteFeedbackUseCase } from 'src/modules/feedback/application/use-cases/feedback/delete-feedback.usecase'
import { ResponseMessage } from 'src/shared/infrastructure/http/decorators/response.decorator'
import { UpdateFeedbackDto } from '../dtos/feedback/update-feedback.dto'
import { ListFeedbacksDto } from '../dtos/feedback/list-feedbacks.dto'
import { ListFeedbacksUseCase } from 'src/modules/feedback/application/use-cases/feedback/list-feedback.usecase'
import { toCollection } from 'src/shared/interface/http/presenters/collection.presenter'
import { GetRoadmapDataUseCase } from '@/modules/feedback/application/use-cases/feedback/get-roadmap-data.usecase'

@ApiTags('Feedbacks')
@Controller('feedbacks')
@Auth()
export class FeedbackController {
	constructor(
		private readonly getFeedbackByIdUseCase: GetFeedbackByIdUseCase,
		private readonly listFeedbacksUseCase: ListFeedbacksUseCase,

		private readonly createFeedbackUseCase: CreateFeedbackUseCase,
		private readonly updateFeedbackUseCase: UpdateFeedbackUseCase,
		private readonly deleteFeedbackUseCase: DeleteFeedbackUseCase,
	) {}

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
			params: {
				categorySlug: dto.categorySlug,
				description: dto.description,
				title: dto.title,
			},
		})

		return FeedbackPresenter.toHTTP(feedback)
	}

	@ApiOperation({ summary: 'Get a feedback by id' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'The feedback',
		type: FeedbackResponse,
	})
	@Get(':id')
	@HttpCode(HttpStatus.OK)
	async get(
		@Param('id', ParseIntPipe) id: number,
		@CurrentUser() currentUser: User,
	) {
		const feedback = await this.getFeedbackByIdUseCase.execute({
			id,
			currentUser,
		})
		return FeedbackPresenter.toHTTP(feedback)
	}

	@ApiOperation({ summary: 'Update a feedback by id' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'The updated feedback',
		type: FeedbackResponse,
	})
	@Put(':id')
	@HttpCode(HttpStatus.OK)
	async update(
		@Param('id', ParseIntPipe) id: number,
		@Body() dto: UpdateFeedbackDto,
		@CurrentUser() currentUser: User,
	) {
		const feedback = await this.updateFeedbackUseCase.execute({
			targetFeedbackId: id,
			currentUser,
			params: {
				title: dto.title,
				description: dto.description,
				categorySlug: dto.categorySlug,
				statusSlug: dto.statusSlug,
			},
		})

		return FeedbackPresenter.toHTTP(feedback)
	}

	@ApiOperation({ summary: 'Delete a feedback by id' })
	@ApiResponse({
		status: HttpStatus.OK,
	})
	@Delete(':id')
	@ResponseMessage('Feedback deleted successfully')
	@HttpCode(HttpStatus.OK)
	async delete(
		@Param('id', ParseIntPipe) id: number,
		@CurrentUser() currentUser: User,
	) {
		await this.deleteFeedbackUseCase.execute({ feedbackId: id, currentUser })
	}

	@ApiOperation({
		summary: 'List feedbacks with filters, sorting and pagination',
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'List of feedbacks',
		type: [FeedbackResponse],
	})
	@Get()
	async findAll(
		@Query() query: ListFeedbacksDto,
		@CurrentUser() currentUser: User,
	) {
		const result = await this.listFeedbacksUseCase.execute({
			currentUser,
			category: query.category,
			sort: query.sort,
			page: query.page, // Vem do DTO herdado
			perPage: query.perPage, // Vem do DTO herdado
		})

		return toCollection(result, FeedbackPresenter.toHTTP)
	}
}
