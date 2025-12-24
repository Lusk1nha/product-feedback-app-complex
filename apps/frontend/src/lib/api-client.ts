import { env } from '@/config/env'
import { logger } from '@/lib/logger'
import type { ApiError, ApiResponse } from '@/types/api.types'
import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { AppError } from './app-error'
import { storage } from './storage'
import type { AuthResponse } from '@/modules/iam/types/auth.schemas'
import { toast } from 'sonner'

// --- Tipagem ---
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
	_retry?: boolean
}

// --- Instância do Axios ---
// Instância principal (com interceptors)
export const api = axios.create({
	baseURL: env.VITE_API_URL,
	withCredentials: true,
	headers: {
		'Content-Type': 'application/json',
	},
})

// Instância "pelada" (sem interceptors de auth)
// Útil para Login, Register e Refresh
export const publicApi = axios.create({
	baseURL: env.VITE_API_URL,
	withCredentials: true,
	headers: {
		'Content-Type': 'application/json',
	},
})

// --- Controle de Concorrência (Singleton) ---
let refreshPromise: Promise<void> | null = null

/**
 * Gerencia a renovação do token.
 * Se já houver uma renovação em andamento, retorna a mesma Promise
 * para evitar múltiplas chamadas ao endpoint /refresh.
 */
const refreshAccessToken = async (): Promise<void> => {
	if (refreshPromise) {
		return refreshPromise
	}

	refreshPromise = (async () => {
		try {
			// 👇 Usa a instância limpa, sem header Authorization expirado
			const { data } =
				await publicApi.post<ApiResponse<AuthResponse>>('/auth/refresh')

			if (data.data.accessToken) {
				storage.setToken(data.data.accessToken)

				toast.success('Session restored successfully!')

				// Importante: Atualiza o header da instância principal para requests futuras
				api.defaults.headers.common['Authorization'] =
					`Bearer ${data.data.accessToken}`
			}

			return
		} catch (error) {
			throw error
		} finally {
			refreshPromise = null
		}
	})()

	return refreshPromise
}

// --- Helpers de Log e Validação ---

const isAuthRequest = (url?: string) => {
	return url?.includes('/auth/login') || url?.includes('/auth/refresh')
}

const transformError = (error: AxiosError) => {
	const data = error.response?.data as ApiError | undefined

	// Se o backend retornou o JSON de erro padrão
	if (data && data.message && data.statusCode) {
		// Retornamos nossa classe customizada limpa
		return new AppError(data)
	}

	// Se foi erro de rede ou algo sem resposta padronizada, retorna o erro original
	return error
}

const logApiError = (error: AxiosError) => {
	logger.error(
		`[API ERROR] ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
		{
			status: error.response?.status,
			data: error.response?.data,
			message: error.message,
		},
	)
}

// --- Interceptor Principal ---

api.interceptors.request.use((config) => {
	const token = storage.getToken()

	// 👇 ADICIONE ESTA CONDIÇÃO
	// Verifica se existe token E se a URL NÃO contém '/refresh'
	if (token && !config.url?.includes('/auth/refresh')) {
		config.headers.Authorization = `Bearer ${token}`
	}

	return config
})

api.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		const originalRequest = error.config as CustomAxiosRequestConfig

		// LOG: Logamos o erro cru primeiro para debug
		logApiError(error)

		// 1. Se não for 401 ou já tentou retry...
		if (error.response?.status !== 401 || originalRequest?._retry) {
			// AQUI ESTÁ O TRUQUE: Rejeitamos com o erro transformado
			return Promise.reject(transformError(error))
		}

		// 2. Auth Request check...
		if (isAuthRequest(originalRequest.url)) {
			return Promise.reject(transformError(error))
		}

		originalRequest._retry = true

		try {
			await refreshAccessToken()
			return api(originalRequest)
		} catch (refreshError) {
			// Se o refresh falhar, também transformamos esse erro
			return Promise.reject(transformError(refreshError as AxiosError))
		}
	},
)

export const httpClient = {
	get: async <T>(url: string, config?: CustomAxiosRequestConfig) => {
		const response = await api.get<ApiResponse<T>>(url, config)
		return response.data?.data
	},

	post: async <T>(
		url: string,
		data?: unknown,
		config?: CustomAxiosRequestConfig,
	) => {
		const response = await api.post<ApiResponse<T>>(url, data, config)
		return response.data?.data
	},

	put: async <T>(
		url: string,
		data?: unknown,
		config?: CustomAxiosRequestConfig,
	) => {
		const response = await api.put<ApiResponse<T>>(url, data, config)
		return response.data?.data
	},

	delete: async <T>(url: string, config?: CustomAxiosRequestConfig) => {
		const response = await api.delete<ApiResponse<T>>(url, config)
		return response.data?.data
	},
}
