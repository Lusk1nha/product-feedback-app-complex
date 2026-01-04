import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Link } from '@tanstack/react-router'

interface AddFeedbackRedirectButtonProps extends React.ComponentProps<'button'> {
	className?: string
}

export function AddFeedbackRedirectButton({
	className,
	...props
}: Readonly<AddFeedbackRedirectButtonProps>) {
	return (
		<Link to="/feedbacks/new">
			<Button
				type="button"
				className={cn(
					'text-h4 font-bold h-10 bg-brand-purple hover:bg-brand-purple/80 text-white md:h-11',
					className,
				)}
				{...props}
			>
				+ Add Feedback
			</Button>
		</Link>
	)
}
