import { httpClient } from '@/lib/api-client'
import {
	metadataResponseSchema,
	type MetadataResponse,
} from '../types/metadata.schema'

export const MetadataAppApi = {
	/**
	 * Fetches metadata for the application.
	 * @returns {Promise<MetadataResponse>} The metadata for the application.
	 */
	getMetadata: async () => {
		const response = await httpClient.get<MetadataResponse>('/config/metadata')
		return metadataResponseSchema.parse(response)
	},
}
