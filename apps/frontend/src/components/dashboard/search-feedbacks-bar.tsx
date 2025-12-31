import { type FeedbackValue } from '@/modules/feedback/types/feedback.sort'
import { BulbSvg } from '../common/icons/bulb-svg'
import { SelectFeedbackSort } from '../feedback/select-feedback-sort'
import { Button } from '../ui/button'
import { Link, useSearch } from '@tanstack/react-router'
import { useNavigate } from '@tanstack/react-router'

interface SearchFeedbacksBarProps {
	sugestionsFoundedLength?: number
}

export function SearchFeedbacksBar({
	sugestionsFoundedLength = 0,
}: Readonly<SearchFeedbacksBarProps>) {
	// 1. LER DA URL

	const search = useSearch({ from: '/_authenticated/dashboard/' })
	const navigate = useNavigate()

	// 2. ATUALIZAR URL
	const handleSortChange = (newSort: FeedbackValue) => {
		navigate({
			to: '.', // Fica na mesma rota
			search: (prev) => ({ ...prev, sort: newSort }), // Atualiza só o sort
			replace: true, // Substitui o histórico para não poluir o botão "Voltar"
		})
	}

	return (
		<div className="bg-brand-dark w-full h-14 px-6 flex items-center justify-between sm:rounded-lg sm:h-18">
			<div className="flex items-center gap-x-9.5">
				<SuggestionsCount count={sugestionsFoundedLength} />
				<SelectFeedbackSort
					currentValue={search.sort} // Passa o valor da URL
					onSelect={handleSortChange}
				/>
			</div>

			<Link to="/feedbacks/new">
				<Button
					type="button"
					className="text-h4 font-bold h-10 bg-brand-purple hover:bg-brand-purple/80 text-white sm:h-11"
				>
					+ Add Feedback
				</Button>
			</Link>
		</div>
	)
}

function SuggestionsCount({ count = 0 }: Readonly<{ count: number }>) {
	return (
		<div className="hidden items-center gap-x-4 sm:flex text-white">
			<BulbSvg />
			<p className="text-h3 font-medium">{`${count} Suggestions`}</p>
		</div>
	)
}
