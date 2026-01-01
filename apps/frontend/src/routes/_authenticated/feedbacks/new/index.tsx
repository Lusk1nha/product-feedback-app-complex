import { createFileRoute } from '@tanstack/react-router'
import { useAppMetadata } from '@/modules/feedback/hooks/use-app-metadata'
import { CreateFeedbackForm } from '@/modules/feedback/components/create-feedback-form'
import { PageShell } from '@/components/layouts/page-shell'

import { motion } from 'motion/react'

import { GoBackButton } from '@/components/common/buttons/go-back-button'

export const Route = createFileRoute('/_authenticated/feedbacks/new/')({
	component: CreateFeedbackPage,
})

export function CreateFeedbackPage() {
	const { data: metadata, isLoading } = useAppMetadata()

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
					<GoBackButton to="/dashboard" />
				</motion.div>

				<CreateFeedbackForm metadata={metadata} />
			</div>
		</PageShell>
	)
}
