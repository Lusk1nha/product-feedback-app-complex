import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAppMetadata } from '@/modules/feedback/hooks/use-app-metadata'
import { CreateFeedbackForm } from '@/modules/feedback/components/create-feedback-form'
import { PageShell } from '@/components/layouts/page-shell'

import { motion } from 'motion/react'

import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_authenticated/feedbacks/new/')({
	component: CreateFeedbackPage,
})

export function CreateFeedbackPage() {
	const { data: metadata, isLoading } = useAppMetadata()
	const navigate = useNavigate()

	if (isLoading || !metadata) {
		return (
			<PageShell className="flex items-center justify-center pt-8.5 pb-8 md:pt-14">
				<div className="w-8 h-8 border-4 border-brand-purple border-t-transparent rounded-full animate-spin" />
			</PageShell>
		)
	}

	return (
		<PageShell className="flex items-center pt-8.5 pb-8 md:pt-14">
			<div className="w-full max-w-[540px] lg:max-w-[720px] flex flex-col gap-y-13 px-6">
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
				>
					<Button
						variant="ghost"
						onClick={() => navigate({ to: '..' })}
						className="has-[>svg]:px-0 hover:bg-transparent text-brand-grey hover:underline font-bold"
					>
						<ChevronLeft className="w-4 h-4 mr-2 text-brand-blue" />
						Go Back
					</Button>
				</motion.div>

				<CreateFeedbackForm metadata={metadata} />
			</div>
		</PageShell>
	)
}
