import { cn } from '@/lib/utils'
import { Skeleton } from '../ui/skeleton'
import { useRoadmapItems } from '@/modules/feedback/hooks/use-roadmap-items'

interface RoadmapCardProps {
	className?: string
}

export function RoadmapCard(props: Readonly<RoadmapCardProps>) {
	const { className } = props
	const { items, isLoading } = useRoadmapItems()

	if (isLoading) {
		return (
			<RoadmapCardWrapper>
				{Array.from({ length: 3 }).map((_, index) => (
					<RoadmapSkeleton key={index} />
				))}
			</RoadmapCardWrapper>
		)
	}

	if (items?.length === 0) {
		return (
			<RoadmapCardWrapper className={className}>
				<li>
					<p className="text-body-1 font-normal text-brand-dark-gray">
						No items found
					</p>
				</li>
			</RoadmapCardWrapper>
		)
	}

	return (
		<RoadmapCardWrapper className={className}>
			{items?.map((item) => (
				<li key={item.slug}>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-x-4">
							<div
								className={cn('w-2 h-2 rounded-full')}
								style={{ backgroundColor: item.color }}
							/>
							<p className="text-body-1 font-normal text-brand-dark-gray">
								{item.label}
							</p>
						</div>

						<p className="text-body-1 font-bold text-brand-dark">
							{item.count}
						</p>
					</div>
				</li>
			))}
		</RoadmapCardWrapper>
	)
}

interface RoadmapCardWrapperProps {
	children: React.ReactNode
	className?: string
	title?: string
	actionLink?: {
		href: string
		label: string
	}
}

function RoadmapCardWrapper({
	children,
	className,
	title = 'Roadmap', // Default
	actionLink = { href: '/roadmap', label: 'View' }, // Default
}: Readonly<RoadmapCardWrapperProps>) {
	return (
		<div
			className={cn(
				'bg-white rounded-lg p-6 h-full min-h-[178px] dark:bg-card',
				className,
			)}
		>
			<div className="flex justify-between items-center mb-6">
				<h3 className="text-h3 text-brand-dark">{title}</h3>
				<a
					href={actionLink.href}
					className="text-body-3 text-brand-blue underline font-semibold hover:text-brand-blue/80 transition-colors"
				>
					{actionLink.label}
				</a>
			</div>

			<ul className="flex flex-col gap-y-2">{children}</ul>
		</div>
	)
}

function RoadmapSkeleton() {
	return (
		<li>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-x-4 w-full">
					<Skeleton className="h-2 w-2 rounded-full shrink-0" />
					<Skeleton className="h-6 w-24" /> {/* Label */}
				</div>
				<Skeleton className="h-6 w-4 shrink-0" /> {/* Count */}
			</div>
		</li>
	)
}
