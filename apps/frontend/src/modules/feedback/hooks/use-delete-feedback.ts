import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { FeedbackApi } from '../api/feedback.api'

export function useDeleteFeedback() {
	const queryClient = useQueryClient()
	const navigate = useNavigate()

	return useMutation({
		mutationFn: (id: number) => FeedbackApi.deleteFeedback(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['feedbacks'] })
			queryClient.invalidateQueries({ queryKey: ['roadmap-stats'] })

			toast.success('Feedback deleted.')
      
			navigate({ to: '/' })
		},
		onError: () => toast.error('Failed to delete feedback.'),
	})
}
