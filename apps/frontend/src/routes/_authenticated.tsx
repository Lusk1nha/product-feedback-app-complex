import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useAuthContext } from '@/modules/iam/contexts/auth-context'

export const Route = createFileRoute('/_authenticated')({
	beforeLoad: ({ context, location }) => {
		// Agora o isLoading é false IMEDIATAMENTE se não tiver token.
		// O redirecionamento acontece na hora, sem spinner infinito.
		if (!context.auth.isLoading && !context.auth.isAuthenticated) {
			throw redirect({
				to: '/login',
				search: {
					redirect: location.href,
				},
			})
		}
	},
	component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
	const { isLoading } = useAuthContext()

	if (isLoading) {
		return (
			<div className="flex h-screen items-center justify-center bg-brand-lighter">
				{/* Spinner simples e bonito */}
				<motion.div
					animate={{ rotate: 360 }}
					transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
					className="w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full"
				/>
			</div>
		)
	}

	return (
		<div className="layout-authenticated">
			<Outlet />
		</div>
	)
}
