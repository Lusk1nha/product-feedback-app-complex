import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { LoginPage } from '../login'
import { useAuth } from '@/modules/iam/hooks/use-auth'

// --- MOCKS ---

// 1. Router e Auth (Mantidos iguais)
const navigateMock = vi.fn()
vi.mock('@tanstack/react-router', () => ({
	useNavigate: () => navigateMock,
	Link: ({ children }: any) => <a>{children}</a>,
	createFileRoute: () => () => {},
	redirect: vi.fn(),
}))

vi.mock('@/modules/iam/contexts/auth-context', () => ({
	useAuthContext: () => ({ isAuthenticated: false, isLoading: false }),
}))

vi.mock('@/modules/iam/hooks/use-auth', () => ({
	useAuth: vi.fn(),
}))

// 2. Mock do Motion (CORRIGIDO)
// Agora usamos forwardRef para o botão funcionar e filtramos as props para limpar o console
vi.mock('motion/react', () => {
	const React = require('react')

	// Lista de props do Motion que queremos remover do HTML final
	const motionProps = [
		'whileHover',
		'whileTap',
		'initial',
		'animate',
		'exit',
		'variants',
		'transition',
	]

	const createMock = (tag: string) => {
		return React.forwardRef((props: any, ref: any) => {
			// Filtra as props: mantém as normais, remove as de animação
			const safeProps = Object.keys(props).reduce((acc: any, key) => {
				if (!motionProps.includes(key)) {
					acc[key] = props[key]
				}
				return acc
			}, {})

			return React.createElement(tag, { ...safeProps, ref }, props.children)
		})
	}

	return {
		motion: {
			div: createMock('div'),
			h1: createMock('h1'),
			p: createMock('p'),
			button: createMock('button'), // O forwardRef aqui conserta o clique
		},
		AnimatePresence: ({ children }: any) => <>{children}</>,
	}
})

// --- TESTES ---

describe('LoginPage', () => {
	const loginFnEspiao = vi.fn()

	beforeEach(() => {
		vi.clearAllMocks()
		vi.mocked(useAuth).mockReturnValue({
			login: { mutate: loginFnEspiao, isPending: false } as any,
			register: {} as any,
			logout: {} as any,
		})
	})

	it('must render the login form correctly', () => {
		render(<LoginPage />)
		expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
		expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
		expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
	})

	it('must show error if email is invalid', async () => {
		const usuario = userEvent.setup()
		render(<LoginPage />)

		await usuario.type(screen.getByLabelText(/e-mail/i), 'email-invalido')
		await usuario.click(screen.getByRole('button', { name: /login/i }))

		await waitFor(() => {
			expect(screen.getByText(/invalid/i)).toBeInTheDocument()
		})

		expect(loginFnEspiao).not.toHaveBeenCalled()
	})

	it('must call the login function with the correct data', async () => {
		const usuario = userEvent.setup()
		render(<LoginPage />)

		await usuario.clear(screen.getByLabelText(/e-mail/i))
		await usuario.type(screen.getByLabelText(/e-mail/i), 'joao@teste.com')

		await usuario.clear(screen.getByLabelText(/password/i))
		await usuario.type(screen.getByLabelText(/password/i), 'SenhaForte123!')

		await usuario.click(screen.getByRole('button', { name: /login/i }))

		await waitFor(() => {
			expect(loginFnEspiao).toHaveBeenCalledWith(
				{ email: 'joao@teste.com', password: 'SenhaForte123!' },
				expect.any(Object),
			)
		})
	})
})
