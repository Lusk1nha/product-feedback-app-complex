import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Toaster } from 'sonner' // Ajuste o import do seu Toaster
import type { User, Rule } from '@/modules/iam/types/user.schemas'

import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

interface RouterContext {
	auth: {
		isAuthenticated: boolean
		isLoading: boolean
		user: User | undefined
		rules: Rule[] | undefined
	}
}

export const Route = createRootRouteWithContext<RouterContext>()({
	component: () => (
		<>
			<Outlet />
			<Toaster />
			{import.meta.env.DEV && (
				<>
					{/* <TanStackRouterDevtools position="bottom-right" />
					<ReactQueryDevtools
						position="right"
						buttonPosition="bottom-left"
						initialIsOpen={false}
					/> */}
				</>
			)}
		</>
	),
})
