import { motion } from 'motion/react'

import { PageShell } from '@/components/layouts/page-shell'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useFeedback } from '@/modules/feedback/hooks/use-feedback-details'
import { createFileRoute, Link } from '@tanstack/react-router'

import { useAppMetadata } from '@/modules/feedback/hooks/use-app-metadata'
import { FeedbackCard } from '@/modules/feedback/components/feedback-card'
import { GoBackButton } from '@/components/common/buttons/go-back-button'

export const Route = createFileRoute('/_authenticated/feedbacks/$feedbackId/')({
	component: FeedbackPage,
})

export function FeedbackPage() {
	const { feedbackId } = Route.useParams()

	const { data: feedback, isLoading: isLoadingFeedback } = useFeedback(
		Number(feedbackId),
	)
	const { data: metadata, isLoading: isLoadingMetadata } = useAppMetadata()

	const categories = metadata?.feedback.categories

	if (isLoadingFeedback || isLoadingMetadata) {
		return (
			<PageShell className="min-h-screen flex items-center justify-center">
				<div className="flex flex-col items-center gap-2">
					<Spinner className="h-16 w-16" />
					<p className="text-body-1 text-brand-grey">Loading feedback...</p>
				</div>
			</PageShell>
		)
	}

	if (!feedback) {
		throw new Error('Feedback not found')
	}

	return (
		<PageShell className="pt-8.5 pb-8 md:pt-14">
			<div className="max-w-5xl w-full mx-auto flex flex-col gap-6">
				<div className="flex items-center justify-between gap-4">
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
					>
						<GoBackButton to="/dashboard" />
					</motion.div>

					<Link to="/feedbacks/$feedbackId/edit" params={{ feedbackId }}>
						<Button
							type="button"
							className="text-h4 font-bold h-10 bg-brand-purple hover:bg-brand-purple/80 text-white md:h-11"
						>
							Edit Feedback
						</Button>
					</Link>
				</div>

				<div className="flex flex-col gap-4 md:gap-5">
					<FeedbackCard feedback={feedback!} categories={categories!} />
				</div>
			</div>
		</PageShell>
	)
}
