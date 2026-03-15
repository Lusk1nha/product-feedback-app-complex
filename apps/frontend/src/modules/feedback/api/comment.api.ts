import { httpClient } from '@/lib/api-client'
import {
	commentSchema,
	commentUpvoteResponseSchema,
	type Comment,
	type CommentUpvoteResponse,
	type CreateCommentPayload,
} from '../types/comment.schema'

export const CommentApi = {
	/**
	 * Busca a árvore completa de comentários de um feedback
	 */
	listTree: async (
		feedbackId: number,
		signal?: AbortSignal,
	): Promise<Comment[]> => {
		const response = await httpClient.get<Comment[]>(
			`/feedbacks/${feedbackId}/comments`,
			{ signal },
		)
		// Usamos .array().parse() porque a API retorna uma lista de nós-raiz
		return commentSchema.array().parse(response)
	},

	/**
	 * Cria um novo comentário (raiz ou resposta)
	 */
	create: async (
		feedbackId: number,
		payload: CreateCommentPayload,
	): Promise<Comment> => {
		const response = await httpClient.post<Comment>(
			`/feedbacks/${feedbackId}/comments`,
			payload,
		)
		return commentSchema.parse(response)
	},

	/**
	 * Dá toggle no upvote de um comentário específico
	 */
	toggleUpvote: async (
		feedbackId: number,
		commentId: number,
	): Promise<CommentUpvoteResponse> => {
		const response = await httpClient.post<CommentUpvoteResponse>(
			`/feedbacks/${feedbackId}/comments/${commentId}/upvote`,
		)
		return commentUpvoteResponseSchema.parse(response)
	},
}
