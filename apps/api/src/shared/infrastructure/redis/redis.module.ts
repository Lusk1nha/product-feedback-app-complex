import { Global, Module, Provider } from '@nestjs/common'
import Redis from 'ioredis'
import { ConfigService } from '@nestjs/config'
import { REDIS_CLIENT } from './redis.constants'
import { PUB_SUB_SERVICE } from '../../application/ports/pub-sub.service.interface'
import { RedisPubSubService } from './redis-pub-sub.service'

// Provider do Cliente Redis (Conexão Raw)
const redisClientProvider: Provider = {
	provide: REDIS_CLIENT,
	useFactory: (configService: ConfigService) => {
		return new Redis({
			host: configService.getOrThrow<string>('REDIS_HOST'),
			port: configService.getOrThrow<number>('REDIS_PORT'),
		})
	},
	inject: [ConfigService],
}

// Provider do Serviço de PubSub (Abstração)
const pubSubServiceProvider: Provider = {
	provide: PUB_SUB_SERVICE, // A Interface (Token)
	useClass: RedisPubSubService, // A Implementação Concreta
}

@Global()
@Module({
	providers: [redisClientProvider, pubSubServiceProvider],
	exports: [redisClientProvider, pubSubServiceProvider], // Exportamos a abstração!
})
export class RedisModule {}
