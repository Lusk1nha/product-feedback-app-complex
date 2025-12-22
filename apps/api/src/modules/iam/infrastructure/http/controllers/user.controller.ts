import { Controller, Get, Inject, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { IPermissionService, PERMISSION_SERVICE } from 'src/modules/iam/application/ports/permission.service.interface'
import { GetProfileUseCase } from 'src/modules/iam/application/use-cases/user/get-profile.usecase'
import { CurrentUser } from '../decorators/current-user.decorator'
import { User } from 'src/modules/iam/domain/entities/user.entity'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { UserPresenter } from '../presenters/user.presenter'

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(
    @Inject(PERMISSION_SERVICE) private readonly permissionService: IPermissionService,
    private readonly getProfileUseCase: GetProfileUseCase,
  ) {}

  @ApiOperation({ summary: 'Get current user profile and permissions' })
  @ApiResponse({ status: 200, description: 'User profile and permissions' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@CurrentUser() currentUser: User) {
    const userProfile = await this.getProfileUseCase.execute(currentUser.id)
    const rules = this.permissionService.getRules(userProfile)

    return {
      user: UserPresenter.toHTTP(userProfile),
      rules,
    }
  }
}
