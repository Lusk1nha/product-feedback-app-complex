import { PubSubChannel } from './pub-sub.contract'

// Token para Injeção de Dependência (DI) no NestJS
export const PUB_SUB_SERVICE = 'PUB_SUB_SERVICE'

export interface IPubSubService {
	publish(channel: PubSubChannel, payload: unknown): Promise<void>
}
