import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FeedbackApi } from '../api/feedback.api'
import type { Feedback } from '../types/feedback.schema'

export function useToggleFeedbackUpvote() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (feedbackId: number) => FeedbackApi.toggleUpvote(feedbackId),

		onMutate: async (feedbackId) => {
			await queryClient.cancelQueries({ queryKey: ['feedbacks'] })
			await queryClient.cancelQueries({ queryKey: ['feedback', feedbackId] })

			const previousFeedbacks = queryClient.getQueriesData({
				queryKey: ['feedbacks'],
			})
			const previousSingleFeedback = queryClient.getQueryData([
				'feedback',
				feedbackId,
			])

			queryClient.setQueriesData(
				{ queryKey: ['feedbacks'] },
				(oldData: any) => {
					if (!oldData || !oldData.data) return oldData

					return {
						...oldData,
						data: oldData.data.map((feedback: Feedback) => {
							if (feedback.id === feedbackId) {
								return {
									...feedback,
									isUpvoted: !feedback.isUpvoted,
									upvotesCount: feedback.isUpvoted
										? feedback.upvotesCount - 1
										: feedback.upvotesCount + 1,
								}
							}
							return feedback
						}),
					}
				},
			)

			// 4. Atualiza OTIMISTAMENTE o cache do feedback individual (ex: tela de detalhes)
			queryClient.setQueryData(['feedback', feedbackId], (oldFeedback: any) => {
				if (!oldFeedback) return oldFeedback

				return {
					...oldFeedback,
					isUpvoted: !oldFeedback.isUpvoted,
					upvotesCount: oldFeedback.isUpvoted
						? oldFeedback.upvotesCount - 1
						: oldFeedback.upvotesCount + 1,
				}
			})

			// Retorna o contexto com os dados antigos para o caso de erro
			return { previousFeedbacks, previousSingleFeedback }
		},

		// Disparado APENAS se a API retornar erro
		onError: (_err, feedbackId, context) => {
			context?.previousFeedbacks.forEach(([queryKey, data]) => {
				queryClient.setQueryData(queryKey, data)
			})

			if (context?.previousSingleFeedback) {
				queryClient.setQueryData(
					['feedback', feedbackId],
					context.previousSingleFeedback,
				)
			}
		},

		onSettled: (_data, _error, feedbackId) => {
			queryClient.invalidateQueries({ queryKey: ['feedbacks'] })
			queryClient.invalidateQueries({ queryKey: ['feedback', feedbackId] })
		},
	})
}
