// src/routes/_authenticated/dashboard/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { MobileTopBar } from '@/components/mobile/mobile-top-bar'
import { MobileSidebar } from '@/components/mobile/mobile-sidebar'
import { SearchFeedbacksBar } from '@/components/dashboard/search-feedbacks-bar'
import { FeedbackSort } from '@/modules/feedback/types/feedback.sort'

import { z } from 'zod'
import { DashboardLogo } from '@/components/dashboard/dashboard-logo'

const feedbackSearchSchema = z.object({
	sort: z.enum(FeedbackSort).optional().default(FeedbackSort.MostUpvotes),
})

export const Route = createFileRoute('/_authenticated/dashboard/')({
	validateSearch: (search) => feedbackSearchSchema.parse(search),
	component: DashboardPage,
})

export function DashboardPage() {
	const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false)

	return (
		<div className="flex flex-col relative min-h-screen bg-background sm:py-14 sm:px-10 sm:gap-10">
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
					<DashboardLogo />
				</div>
			</header>

			<main className="flex flex-col gap-y-8">
				<SearchFeedbacksBar />
			</main>
		</div>
	)
}
