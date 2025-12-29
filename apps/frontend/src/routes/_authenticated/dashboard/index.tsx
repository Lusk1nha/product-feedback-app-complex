import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { z } from 'zod'
import { motion, type Variants } from 'motion/react'

import { MobileTopBar } from '@/components/mobile/mobile-top-bar'
import { MobileSidebar } from '@/components/mobile/mobile-sidebar'
import { SearchFeedbacksBar } from '@/components/dashboard/search-feedbacks-bar'
import { DashboardLogo } from '@/components/dashboard/dashboard-logo'
import { FeedbackCategorySearchSelector } from '@/components/common/feedback-category-search-selector'
import { FeedbackSort } from '@/modules/feedback/types/feedback.sort'

const feedbackSearchSchema = z.object({
	sort: z.nativeEnum(FeedbackSort).optional().default(FeedbackSort.MostUpvotes),
	category: z.string().optional().default('all'),
})

export const Route = createFileRoute('/_authenticated/dashboard/')({
	validateSearch: (search) => feedbackSearchSchema.parse(search),
	component: DashboardPage,
})

// Variantes de animação para entrada suave
const containerVariants: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1, // Elementos aparecem um após o outro
		},
	},
}

const itemVariants: Variants = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export function DashboardPage() {
	const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

	return (
		<motion.div
			initial="hidden"
			animate="visible"
			variants={containerVariants}
			className="flex flex-col relative min-h-screen bg-background sm:py-14 sm:px-10 sm:gap-10 lg:flex-row lg:py-24 lg:px-18"
		>
			{/* --- Mobile Header & Sidebar --- */}
			<div className="sm:hidden">
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
			<motion.aside variants={itemVariants} className="hidden sm:block">
				<div className="grid grid-cols-3 gap-x-2.5 lg:flex lg:flex-col lg:gap-y-6 lg:w-[255px]">
					<DashboardLogo />

					<div className="bg-white rounded-lg dark:bg-card">
						<FeedbackCategorySearchSelector />
					</div>

					{/* Placeholder para o Card de Roadmap (Tablet/Desktop) */}
					<div className="bg-white rounded-lg p-6 h-full min-h-[178px] dark:bg-card">
						<div className="flex justify-between items-center mb-6">
							<h3 className="text-h3 text-brand-dark">Roadmap</h3>
							<a
								href="#"
								className="text-body-3 text-brand-blue underline font-semibold"
							>
								View
							</a>
						</div>
					</div>
				</div>
			</motion.aside>

			{/* --- Main Content --- */}
			<motion.main
				variants={itemVariants}
				className="w-full max-w-[825px] flex flex-col gap-y-6"
			>
				<SearchFeedbacksBar />

				{/* Aqui virá a lista de feedbacks (Empty State ou Lista Real) */}
			</motion.main>
		</motion.div>
	)
}
