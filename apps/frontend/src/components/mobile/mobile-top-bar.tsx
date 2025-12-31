import { Menu, X } from 'lucide-react'
import { Button } from '../ui/button'
import { GradientBackground } from '../common/gradient-banner'

interface MobileTopBarProps {
	isSidebarOpen: boolean
	onToggleSidebar: () => void
}

export function MobileTopBar({
	isSidebarOpen,
	onToggleSidebar,
}: Readonly<MobileTopBarProps>) {
	return (
		<GradientBackground
			// 👇 ADICIONADO: relative e z-50 para ficar ACIMA da sidebar
			className="relative z-50"
		>
			{/* Nota: h-18 é 4.5rem (72px). 
         Se o Tailwind não reconhecer h-18 nativamente, use h-[72px] ou adicione no theme.
      */}
			<div className="h-18 flex items-center justify-between px-6">
				<div className="container">
					<h1 className="text-primary-foreground text-body-2 font-bold">
						Frontend Mentor
					</h1>
					<p className="text-primary-foreground/75 text-body-3 font-medium">
						Feedback Board
					</p>
				</div>

				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
					onClick={onToggleSidebar}
				>
					{isSidebarOpen ? (
						<X className="size-6" aria-label="Close sidebar" strokeWidth={3} />
					) : (
						<Menu
							className="size-6"
							aria-label="Open sidebar"
							strokeWidth={3}
						/>
					)}
				</Button>
			</div>
		</GradientBackground>
	)
}
