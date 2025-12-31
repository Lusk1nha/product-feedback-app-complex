import { createFileRoute } from '@tanstack/react-router'
import { useAppMetadata } from '@/modules/feedback/hooks/use-app-metadata'
import { CreateFeedbackForm } from '@/modules/feedback/components/create-feedback-form'

export const Route = createFileRoute('/_authenticated/feedbacks/new/')({
	component: CreateFeedbackPage,
})

export function CreateFeedbackPage() {
	const { data: metadata, isLoading } = useAppMetadata()

	if (isLoading || !metadata) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-brand-lighter">
				<div className="w-8 h-8 border-4 border-brand-purple border-t-transparent rounded-full animate-spin" />
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-brand-lighter flex justify-center p-6 md:py-20">
			<CreateFeedbackForm metadata={metadata} />
		</div>
	)
}
