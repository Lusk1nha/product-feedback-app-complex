import { motion, type Variants, type HTMLMotionProps } from 'motion/react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface PageShellProps extends HTMLMotionProps<'div'> {
	children: ReactNode
	className?: string
}

// Centralizamos as variantes aqui
export const pageContainerVariants: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
		},
	},
}

export const pageItemVariants: Variants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.5, ease: 'easeOut' },
	},
}

export function PageShell({ children, className, ...props }: PageShellProps) {
	return (
		<motion.div
			initial="hidden"
			animate="visible"
			variants={pageContainerVariants}
			className={cn(
				'flex flex-col relative min-h-screen bg-background',
				className,
			)}
			{...props}
		>
			{children}
		</motion.div>
	)
}
