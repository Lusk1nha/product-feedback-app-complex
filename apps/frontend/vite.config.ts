/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite' // <--- Importe loadEnv
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import path from 'path'

// Transforme em uma função que recebe { mode }
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '')

	// Fallback para localhost se a variável não existir
	const apiTarget = env.VITE_API_TARGET || 'http://localhost:3000'

	console.log('-------------------------------------------')
	console.log('🔧 VITE PROXY TARGET:', apiTarget)
	console.log('-------------------------------------------')

	return {
		plugins: [
			tanstackRouter({ target: 'react', autoCodeSplitting: true }),
			react(),
			tailwindcss(),
		],
		resolve: {
			alias: {
				'@': path.resolve(__dirname, './src'),
			},
		},
		server: {
			host: true,
			port: 5173,
			proxy: {
				'/api': {
					target: apiTarget, // <--- Se aqui chegar '/api', o erro acontece
					changeOrigin: true,
					secure: false,
				},
			},
		},
		test: {
			globals: true,
			environment: 'jsdom',
			setupFiles: './src/test/setup.ts',
			css: true, // Importante para Tailwind v4 ser processado nos testes
		},
	}
})
