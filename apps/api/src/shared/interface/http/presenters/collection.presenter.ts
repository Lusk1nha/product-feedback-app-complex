import { ApiProperty } from '@nestjs/swagger'
import { PaginatedResult } from 'src/shared/application/interfaces/paginated-result.interface'

class PaginationMeta {
	@ApiProperty() page: number
	@ApiProperty() perPage: number
	@ApiProperty() total: number
	@ApiProperty() lastPage: number
}

export class CollectionPresenter {
	@ApiProperty({ type: PaginationMeta })
	meta: PaginationMeta

	// O "data" será tipado no Controller com Generics do Swagger se quiser,
	// mas aqui deixamos flexível
}

// Helper function para transformar
export function toCollection<T, U>(
	result: PaginatedResult<T>,
	mapper: (item: T) => U,
) {
	return {
		data: result.data.map(mapper),
		meta: result.meta,
	}
}
