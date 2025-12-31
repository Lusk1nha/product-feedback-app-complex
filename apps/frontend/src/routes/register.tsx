import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { motion } from 'motion/react'

import { useAuthContext } from '@/modules/iam/contexts/auth-context'
import { RegisterForm } from '@/modules/iam/components/register-form'

export const Route = createFileRoute('/register')({
	beforeLoad: ({ context }) => {
		// Redirecionamento Server-Side/Initial Load
		if (!context.auth.isLoading && context.auth.isAuthenticated) {
			throw redirect({
				to: '/dashboard',
				replace: true,
				search: {
					sort: 'most_upvotes',
					category: 'all',
				},
			})
		}
	},

	component: RegisterPage,
})

export function RegisterPage() {
	const { isLoading, isAuthenticated } = useAuthContext()
	const navigate = useNavigate()

	// Redirecionamento Client-Side (Caso o estado mude após montar)
	useEffect(() => {
		if (!isLoading && isAuthenticated) {
			navigate({
				to: '/',
				replace: true,
				search: {
					sort: 'most_upvotes',
					category: 'all',
				},
			})
		}
	}, [isLoading, isAuthenticated, navigate])

	// 1. Loading State
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

	// 2. Proteção visual (Evita piscar o form se já estiver logado)
	if (isAuthenticated) {
		return null
	}

	// 3. Renderiza o Formulário (Presenter)
	return <RegisterForm />
}
