import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'motion/react'
import { useEffect } from 'react'

interface MobileSidebarProps {
	isOpen: boolean
	onClose: () => void
	children?: React.ReactNode // Para colocar o conteúdo depois
}

export function MobileSidebar({
	isOpen,
	onClose,
	children,
}: Readonly<MobileSidebarProps>) {
	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth >= 640 && isOpen) {
				onClose()
			}
		}
		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [isOpen, onClose])

	const topBarHeightClass = 'top-[4.5rem]'

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					{/* --- OVERLAY (Fundo Escuro) --- */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
						className={cn(
							'fixed inset-0',
							topBarHeightClass,
							'z-40 bg-black/50 sm:hidden',
						)}
						aria-hidden="true"
					/>

					{/* --- SIDEBAR PANEL (70% width, Direita) --- */}
					<motion.aside
						initial={{ x: '100%' }} // Começa fora da tela (direita)
						animate={{ x: 0 }} // Entra na tela
						exit={{ x: '100%' }} // Sai para a direita
						transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
						className={cn(
							'fixed right-0 bottom-0',
							topBarHeightClass,
							'z-50 w-[72.5%] bg-background p-6 shadow-xl sm:hidden',
						)}
					>
						<div className="flex flex-col gap-4">
							{/* Aqui virá o conteúdo (Filtros, Roadmap, Login, etc) */}
							{children || (
								<div className="flex flex-col gap-4">
									{/* Exemplo de conteúdo placeholder */}
									<div className="bg-card p-4 rounded-lg">
										<p className="text-body-1 font-bold">Conteúdo da Sidebar</p>
										<p className="text-body-3 text-muted-foreground mt-2">
											Coloque seus filtros de tags e roadmap aqui.
										</p>
									</div>
								</div>
							)}
						</div>
					</motion.aside>
				</>
			)}
		</AnimatePresence>
	)
}
