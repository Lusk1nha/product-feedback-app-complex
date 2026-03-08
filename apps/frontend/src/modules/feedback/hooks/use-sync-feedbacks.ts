import { useQueryClient } from '@tanstack/react-query'
import { useRealtimeSubscription } from '@/modules/shared/hooks/use-realtime-subscription'
import {
	feedbackSchema,
	type Feedback,
	type FeedbackCreatedRealtimePayload,
	type FeedbackDeletedRealtimePayload,
	type FeedbackUpdatedRealtimePayload,
} from '../types/feedback.schema'

export function useSyncFeedbacks(activeFilters: any) {
	const queryClient = useQueryClient()

	// --- LISTENER 1: CRIAÇÃO ---
	useRealtimeSubscription<FeedbackCreatedRealtimePayload>(
		'feedbacks:list',
		'new_feedback',
		(payload: FeedbackCreatedRealtimePayload) => {
			const feedback = feedbackSchema.parse(payload.feedback)

			queryClient.setQueryData(
				['feedbacks', 'infinite', activeFilters],
				(oldData: any) => {
					if (!oldData || !oldData.pages) return oldData

					const newPages = [...oldData.pages]
					newPages[0] = {
						...newPages[0],
						data: [feedback, ...newPages[0].data],
					}

					return { ...oldData, pages: newPages }
				},
			)
		},
	)

	// --- LISTENER 2: ATUALIZAÇÃO ---
	useRealtimeSubscription<FeedbackUpdatedRealtimePayload>(
		'feedbacks:list',
		'update_feedback',
		(payload: FeedbackUpdatedRealtimePayload) => {
			const updatedFeedback = feedbackSchema.parse(payload.feedback)

			console.log('payload', payload)
			console.log('updatedFeedback', updatedFeedback)

			queryClient.setQueryData(
				['feedbacks', 'infinite', activeFilters],
				(oldData: any) => {
					if (!oldData || !oldData.pages) return oldData

					console.log('oldData', oldData)

					// Percorre todas as páginas e substitui apenas o card que foi editado
					const newPages = oldData.pages.map((page: any) => ({
						...page,
						data: page.data.map((item: Feedback) =>
							item.id === payload.feedbackId ? updatedFeedback : item,
						),
					}))

					return { ...oldData, pages: newPages }
				},
			)
		},
	)

	// --- LISTENER 3: DELEÇÃO ---
	useRealtimeSubscription<FeedbackDeletedRealtimePayload>(
		'feedbacks:list',
		'delete_feedback',
		(payload: FeedbackDeletedRealtimePayload) => {
			queryClient.setQueryData(
				['feedbacks', 'infinite', activeFilters],
				(oldData: any) => {
					if (!oldData || !oldData.pages) return oldData

					// Percorre todas as páginas e remove o card que foi deletado
					const newPages = oldData.pages.map((page: any) => ({
						...page,
						data: page.data.filter(
							(item: Feedback) => item.id !== payload.feedbackId,
						),
					}))

					return { ...oldData, pages: newPages }
				},
			)
		},
	)
}
