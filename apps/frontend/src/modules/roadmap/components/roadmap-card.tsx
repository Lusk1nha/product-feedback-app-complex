import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { MessageSquare, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Feedback } from '@/modules/feedback/types/feedback.schema'

// 1. Definição correta de tipos (Estenda se necessário, evite 'any')
// Se commentsCount não existe no type Feedback original, o ideal é estender a interface aqui ou no schema global.
interface FeedbackWithCounts extends Feedback {
	commentsCount?: number
}

interface RoadmapCardProps {
	feedback: FeedbackWithCounts
	statusLabel: string
	statusColor: string
}

const categoryLabels: Record<string, string> = {
	ui: 'UI',
	ux: 'UX',
	enhancement: 'Enhancement',
	bug: 'Bug',
	feature: 'Feature',
}

export function RoadmapCard({
	feedback,
	statusLabel,
	statusColor,
}: RoadmapCardProps) {
	const commentsCount = feedback.commentsCount ?? 0
	const categoryLabel =
		categoryLabels[feedback.categorySlug] ?? feedback.categorySlug

	return (
		<motion.div
			layout
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			whileHover={{ y: -4, transition: { duration: 0.2 } }}
			className="group relative flex cursor-pointer flex-col gap-3 rounded-[5px] border-t-[6px] bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
			style={{ borderColor: statusColor }}
		>
			{/* Status Indicator */}
			<div className="flex items-center gap-2">
				<span
					className="h-2 w-2 rounded-full"
					style={{ backgroundColor: statusColor }}
				/>
				<span className="text-body-1 text-[13px] text-brand-grey">
					{statusLabel}
				</span>
			</div>

			{/* Content */}
			<div className="flex flex-col gap-2">
				{/* 2. TÉCNICA STRETCHED LINK 🧠
           Adicionamos `before:absolute before:inset-0`.
           Isso cria uma área clicável que cobre o card todo (o pai relative).
        */}
				<Link
					to="/feedbacks/$feedbackId"
					params={{ feedbackId: String(feedback.id) }}
					className="text-h3 text-brand-dark transition-colors group-hover:text-brand-blue before:absolute before:inset-0 before:content-[''] focus:outline-none"
				>
					{feedback.title}
				</Link>
				<p className="line-clamp-2 text-body-1 text-brand-grey">
					{feedback.description}
				</p>
			</div>

			{/* Tags */}
			<div className="mt-1 relative z-10">
				{/* z-10 para garantir que se tiver hover na tag no futuro, funcione */}
				<span className="inline-flex items-center rounded-lg bg-brand-light px-4 py-1.5 text-[13px] font-semibold text-brand-blue">
					{categoryLabel}
				</span>
			</div>

			{/* Footer */}
			<div className="mt-2 flex items-center justify-between relative z-10">
				{/* 3. UPVOTE ISOLADO
            Como usamos o Stretched Link, precisamos de `relative z-10` aqui.
            Isso faz o botão "flutuar" acima do link do card, permitindo o clique.
        */}
				<button
					type="button" // Sempre boa prática em React
					onClick={(e) => {
						// O stopPropagation é vital aqui para não abrir o detalhe do feedback
						e.stopPropagation()
						e.preventDefault() // Garante que o link stretched não dispare
						// Lógica de toggle upvote
					}}
					className={cn(
						'flex items-center gap-2.5 rounded-lg px-4 py-1.5 transition-colors cursor-pointer',
						feedback.isUpvoted
							? 'bg-brand-blue text-white'
							: 'bg-brand-light text-brand-dark hover:bg-[#CFD7FF]',
					)}
				>
					<ChevronUp
						className={cn(
							'h-3 w-3 stroke-[3px]',
							feedback.isUpvoted ? 'text-white' : 'text-brand-blue',
						)}
					/>
					<span className="text-body-3 font-bold">{feedback.upvotesCount}</span>
				</button>

				<div className="flex items-center gap-2 text-brand-dark">
					<MessageSquare className="h-5 w-5 fill-[#CDD2EE] text-transparent" />
					<span
						className={cn(
							'text-body-3 font-bold',
							commentsCount === 0 ? 'opacity-50' : 'opacity-100',
						)}
					>
						{commentsCount}
					</span>
				</div>
			</div>
		</motion.div>
	)
}
