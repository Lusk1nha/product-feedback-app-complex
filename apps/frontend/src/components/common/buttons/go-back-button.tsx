import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import { useNavigate, type LinkProps } from '@tanstack/react-router'

interface GoBackButtonProps {
	to: LinkProps['to']
	params?: LinkProps['params']
	search?: LinkProps['search']
}

export function GoBackButton({
	to,
	params,
	search,
}: Readonly<GoBackButtonProps>) {
	const navigate = useNavigate()

	return (
		<Button
			variant="ghost"
			onClick={() => navigate({ to, params, search })}
			className="has-[>svg]:px-0 hover:bg-transparent text-brand-grey hover:underline font-bold"
		>
			<ChevronLeft className="w-4 h-4 mr-2 text-brand-blue" />
			Go Back
		</Button>
	)
}
