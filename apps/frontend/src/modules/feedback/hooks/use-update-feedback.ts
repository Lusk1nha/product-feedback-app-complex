import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { FeedbackApi } from '../api/feedback.api'
import type { UpdateFeedbackPayload } from '../types/feedback.schema'

export function useUpdateFeedback(id: number) {
	const queryClient = useQueryClient()
	const navigate = useNavigate()

	if (!id) {
		throw new Error('Feedback ID is required')
	}

	return useMutation({
		mutationFn: (data: UpdateFeedbackPayload) =>
			FeedbackApi.updateFeedback(id, data),

		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['feedbacks'] })
			queryClient.invalidateQueries({ queryKey: ['feedback', data.id] })
			queryClient.invalidateQueries({ queryKey: ['roadmap-stats'] })

			toast.success('Feedback updated successfully!')
			navigate({ to: '..' })
		},

		onError: () => toast.error('Failed to update feedback.'),
	})
}
