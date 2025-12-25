// src/routes/_authenticated/dashboard/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { MobileTopBar } from '@/components/mobile/mobile-top-bar'
import { MobileSidebar } from '@/components/mobile/mobile-sidebar'
import { SearchFeedbacksBar } from '@/components/dashboard/search-feedbacks-bar'
import { FeedbackSort } from '@/modules/feedback/types/feedback.sort'

import { z } from 'zod'

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
		<div className="relative min-h-screen bg-background">
			<header>
				<MobileTopBar
					isSidebarOpen={isMobileSidebarOpen}
					onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
				/>

				<MobileSidebar
					isOpen={isMobileSidebarOpen}
					onClose={() => setIsMobileSidebarOpen(false)}
				/>
			</header>

			<main className="flex flex-col gap-y-8">
				<SearchFeedbacksBar />
			</main>
		</div>
	)
}
