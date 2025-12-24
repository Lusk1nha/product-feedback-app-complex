import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Inject,
	Param,
	ParseIntPipe,
	Put,
	Redirect,
	Res, // Usando o jeito NestJS de redirect
} from '@nestjs/common'
import {
	ApiOperation,
	ApiResponse,
	ApiTags,
	ApiNotFoundResponse,
} from '@nestjs/swagger'
import {
	IPermissionService,
	PERMISSION_SERVICE,
} from 'src/modules/iam/application/ports/permission.service.interface'
import { GetProfileUseCase } from 'src/modules/iam/application/use-cases/user/get-profile.usecase'
import { CurrentUser } from '../decorators/current-user.decorator'
import { User } from 'src/modules/iam/domain/entities/user.entity'

import {
	MeResponse,
	UserResponse,
	UserPresenter,
	UserPublicResponse,
} from '../presenters/user.presenter'
import { UpdateUserUseCase } from 'src/modules/iam/application/use-cases/user/update-user.usecase'
import { UpdateUserDto } from '../dtos/user/update-user.dto'
import { DeleteUserUseCase } from 'src/modules/iam/application/use-cases/user/delete-user.usecase'
import {
	IgnoreTransform,
	ResponseMessage,
} from 'src/shared/infrastructure/http/decorators/response.decorator'
import { GetUserAvatarUseCase } from 'src/modules/iam/application/use-cases/user/get-user-avatar.usecase'
import { Auth } from 'src/shared/infrastructure/http/decorators/auth.decorator' // <--- O Novo Decorator

import { Response } from 'express'

@ApiTags('Users')
@Controller('users')
export class UserController {
	constructor(
		@Inject(PERMISSION_SERVICE)
		private readonly permissionService: IPermissionService,

		private readonly getProfileUseCase: GetProfileUseCase,
		private readonly getUserAvatarUseCase: GetUserAvatarUseCase,
		private readonly updateUserUseCase: UpdateUserUseCase,
		private readonly deleteUserUseCase: DeleteUserUseCase,
	) {}

	@ApiOperation({ summary: 'Get current user profile and permissions' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'User profile and permissions',
		type: MeResponse,
	})
	@Auth() // <--- Simples: Apenas Logado
	@Get('me')
	@HttpCode(HttpStatus.OK)
	async getProfile(@CurrentUser() currentUser: User) {
		const userProfile = await this.getProfileUseCase.execute({
			targetUserId: currentUser.id,
		})
		const rules = this.permissionService.getRules(userProfile)

		return {
			user: UserPresenter.toHTTP(userProfile),
			rules,
		}
	}

	@ApiOperation({ summary: 'Get current user rules' })
	@ApiResponse({ status: HttpStatus.OK, description: 'User rules' })
	@Auth()
	@Get('me/rules')
	@HttpCode(HttpStatus.OK)
	async getRules(@CurrentUser() currentUser: User) {
		return this.permissionService.getRules(currentUser)
	}

	// --- Rotas Públicas ou Híbridas ---

	@ApiOperation({ summary: 'Get public user profile by user id' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'User public profile',
		type: UserPublicResponse,
	})
	@ApiNotFoundResponse({ description: 'User not found' })
	@Auth()
	@Get(':id')
	@HttpCode(HttpStatus.OK)
	async getProfileByUserId(@Param('id', ParseIntPipe) id: number) {
		const user = await this.getProfileUseCase.execute({
			targetUserId: id,
		})

		return UserPresenter.toPublicHTTP(user)
	}

	@ApiOperation({ summary: 'Redirect to user avatar image' })
	@ApiNotFoundResponse({ description: 'User not found' })
	@ApiResponse({ status: HttpStatus.OK, description: 'User avatar image' })
	@Auth()
	@Get(':id/avatar/image')
	@IgnoreTransform()
	async getUserAvatarImage(
		@Param('id', ParseIntPipe) id: number,
		@Res() res: Response,
	) {
		const avatarUrl = await this.getUserAvatarUseCase.execute({ userId: id })

		const finalUrl = avatarUrl || 'https://meu-cdn.com/default-avatar.png'
		return res.redirect(finalUrl)
	}

	@ApiOperation({ summary: 'Update user profile' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'User profile updated',
		type: UserResponse,
	})
	@Auth()
	@Put(':id')
	@ResponseMessage('Profile updated successfully')
	@HttpCode(HttpStatus.OK)
	async update(
		@Param('id', ParseIntPipe) id: number,
		@Body() dto: UpdateUserDto,
		@CurrentUser() currentUser: User,
	) {
		const user = await this.updateUserUseCase.execute({
			targetUserId: id,
			currentUser: currentUser,
			params: {
				username: dto.username,
				fullName: dto.fullName,
				avatarUrl: dto.avatarUrl,
			},
		})

		return UserPresenter.toHTTP(user)
	}

	@ApiOperation({ summary: 'Delete user' })
	@ApiResponse({ status: HttpStatus.OK, description: 'User deleted' })
	@Auth()
	@Delete(':id')
	@ResponseMessage('User deleted successfully')
	@HttpCode(HttpStatus.OK)
	async delete(
		@Param('id', ParseIntPipe) id: number,
		@CurrentUser() currentUser: User,
	) {
		await this.deleteUserUseCase.execute({
			currentUser: currentUser,
			targetUserId: id,
		})
	}
}
