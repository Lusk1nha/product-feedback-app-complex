import { test, expect } from '@playwright/test'
import { UserMakeFake } from '../../src/test/factories/user.make'

// Dica: Em um projeto real, mova isso para um arquivo 'test/mocks/user.mock.ts'
const mockUser = UserMakeFake.build()

test.describe('Página de Login', () => {
	// Configuração prévia dos mocks para todos os testes desse bloco (se houver mais)
	test.beforeEach(async ({ page }) => {
		// Mock da API de Login
		await page.route(/.*\/auth\/login/, async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					data: { accessToken: 'fake-jwt-token' },
				}),
			})
		})

		// Mock da API de Usuário (/me)
		await page.route(/.*\/users\/me/, async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					data: {
						user: mockUser,
						rules: [],
					},
				}),
			})
		})
	})

	test('deve realizar login com sucesso e redirecionar para a home', async ({
		page,
	}) => {
		await page.goto('/login')

		// Ações do Usuário
		await page.getByLabel('E-mail').fill('john@example.com')
		await page.getByLabel('Password').fill('StrongP@ssword123')
		await page.getByRole('button', { name: 'Login' }).click()

		// Verificações
		// 1. Feedback visual imediato (Toast)
		await expect(page.getByText('Successfully logged in!')).toBeVisible()

		// 2. Resultado final (Redirecionamento)
		await expect(page).toHaveURL('/dashboard')

		// Opcional: Verificar se algum elemento da home carregou (ex: nome do usuário)
		// Isso garante que o mock do user foi consumido corretamente
		// await expect(page.getByText('Lucas Pedro')).toBeVisible()
	})
})
