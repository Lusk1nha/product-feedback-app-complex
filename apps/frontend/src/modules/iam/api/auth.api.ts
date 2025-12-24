import { httpClient } from '@/lib/api-client'
import type { LoginDto, AuthResponse, RegisterDto } from '../types/auth.schemas'

export const AuthApi = {
	/**
	 * Realiza login do usuário
	 * @param data Dados de login
	 * @returns Promise que resolve para LoginResponse
	 */
	login: async (data: LoginDto) => {
		return httpClient.post<AuthResponse>('/auth/login', data)
	},

	/**
	 * Realiza registro do usuário
	 * @param data Dados de registro
	 * @returns Promise que resolve para null
	 */
	register: async (data: RegisterDto) => {
		return httpClient.post<AuthResponse>('/auth/register', data)
	},

	/**
	 * Realiza logout do usuário
	 * @returns Promise que resolve para null
	 */
	logout: async () => {
		return httpClient.post<null>('/auth/logout')
	},

	/**
	 * Renova o token de autenticação
	 * @returns Promise que resolve para null
	 */
	refreshToken: async () => {
		return httpClient.post<null>('/auth/refresh')
	},
}
