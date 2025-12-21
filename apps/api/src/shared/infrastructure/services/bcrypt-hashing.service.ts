import * as bcrypt from 'bcrypt'

import { Injectable } from '@nestjs/common'
import { HashingService } from 'src/shared/application/services/hash.service'

@Injectable()
export class BcryptHashingService implements HashingService {
  async hash(data: string): Promise<string> {
    const salt = await bcrypt.genSalt()
    return bcrypt.hash(data, salt)
  }

  async compare(data: string, encrypted: string): Promise<boolean> {
    return bcrypt.compare(data, encrypted)
  }
}
