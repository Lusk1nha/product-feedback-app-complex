import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
	testDir: './e2e',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: 'html',

	use: {
		// 👇 1. MUDANÇA IMPORTANTE: A URL base do Vite
		// Isso permite usar page.goto('/login') em vez do endereço completo
		baseURL: 'http://localhost:5173',

		// Coleta vídeo e trace (passo a passo) apenas se o teste falhar
		trace: 'on-first-retry',
	},

	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},
		// Se quiser testar em outros navegadores, descomente abaixo:
		// {
		//   name: 'firefox',
		//   use: { ...devices['Desktop Firefox'] },
		// },
		// {
		//   name: 'webkit',
		//   use: { ...devices['Desktop Safari'] },
		// },
	],

	// 👇 2. MUDANÇA RECOMENDADA: Automação do Servidor
	// O Playwright vai tentar rodar o site sozinho se ele não estiver rodando.
	webServer: {
		command: 'pnpm dev', // ou 'pnpm dev'
		url: 'http://localhost:5173',
		reuseExistingServer: !process.env.CI, // Se você já estiver com o 'npm run dev' rodando no terminal, ele aproveita.
		timeout: 120 * 1000, // Dá 2 minutos para o servidor subir (segurança)
	},
})
