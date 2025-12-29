import { useQuery } from '@tanstack/react-query'
import { MetadataAppApi } from '@/modules/feedback/api/metadata.api'

export function useAppMetadata() {
	return useQuery({
		queryKey: ['app-metadata'],
		queryFn: MetadataAppApi.getMetadata,

		// 🚀 A MÁGICA:
		// Diz pro React Query: "Uma vez pego, esse dado é fresco para sempre nesta sessão"
		staleTime: Infinity,

		// Opcional: Mantém no cache mesmo se nenhum componente estiver usando (ex: 1 hora)
		gcTime: 1000 * 60 * 60,

		// Opcional: Não tenta reconectar se der erro (já que é config essencial)
		retry: 1,
	})
}
