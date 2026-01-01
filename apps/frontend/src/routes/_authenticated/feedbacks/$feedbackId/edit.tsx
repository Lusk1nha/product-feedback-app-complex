import { createFileRoute } from '@tanstack/react-router'
import { useAppMetadata } from '@/modules/feedback/hooks/use-app-metadata'
import { useFeedback } from '@/modules/feedback/hooks/use-feedback-details'
import { EditFeedbackForm } from '@/modules/feedback/components/edit-feedback-form'
import { PageShell } from '@/components/layouts/page-shell'

import { motion } from 'motion/react'

import { GoBackButton } from '@/components/common/buttons/go-back-button'

export const Route = createFileRoute(
	'/_authenticated/feedbacks/$feedbackId/edit',
)({
	component: EditFeedbackPage,
})

export function EditFeedbackPage() {
	const { feedbackId } = Route.useParams()

	// 1. Fetch Data
	const { data: metadata, isLoading: isLoadingMeta } = useAppMetadata()
	const { data: feedback, isLoading: isLoadingFeedback } = useFeedback(
		Number(feedbackId),
	)

	// 2. Loading State (Espera os dois estarem prontos)
	const isLoading = isLoadingMeta || isLoadingFeedback
	const hasData = metadata && feedback

	if (isLoading || !hasData) {
		return (
			<PageShell className="flex items-center justify-center pt-8.5 pb-8 md:pt-14">
				<div className="w-8 h-8 border-4 border-brand-purple border-t-transparent rounded-full animate-spin" />
			</PageShell>
		)
	}

	// 3. Render Form
	return (
		<PageShell className="flex items-center pt-8.5 pb-8 md:pt-14">
			<div className="w-full max-w-[540px] lg:max-w-[720px] flex flex-col gap-y-13 px-6">
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
				>
					<GoBackButton to="/feedbacks/$feedbackId" params={{ feedbackId }} />
				</motion.div>

				<EditFeedbackForm initialData={feedback} metadata={metadata} />
			</div>
		</PageShell>
	)
}
