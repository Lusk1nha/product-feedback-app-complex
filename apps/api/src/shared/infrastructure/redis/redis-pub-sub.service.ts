import Redis from 'ioredis'

import { Inject, Injectable, Logger } from '@nestjs/common'
import { IPubSubService } from '../../application/ports/pub-sub.service.interface'
import { PubSubChannel } from '../../application/ports/pub-sub.contract'
import { REDIS_CLIENT } from './redis.constants'

@Injectable()
export class RedisPubSubService implements IPubSubService {
	private readonly logger = new Logger(RedisPubSubService.name)

	constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

	async publish(channel: PubSubChannel, payload: unknown): Promise<void> {
		try {
			const message = JSON.stringify(payload)
			await this.redis.publish(channel, message)

			this.logger.debug(`📢 Event published to [${channel}]`)
		} catch (error) {
			this.logger.error(`❌ Failed to publish to [${channel}]`, error)
		}
	}
}
