import { test, expect } from '@playwright/test'

test.describe('LoginPage', () => {
	test('should login successfully and redirect to home', async ({ page }) => {
		await page.goto('/login')

		// Ações do Usuário
		await page.getByLabel('E-mail').fill('john@example.com')
		await page.getByLabel('Password').fill('StrongP@ssword123')
		await page.getByRole('button', { name: 'Login' }).click()

		// Verificações
		// 1. Feedback visual imediato (Toast)
		await expect(page.getByText('Successfully logged in!')).toBeVisible()

		// 2. Resultado final (Redirecionamento)
		await expect(page).toHaveURL('/')
	})

	test('should show error message on failed login', async ({ page }) => {
		await page.goto('/login')

		// Ações do Usuário
		await page.getByLabel('E-mail').fill('john@example.com')
		await page.getByLabel('Password').fill('wrong-password')
		await page.getByRole('button', { name: 'Login' }).click()

		// Verificações
		await expect(page.getByText('Invalid credentials')).toBeVisible()

		// 2. Resultado final (Redirecionamento)
		await expect(page).toHaveURL('/login', {
			timeout: 5000,
		})
	})
})
