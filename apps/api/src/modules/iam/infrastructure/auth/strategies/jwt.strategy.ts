import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { TokenPayload } from '../../../application/ports/token.provider.interface'
import { Env } from 'src/shared/infrastructure/environment/env.schema'
import { User } from 'src/modules/iam/domain/entities/user.entity'
import {
  IUserRepository,
  USER_REPOSITORY,
} from 'src/modules/iam/domain/repositories/user.repository.interface'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService<Env, true>,
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_ACCESS_SECRET', { infer: true }),
    })
  }

  async validate(payload: TokenPayload): Promise<User> {
    const user = await this.userRepository.findByIdOrThrow(payload.sub)
    return user
  }
}
