import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { motion, type Variants } from 'motion/react'

import { MobileTopBar } from '@/components/mobile/mobile-top-bar'
import { MobileSidebar } from '@/components/mobile/mobile-sidebar'
import { SearchFeedbacksBar } from '@/components/dashboard/search-feedbacks-bar'
import { DashboardLogo } from '@/components/dashboard/dashboard-logo'
import { FeedbackCategorySearchSelector } from '@/modules/feedback/components/feedback-category-search-selector'
import { FeedbackSort } from '@/modules/feedback/types/feedback.sort'
import { RoadmapCard } from '@/components/roadmap/roadmap-card'
import { PageShell } from '@/components/layouts/page-shell'

const feedbackSearchPageValidateSearchSchema = z.object({
	sort: z.enum(FeedbackSort).optional().default(FeedbackSort.MostUpvotes),
	category: z.string().optional().default('all'),
})

export const Route = createFileRoute('/_authenticated/dashboard/')({
	validateSearch: (search) =>
		feedbackSearchPageValidateSearchSchema.parse(search),
	component: DashboardPage,

	errorComponent: ({ reset }) => {
		return (
			<PageShell>
				<div className="flex flex-col items-center justify-center h-full">
					<p className="text-red-500">
						Ops! Não foi possível carregar os feedbacks.
					</p>
					<button onClick={reset} className="btn-primary">
						Tentar novamente
					</button>
				</div>
			</PageShell>
		)
	},
})

const itemVariants: Variants = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export function DashboardPage() {
	const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

	return (
		<PageShell className="md:pt-14 md:pb-14 md:px-10 md:gap-y-10 md:gap-x-7.5 md:items-center lg:flex-row lg:items-start lg:justify-center">
			{/* --- Mobile Header & Sidebar --- */}
			<div className="w-full md:hidden">
				<MobileTopBar
					isSidebarOpen={isMobileSidebarOpen}
					onToggleSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
				/>

				<MobileSidebar
					isOpen={isMobileSidebarOpen}
					onClose={() => setIsMobileSidebarOpen(false)}
				/>
			</div>

			{/* --- Desktop/Tablet Sidebar Column --- */}
			<motion.aside variants={itemVariants} className="hidden md:block">
				<div className="grid grid-cols-3 gap-x-2.5 lg:flex lg:flex-col lg:gap-y-6 lg:w-[255px]">
					<DashboardLogo />
					<FeedbackCategorySearchSelector />
					<RoadmapCard />
				</div>
			</motion.aside>

			{/* --- Main Content --- */}
			<motion.main
				variants={itemVariants}
				className="w-full flex flex-col gap-y-6"
			>
				<SearchFeedbacksBar />
			</motion.main>
		</PageShell>
	)
}
