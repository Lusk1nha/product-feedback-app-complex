import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { GetAppMetadataUseCase } from '../../../application/use-cases/get-app-metadata.usecase'
import {
	AppMetadataResponse,
	MetadataPresenter,
} from '../presenters/metadata.presenter'

@ApiTags('Config')
@Controller('config')
export class MetadataController {
	constructor(private readonly getAppMetadataUseCase: GetAppMetadataUseCase) {}

	@ApiOperation({
		summary: 'Get application metadata (categories and statuses)',
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'App configuration data',
		type: AppMetadataResponse,
	})
	// @Auth()
	@Get('metadata')
	@HttpCode(HttpStatus.OK)
	async getMetadata() {
		const metadata = await this.getAppMetadataUseCase.execute()
		return MetadataPresenter.toHTTP(metadata)
	}
}
