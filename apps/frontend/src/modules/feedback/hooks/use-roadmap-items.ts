import { useMemo } from 'react'
import { useAppMetadata } from './use-app-metadata'
import { useRoadmapStats } from './use-roadmap-stats'

export function useRoadmapItems() {
	const { data: metadata, isLoading: isMetaLoading } = useAppMetadata()
	const { data: statsData, isLoading: isStatsLoading } = useRoadmapStats()

	// 1. Unificamos o estado de loading
	const isLoading = isMetaLoading || isStatsLoading

	// 2. Memoização: Só recalcula se 'metadata' ou 'statsData' mudarem.
	// Isso evita que o array seja recriado em re-renders desnecessários.
	const items = useMemo(() => {
		if (!metadata || !statsData) return []

		return metadata.feedback.statuses
			.filter((status) => status.includeInRoadmap)
			.map((status) => ({
				// Retornamos um objeto "ViewModel" pronto para a UI consumir
				slug: status.slug,
				label: status.label,
				color: status.hexColor,
				// A lógica de fallback fica encapsulada aqui
				count: statsData.stats[status.slug] ?? 0,
			}))
	}, [metadata, statsData])

	return {
		items,
		isLoading,
	}
}
