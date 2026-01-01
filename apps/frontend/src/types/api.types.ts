export interface PaginationMeta {
	page: number
	perPage: number
	total: number
	lastPage: number
}

export interface ApiResponse<T> {
	statusCode: number
	message?: string | null
	data: T
	meta?: PaginationMeta
	timestamp: string
	path: string
}

export interface PaginatedResult<T> {
	data: T
	meta: PaginationMeta
}

export interface ApiError {
	statusCode: number
	error: number // ou string, dependendo do backend
	message: string
	path: string
	method: string
	timestamp: string
}
