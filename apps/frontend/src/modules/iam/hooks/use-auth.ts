import { useMutation } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { AuthApi } from '../api/auth.api'
import type { LoginDto, RegisterDto } from '../types/auth.schemas'
import { toast } from 'sonner'
import { useAuthContext } from '../contexts/auth-context' // 👈 Importe o contexto

interface AuthSearch {
	redirect?: string
}

export function useAuth() {
	const navigate = useNavigate()
	const search = useSearch({ strict: false }) as AuthSearch

	// 👇 Pegamos as funções do contexto
	const { signIn, signOut } = useAuthContext()

	const login = useMutation({
		mutationFn: (data: LoginDto) => AuthApi.login(data),
		onSuccess: async (response) => {
			if (response?.accessToken) {
				signIn(response.accessToken)
			}

			toast.success('Successfully logged in!')

			const redirectUrl = search.redirect || '/'
			navigate({ to: redirectUrl as any, replace: true })
		},
	})

	const register = useMutation({
		mutationFn: (data: RegisterDto) => AuthApi.register(data),
		onSuccess: () => {
			toast.success('Account created successfully!')
			navigate({ to: '/login' })
		},
	})

	const logout = useMutation({
		mutationFn: AuthApi.logout,
		onSettled: () => {
			// 👇 Usa a função do contexto que limpa tudo
			signOut()

			toast.success('Successfully logged out!')
			navigate({ to: '/login', replace: true })
		},
	})

	return { login, register, logout }
}
