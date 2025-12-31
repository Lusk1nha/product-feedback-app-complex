import { useQuery } from '@tanstack/react-query'
import { MetadataAppApi } from '@/modules/feedback/api/metadata.api'

export function useAppMetadata() {
	return useQuery({
		queryKey: ['app-metadata'],
		queryFn: MetadataAppApi.getMetadata,

		// ✅ MUDANÇA: De Infinity para 1 hora
		// Isso significa: "Durante 1 hora, confie cegamente no cache.
		// Depois de 1 hora, na próxima vez que precisar desse dado, busque no backend."
		staleTime: 1000 * 60 * 60, // 1 hora

		// O gcTime deve ser maior ou igual ao staleTime.
		// Deixei 24h para garantir que o dado não suma da memória se o usuário
		// ficar o dia todo sem usar componentes que pedem metadata.
		gcTime: 1000 * 60 * 60 * 24,

		retry: 1,

		// Opcional: Evita refetch ao focar na janela se o dado ainda estiver "fresh" (< 1h)
		// Se o dado estiver "stale" (> 1h) e o usuário focar a janela, ele atualiza sozinho.
		refetchOnWindowFocus: true,
	})
}
