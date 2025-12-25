import {
	createContext,
	useContext,
	useMemo,
	useState,
	type ReactNode,
} from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { UsersApi } from '@/modules/iam/api/user.api'
import type { User, Rule } from '@/modules/iam/types/user.schemas'
import { storage } from '@/lib/storage'

interface AuthContextType {
	isAuthenticated: boolean
	isLoading: boolean
	user: User | undefined
	rules: Rule[] | undefined
	// 👇 Novas funções para manipular o estado
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
		// Só roda se tiver token no estado
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
	}

	const isLoading = hasToken && isQueryLoading
	const isAuthenticated = hasToken && !isError && !!data?.user

	const value = useMemo(
		() => ({
			isAuthenticated,
			isLoading,
			user: data?.user,
			rules: data?.rules,
			signIn,
			signOut,
		}),
		[isAuthenticated, isLoading, data?.user, data?.rules],
	)

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
	const context = useContext(AuthContext)
	if (!context)
		throw new Error('useAuthContext must be used within an AuthProvider')
	return context
}
