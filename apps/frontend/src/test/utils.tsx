import { render, type RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactElement, ReactNode } from 'react'

// Mock do AuthProvider simplificado para testes
import { AuthProvider } from '@/modules/iam/contexts/auth-context'

const createTestQueryClient = () =>
	new QueryClient({
		defaultOptions: {
			queries: {
				retry: false, // Não queremos retry em testes
			},
		},
	})

// Wrapper que simula o ambiente da aplicação
const AllTheProviders = ({ children }: { children: ReactNode }) => {
	const queryClient = createTestQueryClient()

	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>{children}</AuthProvider>
		</QueryClientProvider>
	)
}

const customRender = (ui: ReactElement, options?: RenderOptions) =>
	render(ui, { wrapper: AllTheProviders, ...options })

// Re-exporta tudo do testing-library
export * from '@testing-library/react'

// Sobrescreve o método render
export { customRender as render }
