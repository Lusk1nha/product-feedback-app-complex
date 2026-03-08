import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { FeedbackApi } from '../api/feedback.api'
import type { CreateFeedbackPayload } from '../types/feedback.schema'
import { AppError } from '@/lib/app-error'
import { toast } from 'sonner' // Supondo que use sonner ou similar

export function useCreateFeedback() {
	const queryClient = useQueryClient()
	const navigate = useNavigate()

	return useMutation({
		mutationFn: (data: CreateFeedbackPayload) =>
			FeedbackApi.createFeedback(data),

		onSuccess: (feedback) => {
			// 1. Invalida a lista de feedbacks (para aparecer o novo)
			queryClient.invalidateQueries({ queryKey: ['feedbacks'] })

			// 2. Invalida as estatísticas (para atualizar o contador do roadmap)
			queryClient.invalidateQueries({ queryKey: ['roadmap-stats'] })

			toast.success('Feedback added successfully!')

			// 3. Volta para a home
			navigate({ to: `/feedbacks/${feedback.id}` })
		},

		onError: (error) => {
			if (error instanceof AppError) {
				toast.error(error.message)
			} else {
				toast.error('Failed to create feedback. Please try again.')
			}
		},
	})
}
