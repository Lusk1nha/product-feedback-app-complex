import {
	createContext,
	useContext,
	useEffect, // 🔥 Adicionado useEffect
	useMemo,
	useState,
	type ReactNode,
} from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { UsersApi } from '@/modules/iam/api/user.api'
import type { User, Rule } from '@/modules/iam/types/user.schemas'
import { storage } from '@/lib/storage'
import { realtimeClient } from '@/lib/realtime-client' // 🔥 Importando nosso Singleton

interface AuthContextType {
	isAuthenticated: boolean
	isLoading: boolean
	user: User | undefined
	rules: Rule[] | undefined
	signIn: (token: string) => void
	signOut: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
	const queryClient = useQueryClient()

	const [token, setToken] = useState<string | null>(() => storage.getToken())
	const hasToken = !!token || !!storage.getToken()

	const {
		data,
		isLoading: isQueryLoading,
		isError,
	} = useQuery({
		queryKey: ['me'],
		queryFn: UsersApi.getMe,
		enabled: hasToken,
		retry: false,
		staleTime: Infinity,
	})

	const signIn = (newToken: string) => {
		storage.setToken(newToken)
		setToken(newToken)
	}

	const signOut = () => {
		storage.clearToken()
		setToken(null)
		queryClient.clear()
		// 🔥 Desconecta o WebSocket na hora do logout por garantia (opcional, mas recomendado)
		realtimeClient.disconnect()
	}

	const isLoading = hasToken && isQueryLoading
	const isAuthenticated = hasToken && !isError && !!data?.user

	// 🔥 O Efeito Colateral que gerencia a conexão com o Elixir
	useEffect(() => {
		// Só conecta se o usuário estiver de fato logado, com os dados validados pela API
		if (isAuthenticated && token) {
			realtimeClient.connect(token)
		} else if (!isLoading && !isAuthenticated) {
			// Se terminou de carregar e não está autenticado, garante a desconexão
			realtimeClient.disconnect()
		}

		// Cleanup: Quando o AuthProvider for desmontado, fecha o túnel
		return () => {
			realtimeClient.disconnect()
		}
	}, [isAuthenticated, token, isLoading]) // 🔥 Reage a essas mudanças

	const value = useMemo(
		() => ({
			isAuthenticated,
			isLoading,
			user: data?.user,
			rules: data?.rules,
			signIn,
			signOut,
		}),
		[isAuthenticated, isLoading, data?.user, data?.rules], // Sem dependências extras para não causar renders desnecessários
	)

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
	const context = useContext(AuthContext)
	if (!context)
		throw new Error('useAuthContext must be used within an AuthProvider')
	return context
}
