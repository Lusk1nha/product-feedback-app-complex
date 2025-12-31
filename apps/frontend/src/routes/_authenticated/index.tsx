import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/')({
	component: RouteComponent,

	beforeLoad: () => {
		throw redirect({
			to: '/dashboard',
			search: { category: 'all', sort: 'most_upvotes' }, // Defaults batendo com seu Zod schema
		})
	},
})

function RouteComponent() {
	return null
}
