import { httpClient } from '@/lib/api-client'
import {
	meResponseSchema,
	userSchema,
	type MeResponse,
	type User,
} from '../types/user.schemas'

export const UsersApi = {
	/**
	 * @returns Usuário autenticado
	 */
	getMe: async () => {
		const response = await httpClient.get<MeResponse>('/users/me')
		return meResponseSchema.parse(response)
	},

	/**
	 * @param userId - ID do usuário
	 * @returns Usuário encontrado
	 */
	getUserById: async (userId: number) => {
		const response = await httpClient.get<User>(`/users/${userId}`)
		return userSchema.parse(response)
	},
}
