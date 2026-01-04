import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import { useNavigate, type LinkProps } from '@tanstack/react-router'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const goBackButtonVariants = cva('has-[>svg]:px-0  font-bold', {
	variants: {
		variant: {
			default:
				'text-brand-grey hover:underline [&>svg]:text-brand-blue hover:bg-transparent',
			white:
				'text-white hover:underline [&>svg]:text-white hover:bg-transparent hover:text-white',
		},
	},
	defaultVariants: {
		variant: 'default',
	},
})

interface GoBackButtonProps extends VariantProps<typeof goBackButtonVariants> {
	to: LinkProps['to']
	params?: LinkProps['params']
	search?: LinkProps['search']

	className?: string
}

export function GoBackButton({
	to,
	params,
	search,
	variant = 'default',
	className,
}: Readonly<GoBackButtonProps>) {
	const navigate = useNavigate()

	return (
		<Button
			variant="ghost"
			onClick={() => navigate({ to, params, search })}
			className={cn(goBackButtonVariants({ variant }), className)}
		>
			<ChevronLeft className="w-4 h-4 mr-2" />
			Go Back
		</Button>
	)
}
