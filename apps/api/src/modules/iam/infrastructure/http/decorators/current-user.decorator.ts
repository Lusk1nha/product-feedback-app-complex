import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common'
import { User } from 'src/modules/iam/domain/entities/user.entity'

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): User => {
  const request = ctx.switchToHttp().getRequest()

  if (!request.user) {
    throw new InternalServerErrorException(
      'CRITICAL: @CurrentUser() decorator was used without @UseGuards(JwtAuthGuard). Please add the guard to the controller or handler.',
    )
  }

  return request.user
})
