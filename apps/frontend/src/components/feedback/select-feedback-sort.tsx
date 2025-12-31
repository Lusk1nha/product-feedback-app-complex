import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { SortFeedbackPopover } from './popovers/sort-feedback-popover'
import {
	getFeedbackSortLabel,
	type FeedbackValue,
} from '@/modules/feedback/types/feedback.sort'
import { cn } from '@/lib/utils'

interface SelectFeedbackSortProps {
	currentValue: FeedbackValue
	onSelect: (value: FeedbackValue) => void
}

export function SelectFeedbackSort({
	currentValue,
	onSelect,
}: Readonly<SelectFeedbackSortProps>) {
	const [isOpen, setIsOpen] = useState<boolean>(false)

	return (
		<div className="flex items-center gap-x-2 relative z-10">
			{/* 1. O texto estático fica AQUI FORA, totalmente isolado */}
			<span className="text-body-3 font-normal text-brand-light">
				Sort by :
			</span>

			{/* 2. O Popover envolve APENAS a parte clicável */}
			<SortFeedbackPopover
				value={currentValue}
				onSelect={(val) => {
					onSelect(val)
					setIsOpen(false)
				}}
				isOpen={isOpen}
				onOpenChange={setIsOpen}
			>
				<button
					type="button"
					className={cn(
						'flex items-center gap-1 cursor-pointer select-none outline-none',
						isOpen ? 'opacity-75' : 'opacity-100',
					)}
				>
					<span className="text-body-3 text-brand-light font-bold">
						{getFeedbackSortLabel(currentValue)}
					</span>

					{isOpen ? (
						<ChevronUp className="size-4 text-brand-light" />
					) : (
						<ChevronDown className="size-4 text-brand-light" />
					)}
				</button>
			</SortFeedbackPopover>
		</div>
	)
}
