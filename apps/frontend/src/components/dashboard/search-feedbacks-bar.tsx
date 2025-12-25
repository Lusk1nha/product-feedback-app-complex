import { type FeedbackValue } from '@/modules/feedback/types/feedback.sort'
import { BulbSvg } from '../common/icons/bulb-svg'
import { SelectFeedbackSort } from '../feedbacks/select-feedback-sort'
import { Button } from '../ui/button'
import { useSearch } from '@tanstack/react-router'
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
		<div className="bg-brand-dark w-full h-14 px-6 flex items-center justify-between">
			<div className="flex items-center gap-x-8">
				<SuggestionsCount count={sugestionsFoundedLength} />
				<SelectFeedbackSort
					currentValue={search.sort} // Passa o valor da URL
					onSelect={handleSortChange}
				/>
			</div>

			<Button
				type="button"
				className="text-h4 font-bold bg-brand-purple hover:bg-brand-purple/80 text-white"
			>
				+ Add Feedback
			</Button>
		</div>
	)
}

function SuggestionsCount({ count = 0 }: Readonly<{ count: number }>) {
	return (
		<div className="hidden items-center gap-x-2 sm:flex">
			<BulbSvg />
			<p className="text-h3 font-medium">{`${count} Suggestions`}</p>
		</div>
	)
}
