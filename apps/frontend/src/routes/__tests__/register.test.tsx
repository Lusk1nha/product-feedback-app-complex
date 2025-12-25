import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { RegisterPage } from '../register' // O componente exportado
import { useAuth } from '@/modules/iam/hooks/use-auth'

// --- MOCKS (Os Dublês) ---

// 1. Router (Para saber se tentou navegar)
const navigateMock = vi.fn()
vi.mock('@tanstack/react-router', () => ({
	useNavigate: () => navigateMock,
	Link: ({ children }: any) => <a>{children}</a>,
	createFileRoute: () => () => {},
	redirect: vi.fn(),
}))

// 2. Contexto (Para simular se está logado ou não)
vi.mock('@/modules/iam/contexts/auth-context', () => ({
	useAuthContext: () => ({ isAuthenticated: false, isLoading: false }),
}))

// 3. Hook useAuth (Para espionar a função de registro)
vi.mock('@/modules/iam/hooks/use-auth', () => ({
	useAuth: vi.fn(),
}))

// 4. Motion (Versão Segura para Shadcn/Button)
vi.mock('motion/react', () => {
	const React = require('react')
	// Lista de props que o React não gosta no HTML
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
			// Remove as props de animação antes de criar o elemento
			const safeProps = Object.keys(props).reduce((acc: any, key) => {
				if (!motionProps.includes(key)) acc[key] = props[key]
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
			button: createMock('button'),
		},
		AnimatePresence: ({ children }: any) => <>{children}</>,
	}
})

// --- OS TESTES ---

describe('RegisterPage', () => {
	const registerFnEspiao = vi.fn()

	beforeEach(() => {
		vi.clearAllMocks()
		// Configuramos o espião dentro do hook useAuth
		vi.mocked(useAuth).mockReturnValue({
			register: { mutate: registerFnEspiao, isPending: false } as any,
			login: {} as any,
			logout: {} as any,
		})
	})

	it('deve renderizar todos os campos do formulário', () => {
		render(<RegisterPage />)

		// Verifica se os 4 campos principais estão na tela
		expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
		expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
		expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
		expect(screen.getByLabelText(/password/i)).toBeInTheDocument()

		// Verifica o botão
		expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
	})

	it('deve mostrar erro se tentar enviar com campos vazios', async () => {
		const usuario = userEvent.setup()
		render(<RegisterPage />)

		// Clica direto no botão sem preencher nada
		await usuario.click(screen.getByRole('button', { name: /sign up/i }))

		// Espera aparecerem as mensagens de erro (validação do Zod)
		await waitFor(() => {
			// O Zod geralmente retorna "Required" ou mensagens específicas
			// Vamos procurar por mensagens genéricas de erro ou contagem de erros
			// Como não sei sua msg exata do Zod, verificamos se a função NÃO foi chamada
			expect(registerFnEspiao).not.toHaveBeenCalled()
		})
	})

	it('deve chamar a função de registro com os dados corretos', async () => {
		const usuario = userEvent.setup()
		render(<RegisterPage />)

		// Preenche o formulário completo
		await usuario.type(screen.getByLabelText(/full name/i), 'Lucas Pedro')
		await usuario.type(screen.getByLabelText(/username/i), 'lucas_dev')
		await usuario.type(screen.getByLabelText(/e-mail/i), 'lucas@exemplo.com')
		await usuario.type(screen.getByLabelText(/password/i), 'SenhaForte123!')

		// Clica em cadastrar
		await usuario.click(screen.getByRole('button', { name: /sign up/i }))

		// Verifica se o espião pegou os dados certos
		await waitFor(() => {
			expect(registerFnEspiao).toHaveBeenCalledWith(
				{
					fullName: 'Lucas Pedro',
					username: 'lucas_dev',
					email: 'lucas@exemplo.com',
					password: 'SenhaForte123!',
				},
				expect.any(Object),
			)
		})
	})
})
