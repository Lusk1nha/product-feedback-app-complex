import { createFileRoute } from '@tanstack/react-router'
import { useAppMetadata } from '@/modules/feedback/hooks/use-app-metadata'
import { useFeedback } from '@/modules/feedback/hooks/use-feedback-details'
import { EditFeedbackForm } from '@/modules/feedback/components/edit-feedback-form'

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
			<div className="min-h-screen flex items-center justify-center bg-brand-lighter">
				<div className="w-8 h-8 border-4 border-brand-purple border-t-transparent rounded-full animate-spin" />
			</div>
		)
	}

	// 3. Render Form
	return (
		<div className="min-h-screen bg-brand-lighter flex justify-center p-6 md:py-20">
			<EditFeedbackForm initialData={feedback} metadata={metadata} />
		</div>
	)
}
