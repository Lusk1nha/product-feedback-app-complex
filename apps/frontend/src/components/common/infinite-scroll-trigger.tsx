import { useEffect, useRef } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

interface InfiniteScrollTriggerProps {
	onIntersect: () => void
	hasNextPage: boolean
	isFetchingNextPage: boolean
	className?: string
}

export function InfiniteScrollTrigger({
	onIntersect,
	hasNextPage,
	isFetchingNextPage,
	className,
}: InfiniteScrollTriggerProps) {
	const observerRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const element = observerRef.current
		if (!element) return

		const observer = new IntersectionObserver(
			(entries) => {
				const first = entries[0]
				if (first.isIntersecting && hasNextPage && !isFetchingNextPage) {
					onIntersect()
				}
			},
			{
				threshold: 0,
				rootMargin: '200px',
			},
		)

		observer.observe(element)

		return () => observer.disconnect()
	}, [onIntersect, hasNextPage, isFetchingNextPage])

	return (
		<div
			ref={observerRef}
			className={cn('flex w-full justify-center py-6', className)}
		>
			{isFetchingNextPage ? (
				<Spinner className="h-6 w-6 text-brand-purple" />
			) : hasNextPage ? (
				<div className="h-4 w-full bg-transparent" />
			) : (
				<span className="text-body-3 text-brand-grey/50">
					You reached the end! 🎉
				</span>
			)}
		</div>
	)
}
