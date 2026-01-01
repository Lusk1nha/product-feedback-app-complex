import { motion } from 'motion/react'
import { MessageSquareDashed } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { InfiniteScrollTrigger } from '@/components/common/infinite-scroll-trigger'
import { useInfiniteFeedbacks } from '../hooks/use-infinite-feedbacks'
import { useAppMetadata } from '../hooks/use-app-metadata'
import { FeedbackCard } from './feedback-card'
import type { FeedbackSortValue } from '../types/feedback.sort'
import { useNavigate } from '@tanstack/react-router'

interface ListFeedbackProps {
	category: string
	sort: FeedbackSortValue
}

export function ListFeedback({ category, sort }: Readonly<ListFeedbackProps>) {
	const {
		data,
		isLoading: isFeedbacksLoading,
		isError,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useInfiniteFeedbacks({ category, sort })

	const { data: metadata, isLoading: isMetadataLoading } = useAppMetadata()
	const navigate = useNavigate()

	const isLoading = isFeedbacksLoading || isMetadataLoading

	if (isLoading) return <FeedbackListSkeleton />
	if (isError) return <ErrorState />

	// Verificação de segurança para lista vazia
	const totalItems =
		data?.pages.reduce((acc, page) => acc + page.data.length, 0) || 0
	if (totalItems === 0) return <EmptyState />

	return (
		<div className="flex flex-col gap-4 px-4 pb-10 md:px-0">
			{data?.pages.map((group, i) => (
				// Wrapper simples, sem motion aqui para não bugar o layout
				<div key={i} className="flex flex-col gap-4 md:gap-5">
					{group.data?.map((feedback, index) => (
						<motion.div
							key={feedback.id}
							// Animação individual: O card se resolve sozinho
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{
								duration: 0.3,
								// Pequeno delay baseado no index APENAS visualmente dentro do grupo
								delay: Math.min((index % 10) * 0.05, 0.3),
							}}
						>
							<FeedbackCard
								feedback={feedback}
								categories={metadata?.feedback.categories}
								onClick={() => {
									navigate({ to: `/feedbacks/${feedback.id}` })
								}}
							/>
						</motion.div>
					))}
				</div>
			))}

			{isFetchingNextPage ? (
				<div className="py-4">
					<Skeleton className="h-[150px] w-full rounded-xl" />
				</div>
			) : (
				<InfiniteScrollTrigger
					onIntersect={fetchNextPage}
					hasNextPage={!!hasNextPage}
					isFetchingNextPage={isFetchingNextPage}
				/>
			)}
		</div>
	)
}

// --- Sub-componentes de Estado ---

function EmptyState() {
	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			className="flex flex-1 flex-col items-center justify-center rounded-xl border border-gray-100 bg-white p-10 text-center"
		>
			<div className="mb-4 rounded-full bg-brand-light p-4">
				<MessageSquareDashed className="h-8 w-8 text-brand-grey/50" />
			</div>
			<h3 className="mb-2 text-h3 text-brand-dark">
				Nenhum feedback encontrado
			</h3>
			<p className="max-w-[300px] text-body-1 text-brand-grey">
				Parece que não há nada aqui para essa categoria. Seja o primeiro a
				contribuir!
			</p>
		</motion.div>
	)
}

function ErrorState() {
	return (
		<div className="flex flex-1 items-center justify-center rounded-xl border border-red-100 bg-red-50/50 p-8">
			<p className="font-medium text-destructive">
				Erro ao carregar feedbacks. Tente recarregar a página.
			</p>
		</div>
	)
}

function FeedbackListSkeleton() {
	return (
		<div className="flex flex-col gap-4 px-4 md:px-0">
			{[1, 2, 3].map((i) => (
				<div key={i} className="flex h-[151px] gap-10 rounded-xl bg-white p-8">
					{/* Upvote */}
					<Skeleton className="hidden h-[53px] w-10 rounded-lg md:block" />

					{/* Content */}
					<div className="flex flex-1 flex-col gap-3">
						<Skeleton className="h-7 w-1/3 rounded-md" />
						<Skeleton className="h-5 w-3/4 rounded-md" />
						<Skeleton className="h-5 w-1/2 rounded-md" />
						<Skeleton className="mt-2 h-7 w-20 rounded-lg" />
					</div>
				</div>
			))}
		</div>
	)
}
