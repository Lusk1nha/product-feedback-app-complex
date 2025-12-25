import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/')({
	component: RouteComponent,

	beforeLoad({ context }) {
		if (!context.auth.isAuthenticated || context.auth.isLoading) {
			throw redirect({ to: '/login' })
		}

		redirect({ to: '/dashboard' })
	},
})

function RouteComponent() {
	return null
}
