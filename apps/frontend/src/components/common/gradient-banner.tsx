import React, { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface GradientBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
	children: ReactNode
	className?: string
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
	children,
	className,
	...props
}) => {
	return (
		<div
			className={cn(
				'relative w-full overflow-hidden isolate',
				/* 1. Usamos as variáveis definidas no tema.
           2. Mantemos o ângulo arbitrário (108deg) pois o Tailwind não tem utilitário padrão para 108 graus.
        */
				'bg-[linear-gradient(108deg,var(--color-gradient-start)_0%,var(--color-gradient-mid)_47%,var(--color-gradient-end)_100%)]',

				className,
			)}
			{...props}
		>
			{/* --- Efeitos de Luz (Glows) --- */}

			{/* Glow Superior Esquerdo */}
			<div
				aria-hidden="true"
				className={cn(
					'absolute -top-10 -left-10 w-10 h-10 rounded-full',
					'blur-[45px] opacity-60 pointer-events-none mix-blend-screen',
					// Cor vinda do tema
					'bg-glow-blue',
				)}
			/>

			{/* Glow Superior Direito */}
			<div
				aria-hidden="true"
				className={cn(
					'absolute -top-10 -right-10 w-10 h-10 rounded-full',
					'blur-[45px] opacity-60 pointer-events-none mix-blend-screen',
					// Cor vinda do tema
					'bg-glow-orange',
				)}
			/>

			{/* Conteúdo */}
			<div className="relative z-10 w-full h-full">{children}</div>
		</div>
	)
}
