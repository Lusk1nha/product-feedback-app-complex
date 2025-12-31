// src/components/feedbacks/popovers/sort-feedback-popover.tsx

import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { Check } from 'lucide-react' // Importe o Check
import { cn } from '@/lib/utils'
import {
	FeedbackSort,
	getFeedbackSortLabel,
	type FeedbackValue,
} from '@/modules/feedback/types/feedback.sort'

interface SortFeedbackPopoverProps {
	value: FeedbackValue
	onSelect: (value: FeedbackValue) => void
	children: React.ReactNode
	isOpen: boolean
	onOpenChange: (open: boolean) => void
}

export function SortFeedbackPopover({
	value,
	onSelect,
	children,
	isOpen,
	onOpenChange,
}: Readonly<SortFeedbackPopoverProps>) {
	return (
		<Popover open={isOpen} onOpenChange={onOpenChange}>
			<PopoverTrigger asChild>{children}</PopoverTrigger>
			<PopoverContent
				className="p-0 border-none outline-none w-[255px] shadow-xl rounded-lg mt-4"
				align="start"
				side="bottom"
			>
				<SortFeedbackList currentValue={value} onSelect={onSelect} />
			</PopoverContent>
		</Popover>
	)
}

function SortFeedbackList({
	currentValue,
	onSelect,
}: Readonly<{
	currentValue: FeedbackValue
	onSelect: (value: FeedbackValue) => void
}>) {
	return (
		<ul className="flex flex-col w-full bg-white rounded-lg dark:bg-card overflow-hidden">
			{Object?.entries(FeedbackSort).map(([_, optionValue], index, array) => {
				const isSelected = currentValue === optionValue
				const isLastItem = index === array.length - 1

				return (
					<li
						key={optionValue}
						className={cn(
							'border-b border-brand-navy/15 dark:border-white/15',
							isLastItem && 'border-b-0',
						)}
					>
						<button
							type="button"
							className={cn(
								'w-full h-12 px-6 flex items-center justify-between cursor-pointer',
								'text-body-1 text-brand-grey hover:text-brand-purple transition-colors',
								isSelected && 'text-brand-purple',
							)}
							onClick={() => onSelect(optionValue)}
						>
							<span>{getFeedbackSortLabel(optionValue)}</span>
							{isSelected && <Check className="size-4" />}
						</button>
					</li>
				)
			})}
		</ul>
	)
}
