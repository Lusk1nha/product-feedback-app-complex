import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'motion/react'
import { useEffect } from 'react'
import { FeedbackCategorySearchSelector } from '../common/feedback-category-search-selector'

interface MobileSidebarProps {
	isOpen: boolean
	onClose: () => void
}

export function MobileSidebar({
	isOpen,
	onClose,
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
							<FeedbackCategorySearchSelector />
						</div>
					</motion.aside>
				</>
			)}
		</AnimatePresence>
	)
}
