import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { useEffect } from 'react'
import { motion } from 'motion/react'

import { useAuthContext } from '@/modules/iam/contexts/auth-context'
import { LoginForm } from '@/modules/iam/components/login-form'

// Validação dos Search Params
const loginSearchSchema = z.object({
	redirect: z.string().optional(),
})

export const Route = createFileRoute('/login')({
	validateSearch: (search) => loginSearchSchema.parse(search),

	// Redirecionamento no servidor/inicial (se já soubermos o estado)
	beforeLoad: ({ context }) => {
		if (!context.auth.isLoading && context.auth.isAuthenticated) {
			throw redirect({
				to: '/dashboard',
				search: {
					sort: 'most_upvotes',
					category: 'all',
				},
			})
		}
	},

	component: LoginPage,
})

export function LoginPage() {
	const { isLoading, isAuthenticated } = useAuthContext()
	const navigate = useNavigate()

	// Redirecionamento no cliente (caso o estado mude após montar)
	useEffect(() => {
		if (!isLoading && isAuthenticated) {
			navigate({
				to: '/dashboard',
				replace: true,
				search: {
					sort: 'most_upvotes',
					category: 'all',
				},
			})
		}
	}, [isLoading, isAuthenticated, navigate])

	// 1. Loading State (Para checagem inicial de sessão)
	if (isLoading) {
		return (
			<div className="flex h-screen items-center justify-center bg-brand-lighter">
				<motion.div
					animate={{ rotate: 360 }}
					transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
					className="w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full"
				/>
			</div>
		)
	}

	// 2. Se já autenticado, retorna null (o useEffect vai redirecionar)
	// Isso evita "piscar" o formulário de login por um milissegundo.
	if (isAuthenticated) {
		return null
	}

	// 3. Renderiza o Formulário
	return <LoginForm />
}
