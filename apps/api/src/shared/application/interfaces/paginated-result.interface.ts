export interface PaginatedResult<T> {
	data: T[]
	meta: {
		page: number
		perPage: number
		total: number
		lastPage: number
	}
}
