import React from 'react'
import {
	Controller,
	type Control,
	type FieldValues,
	type Path,
} from 'react-hook-form'
import {
	Select,
	SelectContent,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select' // Ajuste o caminho conforme sua estrutura
import { cn } from '@/lib/utils'

interface FormSelectProps<T extends FieldValues> {
	label: string
	name: Path<T> // Garante tipagem correta do nome do campo
	control: Control<T> // Necessário para componentes controlados (Radix UI)
	children: React.ReactNode // Aqui entrarão os <SelectItem>
	placeholder?: string
	description?: string
	error?: string
	className?: string
	id?: string
}

export function FormSelect<T extends FieldValues>({
	label,
	name,
	control,
	children,
	placeholder,
	description,
	error,
	className,
	id,
}: FormSelectProps<T>) {
	// ID único para acessibilidade
	const selectId = id || name

	return (
		<Controller
			control={control}
			name={name}
			render={({ field }) => (
				<div className={cn('space-y-2', className)}>
					{/* Header (Label + Error) - Idêntico ao FormField */}
					<div className="flex justify-between items-center">
						<label
							htmlFor={selectId}
							className="text-[13px] font-bold text-brand-dark tracking-[-0.18px] cursor-pointer"
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

					{description && (
						<p className="text-[13px] font-normal text-brand-grey mb-4 leading-[19px]">
							{description}
						</p>
					)}

					{/* Componente Select do Radix */}
					<Select
						onValueChange={field.onChange} // Conecta ao React Hook Form
						value={field.value}
					>
						<SelectTrigger
							id={selectId}
							aria-invalid={!!error}
							className={cn(
								'w-full',
								// ESTILO DO FIGMA 👇
								'h-[48px] rounded-[5px]',
								'bg-brand-lighter text-brand-dark',
								'border-none',

								// Focus e Erro
								'focus:ring-1 focus:ring-brand-blue',
								'aria-invalid:ring-1 aria-invalid:ring-destructive',
							)}
						>
							<SelectValue placeholder={placeholder} />
						</SelectTrigger>

						<SelectContent className="border-none">{children}</SelectContent>
					</Select>
				</div>
			)}
		/>
	)
}
