import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'motion/react'

import { AddFeedbackRedirectButton } from '@/components/common/buttons/add-feedback-redirect-button'
import { GoBackButton } from '@/components/common/buttons/go-back-button'
import { PageShell } from '@/components/layouts/page-shell'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

import { useRoadmapData } from '@/modules/feedback/hooks/use-roadmap-data'
import { RoadmapCard } from '@/modules/roadmap/components/roadmap-card'

export const Route = createFileRoute('/_authenticated/roadmap/')({
	component: RouteComponent,
})

function RouteComponent() {
	const { data: roadmapData, isLoading } = useRoadmapData()
	const [selectedTabSlug, setSelectedTabSlug] = useState<string | null>(null)

	if (isLoading) {
		return (
			<div className="flex h-screen w-full items-center justify-center">
				<Spinner className="h-10 w-10 text-brand-purple" />
			</div>
		)
	}

	if (!roadmapData) return null

	// Estado derivado com fallback seguro
	const activeTabSlug =
		selectedTabSlug ??
		(roadmapData.find((c) => c.status.slug === 'in-progress')?.status.slug ||
			roadmapData[0]?.status.slug)

	return (
		<PageShell className="flex w-full max-w-7xl flex-col gap-8 md:px-6 md:py-8 md:mx-auto lg:gap-12 lg:px-10 lg:py-14">
			{/* 1. HEADER */}
			<header className="flex w-full items-center justify-between md:rounded-lg bg-brand-search-bar p-6 md:p-8">
				<div className="flex flex-col gap-1">
					<GoBackButton
						to="/dashboard"
						variant="white"
						className="h-auto p-0 pb-1 pl-0 text-[13px] font-bold hover:underline hover:bg-transparent"
					/>
					<h1 className="leading-none text-white text-h3 font-bold md:text-h1">
						Roadmap
					</h1>
				</div>
				<AddFeedbackRedirectButton />
			</header>

			{/* 2. MOBILE TABS */}
			<div className="flex border-b border-[#8C92B3]/25 md:hidden">
				{roadmapData.map((col) => {
					const isActive = activeTabSlug === col.status.slug
					return (
						<button
							key={col.status.slug}
							onClick={() => setSelectedTabSlug(col.status.slug)}
							className={cn(
								'relative flex-1 cursor-pointer pb-4 text-center text-[13px] font-bold transition-colors',
								isActive ? 'text-brand-dark opacity-100' : 'text-brand-dark/40',
							)}
						>
							{col.status.label} ({col.count})
							{isActive && (
								<motion.div
									layoutId="activeTabIndicator"
									className="absolute bottom-0 left-0 right-0 h-1"
									style={{ backgroundColor: col.status.hexColor }}
									transition={{ type: 'spring', stiffness: 500, damping: 30 }}
								/>
							)}
						</button>
					)
				})}
			</div>

			{/* 3. MAIN CONTENT (GRID) */}
			<main className="w-full">
				<div className="grid grid-cols-1 px-6 pb-4 gap-6 md:grid-cols-3 md:gap-8">
					{roadmapData.map((col) => {
						const isMobileActive = activeTabSlug === col.status.slug

						return (
							<div
								key={col.status.slug}
								className={cn(
									!isMobileActive ? 'hidden md:flex' : 'flex',
									'min-h-0 flex-col gap-6 md:gap-8',
								)}
							>
								{/* Header da Coluna */}
								<div className="flex flex-col gap-1">
									<h3 className="flex items-center gap-2 text-brand-dark text-h3">
										{col.status.label}
										<span className="text-brand-grey opacity-75">
											({col.count})
										</span>
									</h3>
									<p className="text-[14px] text-brand-grey text-body-1">
										{col.status.description}
									</p>
								</div>

								{/* Lista de Cards */}
								<div className="flex flex-col gap-4 md:gap-6">
									{col.feedbacks.map((feedback) => (
										<RoadmapCard
											key={feedback.id}
											feedback={feedback}
											statusLabel={col.status.label}
											statusColor={col.status.hexColor}
										/>
									))}

									{/* Empty State visualmente alinhado */}
									{col.feedbacks.length === 0 && (
										<div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/50 p-6 text-center">
											<span className="text-[13px] text-brand-grey/50">
												None
											</span>
										</div>
									)}
								</div>
							</div>
						)
					})}
				</div>
			</main>
		</PageShell>
	)
}
