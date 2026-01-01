import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'
import { FeedbackApi } from '@/modules/feedback/api/feedback.api'
import type { ListFeedbacksPayload } from '@/modules/feedback/types/feedback.schema'

type UseInfiniteFeedbacksProps = Omit<ListFeedbacksPayload, 'page' | 'perPage'>

export function useInfiniteFeedbacks(filters: UseInfiniteFeedbacksProps) {
	return useInfiniteQuery({
		// 1. Chave única incluindo TODOS os filtros
		queryKey: ['feedbacks', 'infinite', filters],

		initialPageParam: 1,

		queryFn: async ({ pageParam = 1, signal }) => {
			const response = await FeedbackApi.listFeedbacks(
				{
					...filters,
					page: pageParam,
					perPage: 10, // Idealmente seria 20 para scroll infinito render melhor
				},
				signal,
			)

			return response
		},

		getNextPageParam: (lastPage) => {
			// 3. Verificação de segurança (Short-circuit)
			if (!lastPage || !lastPage.meta) return undefined

			// Se a página atual for menor que a última, temos mais páginas
			if (lastPage.meta.page < lastPage.meta.lastPage) {
				return lastPage.meta.page + 1
			}

			return undefined
		},

		// --- OTIMIZAÇÕES DE PERFORMANCE ---

		// 4. Mantém os dados anteriores na tela enquanto carrega o novo filtro.
		// Isso evita o "layout shift" e a tela branca piscando.
		placeholderData: keepPreviousData,

		// 5. Cache de 1 minuto.
		// Se o usuário sair e voltar em 30s, não faz requisição.
		// Se voltar em 2 min, faz refresh em background (usuário vê dados na hora).
		staleTime: 1000 * 60 * 1, // 1 minuto

		// 6. Garbage Collection (5 min).
		// Se o dado não for usado por 5 min, ele é limpo da memória.
		gcTime: 1000 * 60 * 5,

		// 7. Não refaz o fetch se o usuário der Alt+Tab, a menos que o staleTime tenha vencido
		refetchOnWindowFocus: false,

		// 8. Tenta reconectar no máximo 1 vez se der erro (evita loops infinitos de erro)
		retry: 1,
	})
}
