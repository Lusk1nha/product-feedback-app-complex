import { SetMetadata } from '@nestjs/common'

export const RESPONSE_MESSAGE_KEY = 'response_message'
export const IGNORE_TRANSFORM_KEY = 'ignore_transform'

// @ResponseMessage('Usuário criado!')
export const ResponseMessage = (message: string) =>
	SetMetadata(RESPONSE_MESSAGE_KEY, message)

// @IgnoreTransform() -> Para rotas de download ou health checks
export const IgnoreTransform = () => SetMetadata(IGNORE_TRANSFORM_KEY, true)
