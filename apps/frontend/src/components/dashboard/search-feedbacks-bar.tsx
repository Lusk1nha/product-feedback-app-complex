import { type FeedbackSortValue } from '@/modules/feedback/types/feedback.sort'
import { BulbSvg } from '../common/icons/bulb-svg'
import { SelectFeedbackSort } from '../../modules/feedback/components/select-feedback-sort'
import { useSearch, useNavigate } from '@tanstack/react-router'
import { AddFeedbackRedirectButton } from '../common/buttons/add-feedback-redirect-button'
import { useCountFeedbacks } from '@/modules/feedback/hooks/use-count-feedbacks'
import { Spinner } from '../ui/spinner'

export function SearchFeedbacksBar() {
	const search = useSearch({ from: '/_authenticated/dashboard/' })
	const navigate = useNavigate()

	const { data: countFeedbacks, isLoading } = useCountFeedbacks({
		status: 'suggestion',
	})

	const handleSortChange = (newSort: FeedbackSortValue) => {
		navigate({
			to: '.',
			search: (prev) => ({ ...prev, sort: newSort }),
			replace: true,
		})
	}

	return (
		<div className="bg-brand-dark w-full h-14 px-6 flex items-center justify-between md:rounded-lg md:h-18">
			<div className="flex items-center gap-x-9.5">
				<SuggestionsCount count={countFeedbacks ?? 0} isLoading={isLoading} />
				<SelectFeedbackSort
					currentValue={search.sort}
					onSelect={handleSortChange}
				/>
			</div>

			<AddFeedbackRedirectButton />
		</div>
	)
}

function SuggestionsCount({
	count = 0,
	isLoading,
}: Readonly<{ count: number; isLoading?: boolean }>) {
	return (
		<div className="hidden items-center gap-x-4 md:flex text-white">
			<BulbSvg />

			<div className="text-h3 font-bold text-white">
				{isLoading ? (
					<div className="flex items-center gap-3">
						<Spinner className="w-5 h-5 text-white/70" />
						<span className="opacity-80">Calculating...</span>
					</div>
				) : (
					<span>{count === 0 ? 'No suggestions' : `${count} Suggestions`}</span>
				)}
			</div>
		</div>
	)
}
