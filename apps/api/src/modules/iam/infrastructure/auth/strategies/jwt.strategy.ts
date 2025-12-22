import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { TokenPayload } from '../../../application/ports/token.provider.interface'
import { Env } from 'src/shared/infrastructure/environment/env.schema'
import { User } from 'src/modules/iam/domain/entities/user.entity'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService<Env, true>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_ACCESS_SECRET', { infer: true }),
    })
  }

  async validate(payload: TokenPayload): Promise<User> {
    return User.rebuild(
      {
        username: '',
        fullName: '',
        email: payload.email,
        role: payload.role,
        avatarUrl: null,
      },
      payload.sub,
    )
  }
}
