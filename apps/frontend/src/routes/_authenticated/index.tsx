import { createFileRoute } from '@tanstack/react-router'
import { useAuthContext } from '@/modules/iam/contexts/auth-context'

export const Route = createFileRoute('/_authenticated/')({
	component: DashboardPage,
})

function DashboardPage() {
	const { user, rules } = useAuthContext()

	return (
		<div className="p-8">
			<h1>Bem-vindo, {user?.fullName}!</h1>
			<p>Você está na área segura.</p>

			<pre>{JSON.stringify(rules, null, 2)}</pre>
		</div>
	)
}
