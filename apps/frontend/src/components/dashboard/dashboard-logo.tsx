import { cn } from '@/lib/utils'
import { GradientBackground } from '../common/gradient-banner'

interface DashboardLogoProps {
	className?: string
}

export function DashboardLogo({ className }: Readonly<DashboardLogoProps>) {
	return (
		<GradientBackground
			className={cn(
				// Altura mínima para Desktop/Tablet para garantir o aspecto do card
				'min-h-[137px] w-full rounded-lg md:h-[178px]',
				className,
			)}
		>
			<div className="flex h-full w-full flex-col items-start justify-end p-6">
				<h1 className="text-h2 font-bold text-primary-foreground sm:text-h1">
					Frontend Mentor
				</h1>
				<p className="text-body-2 font-medium text-primary-foreground/75">
					Feedback Board
				</p>
			</div>
		</GradientBackground>
	)
}
