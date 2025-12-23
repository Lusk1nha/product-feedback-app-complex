import {
	CanActivate,
	ExecutionContext,
	Injectable,
	Inject,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import {
	PERMISSION_SERVICE,
	IPermissionService,
} from '../../application/ports/permission.service.interface'
import {
	CHECK_POLICIES_KEY,
	PolicyHandler,
} from '../decorators/check-policies.decorator'

@Injectable()
export class PoliciesGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		@Inject(PERMISSION_SERVICE)
		private readonly permissionService: IPermissionService, // Usamos a Interface!
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const policyHandlers = this.reflector.get<PolicyHandler[]>(
			CHECK_POLICIES_KEY,
			context.getHandler(),
		)

		// Se não tiver regras na rota, passa (ou bloqueia, sua escolha)
		if (!policyHandlers) {
			return true
		}

		const request = context.switchToHttp().getRequest()
		const user = request.user // Aqui está nosso User reconstruído pelo JwtStrategy

		if (!user) return false

		// Verificamos cada política definida no decorator
		// Note que aqui estamos testando apenas regras GERAIS (ex: "Pode criar Feedback?")
		// Regras de instância ("Pode editar ESTE feedback?") ficam no UseCase.
		return policyHandlers.every((handler) => {
			// Precisamos adaptar um pouco aqui pois o nosso permissionService.can()
			// espera (user, action, subject).
			// O handler geralmente define a Action e o Subject.

			// Simplicidade: O handler recebe o PermissionService e o User e se vira
			return handler(this.permissionService, user)
		})
	}
}
