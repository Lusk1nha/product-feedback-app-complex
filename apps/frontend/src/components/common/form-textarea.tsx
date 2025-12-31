import React from 'react'
import { type UseFormRegisterReturn } from 'react-hook-form'
import { Textarea } from '@/components/ui/textarea' // Ajuste o caminho se necessário
import { cn } from '@/lib/utils'

interface FormTextareaProps extends React.ComponentProps<'textarea'> {
	label: string
	registration: UseFormRegisterReturn
	error?: string
	description?: string
}

export function FormTextarea({
	id,
	label,
	registration,
	error,
	className,
	description,
	...props
}: FormTextareaProps) {
	// Garante um ID único se não for passado, para acessibilidade do label
	const textareaId = id || registration.name

	return (
		<div className={cn('space-y-2', className)}>
			<div className="flex justify-between items-center">
				<label
					htmlFor={textareaId}
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

			<Textarea
				id={textareaId}
				// 👇 Conecta o aria-invalid para ativar a borda vermelha definida no seu componente Textarea
				aria-invalid={!!error}
				// 👇 Conecta o React Hook Form (onChange, onBlur, ref)
				className={cn(
					// 2. Comportamento
					'resize-none', // Opcional: Impede o usuário de quebrar o layout redimensionando

					// 3. ESTILO DO FIGMA (O DNA Visual)
					'min-h-[120px]', // Altura inicial do Figma
					'rounded-[5px]',
					'bg-[#F7F8FD] text-brand-dark',
					'border-none',

					// 4. Placeholder
					'placeholder:text-brand-dark/50',

					// 5. Estados Interativos (Focus e Erro)
					'focus:ring-1 focus:ring-brand-blue',
					'aria-invalid:ring-1 aria-invalid:ring-destructive',
				)}
				{...registration}
				{...props}
			/>
		</div>
	)
}
