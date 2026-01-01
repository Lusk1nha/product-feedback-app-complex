import z from 'zod'

export const paginationSchema = z.object({
	page: z.number().optional().default(1),
	perPage: z.number().optional().default(10),
})

export type PaginationPayload = z.infer<typeof paginationSchema>
