import * as React from 'react'
import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
	return (
		<input
			type={type}
			data-slot="input"
			className={cn(
				// Base styles
				'flex h-12 w-full min-w-0 rounded-lg border border-transparent bg-brand-light px-3 py-2 text-body-2 text-brand-dark shadow-xs transition-[color,box-shadow,border-color] outline-none',

				// Placeholder & File
				'placeholder:text-brand-grey/50 file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium',

				// Disabled
				'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',

				// Focus State (Borda Azul + Ring Roxo suave)
				'focus-visible:border-brand-blue focus-visible:ring-1 focus-visible:ring-brand-blue',

				// Error State (Aria Invalid) - Vermelho
				'aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-invalid:focus-visible:ring-destructive/20',

				className,
			)}
			{...props}
		/>
	)
}

export { Input }
