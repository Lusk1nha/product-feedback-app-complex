import { cn } from '@/lib/utils'
import { useAppMetadata } from '@/modules/feedback/hooks/use-app-metadata'
import { Skeleton } from '@/components/ui/skeleton' // Assumindo que você tem shadcn
import { useNavigate, useSearch } from '@tanstack/react-router'

interface FeedbackCategorySearchSelectorProps {
	className?: string
}

export function FeedbackCategorySearchSelector({
	className,
}: FeedbackCategorySearchSelectorProps) {
	const { data: metadata, isFetching } = useAppMetadata()
	const navigate = useNavigate()

	const search = useSearch({ strict: false }) as {
		category?: string
		sort?: string
	}

	const currentCategory = search.category || 'all'

	const handleCategoryClick = (slug: string) => {
		if (slug === currentCategory) return

		navigate({
			to: '.', // Mantém na mesma rota
			search: (prev) => ({
				...prev, // ⚠️ IMPORTANTE: Mantém outros filtros (ex: sort)
				category: slug === 'all' ? undefined : slug, // Remove da URL se for 'all'
			}),
			replace: true, // Não polui o histórico do navegador
		})
	}

	// Se estiver carregando, mostra o esqueleto para não pular a tela
	if (isFetching || !metadata) {
		return <CategorySkeletonLoader />
	}

	// Prepara a lista unificada
	const categories = [
		{ slug: 'all', label: 'All' },
		...(metadata.feedback.categories || []),
	]

	return (
		<div
			className={cn(
				'bg-white p-6 rounded-lg dark:bg-card shadow-sm shadow-brand-blue/10',
				className,
			)}
		>
			<ul className="flex flex-wrap gap-x-2 gap-y-3.5">
				{categories?.map((category) => {
					const isActive = currentCategory === category.slug

					return (
						<li key={category.slug}>
							<button
								type="button"
								onClick={() => handleCategoryClick(category.slug)}
								className={cn(
									'cursor-pointer px-4 py-1.25 rounded-lg text-body-3 font-semibold transition-all duration-200',

									isActive
										? 'bg-brand-blue text-white'
										: 'bg-brand-light text-brand-blue hover:bg-[#CFD7FF]',

									// Focus Accessibility
									'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2',
								)}
								aria-pressed={isActive}
							>
								{category.label}
							</button>
						</li>
					)
				})}
			</ul>
		</div>
	)
}

// --- Subcomponente de Loading (Skeleton) ---
function CategorySkeletonLoader() {
	return (
		<div className="bg-white p-6 rounded-lg dark:bg-card">
			<div className="flex flex-wrap gap-x-2 gap-y-3.5">
				{/* Gera 6 pílulas falsas de tamanhos variados */}
				{[48, 64, 52, 70, 56, 48].map((width, i) => (
					<Skeleton
						key={i}
						className="h-[30px] rounded-lg bg-brand-light/50"
						style={{ width }}
					/>
				))}
			</div>
		</div>
	)
}
