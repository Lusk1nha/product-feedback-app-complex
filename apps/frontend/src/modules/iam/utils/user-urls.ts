import { env } from '@/config/env'

export const UserUrls = {
	getAvatarUrl: (userId: number) => {
		// Retorna a string pronta para usar no <img src />
		// O Proxy do Vite (/api) ou a URL completa cuidam do resto
		return `${env.VITE_API_URL}/users/${userId}/avatar/image`
	},
}
