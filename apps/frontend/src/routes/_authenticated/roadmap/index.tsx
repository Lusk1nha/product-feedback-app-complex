import { AddFeedbackRedirectButton } from '@/components/common/buttons/add-feedback-redirect-button'
import { GoBackButton } from '@/components/common/buttons/go-back-button'
import { PageShell } from '@/components/layouts/page-shell'

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/roadmap/')({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<PageShell className="md:px-10 md:py-14">
			<div className="w-full bg-brand-navy flex justify-between items-center px-6 py-5 md:px-8 md:py-9 md:rounded-lg">
				<div className="flex flex-col">
					<GoBackButton to="/dashboard" variant="white" className='pb-0' />
					<h1 className="text-h3 font-bold text-white md:text-h1">Roadmap</h1>
				</div>

				<AddFeedbackRedirectButton />
			</div>
		</PageShell>
	)
}
