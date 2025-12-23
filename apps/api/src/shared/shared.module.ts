import { Module } from '@nestjs/common'
import { BcryptHashingService } from './infrastructure/services/bcrypt-hashing.service'
import { HashingService } from './application/services/hash.service'

@Module({
	providers: [{ provide: HashingService, useClass: BcryptHashingService }],
	exports: [HashingService],
})
export class SharedModule {}
