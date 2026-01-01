import { MessageSquare, ChevronUp } from 'lucide-react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import type { Feedback, FeedbackCategory } from '../types/feedback.schema'

interface FeedbackCardProps {
	feedback: Feedback
	categories?: FeedbackCategory[]
	onClick?: () => void
}

export function FeedbackCard({
	feedback,
	categories,
	onClick,
}: FeedbackCardProps) {
	// Encontra o label da categoria ou usa o slug formatado
	const categoryLabel =
		categories?.find((c) => c.slug === feedback.categorySlug)?.label ??
		feedback.categorySlug

	const commentsCount = (feedback as any).commentsCount ?? 0

	return (
		<motion.div
			layout
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, scale: 0.95 }}
			whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
			onClick={onClick}
			className="group relative flex flex-col gap-6 rounded-lg bg-card p-6 transition-shadow md:flex-row md:gap-10 md:px-8 md:py-7 cursor-pointer"
		>
			{/* 1. Desktop Upvote (Esquerda) */}
			<div className="hidden md:block">
				<UpvoteButton
					count={feedback.upvotesCount}
					isActive={feedback.isUpvoted}
				/>
			</div>

			{/* 2. Conteúdo Principal */}
			<div className="flex flex-1 flex-col gap-3">
				<h3 className="text-h3 text-brand-dark transition-colors group-hover:text-brand-blue">
					{feedback.title}
				</h3>

				<p className="text-body-1 text-brand-grey line-clamp-2 md:line-clamp-none">
					{feedback.description}
				</p>

				<div className="mt-1">
					<span className="inline-flex items-center rounded-lg bg-brand-light px-4 py-1.5 text-body-3 font-semibold text-brand-blue capitalize">
						{categoryLabel}
					</span>
				</div>
			</div>

			{/* 3. Mobile Footer (Upvote + Comentários) */}
			<div className="flex items-center justify-between md:hidden">
				<UpvoteButton
					count={feedback.upvotesCount}
					isActive={feedback.isUpvoted}
					orientation="horizontal"
				/>
				<CommentIndicator count={commentsCount} />
			</div>

			{/* 4. Desktop Comentários (Direita) */}
			<div className="hidden min-w-[40px] items-center justify-end self-center md:flex">
				<CommentIndicator count={commentsCount} />
			</div>
		</motion.div>
	)
}

// --- Componentes Menores (Extraídos para DRY) ---

function UpvoteButton({
	count,
	isActive,
	orientation = 'vertical',
}: {
	count: number
	isActive?: boolean
	orientation?: 'vertical' | 'horizontal'
}) {
	return (
		<button
			onClick={(e) => {
				e.stopPropagation()
				// TODO: Implementar lógica de toggle
			}}
			className={cn(
				'flex items-center justify-between rounded-lg transition-colors',
				'bg-brand-light hover:bg-[#CFD7FF] active:bg-brand-blue', // Usei hex do hover pois não tem var específica, mas active usa brand-blue
				isActive ? 'bg-brand-blue text-white' : 'text-brand-dark',
				orientation === 'vertical'
					? 'h-[53px] w-10 flex-col p-2'
					: 'h-8 flex-row gap-2.5 px-4 py-1.5',
			)}
		>
			<ChevronUp
				className={cn(
					'h-3 w-3 stroke-[3px]',
					isActive ? 'text-white' : 'text-brand-blue',
				)}
			/>
			<span
				className={cn(
					'text-body-3 font-bold',
					isActive ? 'text-white' : 'text-brand-dark',
				)}
			>
				{count}
			</span>
		</button>
	)
}

function CommentIndicator({ count }: { count: number }) {
	return (
		<div className="flex items-center gap-2 text-brand-dark">
			{/* fill-[#CDD2EE] é uma cor específica do design para o ícone inativo */}
			<MessageSquare className="h-5 w-5 fill-[#CDD2EE] text-transparent" />
			<span
				className={cn(
					'text-body-3 font-bold',
					count === 0 ? 'opacity-50' : 'opacity-100',
				)}
			>
				{count}
			</span>
		</div>
	)
}
