import React from 'react'
import { type UseFormRegisterReturn } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface FormFieldProps extends React.ComponentProps<'input'> {
	label: string
	registration: UseFormRegisterReturn
	error?: string
}

export function FormField({
	label,
	registration,
	error,
	className,
	id,
	...props
}: FormFieldProps) {
	// Garante um ID único se não for passado, para acessibilidade do label
	const inputId = id || registration.name

	return (
		<div className={cn('space-y-2', className)}>
			<div className="flex justify-between items-center">
				<label
					htmlFor={inputId}
					className="text-body-3 font-bold text-brand-dark cursor-pointer"
				>
					{label}
				</label>

				{/* Mensagem de Erro com Animação */}
				{error && (
					<span
						role="alert"
						className="text-xs text-destructive font-medium animate-in fade-in slide-in-from-right-1"
					>
						{error}
					</span>
				)}
			</div>

			<Input
				id={inputId}
				// 👇 AQUI ESTÁ O SEGREDO DO NOVO SHADCN
				aria-invalid={!!error}
				{...registration}
				{...props}
			/>
		</div>
	)
}
