import React from 'react'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface ConfirmDeleteDialogProps {
	/** O botão que abre o modal */
	trigger: React.ReactNode

	/** Função executada ao confirmar */
	onConfirm: () => void

	/** Título do modal (Padrão: Are you sure?) */
	title?: string

	/** Descrição do modal */
	description?: string

	/** Texto do botão de confirmar (Padrão: Delete) */
	confirmText?: string

	/** Desabilita o botão de confirmar (ex: carregando) */
	disabled?: boolean
}

export function ConfirmDeleteDialog({
	trigger,
	onConfirm,
	title = 'Are you sure?',
	description = 'This action cannot be undone. This will permanently delete this item.',
	confirmText = 'Delete',
	disabled,
}: ConfirmDeleteDialogProps) {
	const handleConfirm = (_event: React.MouseEvent) => {
		onConfirm()
	}

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>

					<AlertDialogAction onClick={handleConfirm} disabled={disabled}>
						{confirmText}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
