export interface ApiResponse<T> {
	statusCode: number
	message?: string | null
	data: T
	timestamp: string
	path: string
}

export interface ApiError {
	statusCode: number
	error: number // ou string, dependendo do backend
	message: string
	path: string
	method: string
	timestamp: string
}
