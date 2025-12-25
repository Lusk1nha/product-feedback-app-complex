import { test, expect } from '@playwright/test'

test.describe('RegisterPage E2E', () => {
	test('must create account and redirect to login', async ({ page }) => {
		// 1. Mock da API de Registro
		// Usamos Regex para garantir, igual fizemos no Login
		await page.route(/.*\/auth\/register/, async (route) => {
			console.log('📝 REGISTRO INTERCEPTADO!')
			await route.fulfill({
				status: 201, // Created
				contentType: 'application/json',
				// 👇 AJUSTE: Mantendo o padrão do seu httpClient
				body: JSON.stringify({
					data: { accessToken: 'fake-jwt-token' },
				}),
			})
		})

		// 2. Navegação e Preenchimento
		await page.goto('/register')

		await page.getByLabel('Full Name').fill('Lucas Pedro')
		await page.getByLabel('Username').fill('lucas_dev')
		await page.getByLabel('E-mail').fill('lucas@teste.com')
		await page.getByLabel('Password').fill('SenhaForte123!')

		// 3. Ação
		await page.getByRole('button', { name: 'Sign Up' }).click()

		// 4. Verificação
		// Toast de sucesso (regex case insensitive é uma ótima prática)
		await expect(page.getByText(/account created/i)).toBeVisible()

		// Redirecionamento para /login
		await expect(page).toHaveURL('/login')
	})

	test('should not submit empty form', async ({ page }) => {
		// Nesse teste não precisa de mock de API, pois a validação do Zod barra antes!
		await page.goto('/register')

		await page.getByRole('button', { name: 'Sign Up' }).click()

		await expect(
			page.getByText('Name must be at least 3 characters long'),
		).toBeVisible()

		// Garante que NÃO saiu da página
		await expect(page).toHaveURL('/register')
	})
})
