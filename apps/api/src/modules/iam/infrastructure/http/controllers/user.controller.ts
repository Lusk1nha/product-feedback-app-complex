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
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import {
  IPermissionService,
  PERMISSION_SERVICE,
} from 'src/modules/iam/application/ports/permission.service.interface'
import { GetProfileUseCase } from 'src/modules/iam/application/use-cases/user/get-profile.usecase'
import { CurrentUser } from '../decorators/current-user.decorator'
import { User } from 'src/modules/iam/domain/entities/user.entity'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import {
  MeResponse,
  UserPresenter,
  UserPublicResponse,
} from '../presenters/user.presenter'
import { UpdateUserUseCase } from 'src/modules/iam/application/use-cases/user/update-user.usecase'
import { UpdateUserDto } from '../dtos/user/update-user.dto'
import { DeleteUserUseCase } from 'src/modules/iam/application/use-cases/user/delete-user.usecase'

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(
    @Inject(PERMISSION_SERVICE)
    private readonly permissionService: IPermissionService,

    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @ApiOperation({ summary: 'Get current user profile and permissions' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User profile and permissions',
    type: MeResponse,
  })
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  @Get('me/rules')
  @HttpCode(HttpStatus.OK)
  async getRules(@CurrentUser() currentUser: User) {
    const rules = this.permissionService.getRules(currentUser)
    return rules
  }

  @ApiOperation({ summary: 'Get user profile by user id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User profile',
    type: UserPublicResponse,
  })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getProfileByUserId(@Param('id', ParseIntPipe) id: number) {
    const user = await this.getProfileUseCase.execute({
      targetUserId: id,
    })

    return UserPresenter.toPublicHTTP(user)
  }

  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User profile updated' })
  @UseGuards(JwtAuthGuard)
  @Put(':id')
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
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: User,
  ) {
    await this.deleteUserUseCase.execute({
      currentUser: currentUser,
      targetUserId: id,
    })

    return {
      message: 'User deleted',
    }
  }
}
