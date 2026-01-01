import * as React from 'react'

import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
	"cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-bold transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
	{
		variants: {
			variant: {
				// Figma: Button 1 (Roxo) - Pega a cor --primary do CSS
				default: 'bg-primary text-primary-foreground hover:bg-primary/90',

				// Figma: Button 2 (Azul) - Pega a cor --secondary do CSS
				secondary:
					'bg-secondary text-secondary-foreground hover:bg-secondary/80',

				// Figma: Button 3 (Navy) - Novo variante customizado
				dark: 'bg-brand-dark text-white hover:bg-brand-dark/90 focus-visible:ring-brand-dark/20',

				destructive:
					'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',

				outline:
					'border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground',

				ghost:
					'text-brand-grey hover:bg-brand-light hover:text-brand-dark hover:underline',

				link: 'text-brand-blue underline-offset-4 hover:underline',
			},
			size: {
				default: 'h-10 px-6 py-2 has-[>svg]:px-4', // Altura do Figma
				sm: 'h-9 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
				lg: 'h-11 rounded-md px-8 has-[>svg]:px-6',
				icon: 'size-10',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
)

function Button({
	className,
	variant = 'default',
	size = 'default',
	asChild = false,
	...props
}: React.ComponentProps<'button'> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean
	}) {
	const Comp = asChild ? Slot : 'button'

	return (
		<Comp
			data-slot="button"
			data-variant={variant}
			data-size={size}
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	)
}

export { Button, buttonVariants }
