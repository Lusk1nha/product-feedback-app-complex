// src/routes/_authenticated/dashboard/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { MobileTopBar } from '@/components/mobile/mobile-top-bar'
import { MobileSidebar } from '@/components/mobile/mobile-sidebar'
import { SearchFeedbacksBar } from '@/components/dashboard/search-feedbacks-bar'
import { FeedbackSort } from '@/modules/feedback/types/feedback.sort'

import { z } from 'zod'
import { DashboardLogo } from '@/components/dashboard/dashboard-logo'
import { FeedbackCategorySearchSelector } from '@/components/common/feedback-category-search-selector'

const feedbackSearchSchema = z.object({
	sort: z.enum(FeedbackSort).optional().default(FeedbackSort.MostUpvotes),
	category: z.string().optional().default('all'),
})

export const Route = createFileRoute('/_authenticated/dashboard/')({
	validateSearch: (search) => feedbackSearchSchema.parse(search),
	component: DashboardPage,
})

export function DashboardPage() {
	const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false)

	return (
		<div className="flex flex-col relative min-h-screen bg-background sm:py-14 sm:px-10 sm:gap-10 lg:flex-row">
			<header>
				<div className="sm:hidden">
					<MobileTopBar
						isSidebarOpen={isMobileSidebarOpen}
						onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
					/>

					<MobileSidebar
						isOpen={isMobileSidebarOpen}
						onClose={() => setIsMobileSidebarOpen(false)}
					/>
				</div>

				<div className="hidden sm:block">
					<div className="grid grid-cols-3 gap-x-2.5 lg:flex lg:flex-col lg:items-center lg:gap-y-6 lg:w-[255px]">
						<DashboardLogo />
						<FeedbackCategorySearchSelector className="h-full" />
					</div>
				</div>
			</header>

			<main className="w-full flex flex-col gap-y-8">
				<SearchFeedbacksBar />
			</main>
		</div>
	)
}
