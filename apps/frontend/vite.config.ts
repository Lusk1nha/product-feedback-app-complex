/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import path from 'path'

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '')

	// Fallbacks para localhost se as variáveis não existirem no .env
	const apiTarget = env.VITE_API_TARGET || 'http://localhost:3000'
	const realtimeTarget = env.VITE_REALTIME_TARGET || 'http://localhost:4000'

	console.log('-------------------------------------------')
	console.log('🔧 VITE PROXY TARGET (API):', apiTarget)
	console.log('⚡ VITE PROXY TARGET (WS):', realtimeTarget)
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
				// Rotas da API normal (Node.js)
				'/api': {
					target: apiTarget,
					changeOrigin: true,
					secure: false,
				},
				// Rotas do WebSocket (Elixir Phoenix)
				'/socket': {
					target: realtimeTarget,
					ws: true, // Isso aqui já faz a mágica de HTTP -> WS
					changeOrigin: true,
					secure: false,
				},
			},
		},
		test: {
			globals: true,
			environment: 'jsdom',
			setupFiles: './src/test/setup.ts',
			css: true,
		},
	}
})
