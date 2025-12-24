import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { routeTree } from './routeTree.gen'

import {
	AuthProvider,
	useAuthContext,
} from '@/modules/iam/contexts/auth-context'

import './index.css'

const queryClient = new QueryClient()

// 1. Configura o Router com um contexto inicial vazio/padrão
// Isso satisfaz o TypeScript até que o Provider real injete os valores
const router = createRouter({
	routeTree,
	context: { auth: undefined! }, // Contexto inicial "dummy"
})

// Tipagem global
declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router
	}
}

// 2. Componente "Ponte" (Wrapper)
// Ele serve apenas para usar o hook useAuthContext e passar para o router
function InnerApp() {
	const auth = useAuthContext()
	// O router recebe o auth. Se o auth não mudar (graças ao useMemo),
	// o router não re-renderiza desnecessariamente.
	return <RouterProvider router={router} context={{ auth }} />
}

const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement)
	root.render(
		<StrictMode>
			<QueryClientProvider client={queryClient}>
				<AuthProvider>
					<InnerApp />
				</AuthProvider>
			</QueryClientProvider>
		</StrictMode>,
	)
}
