import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, type Variants } from 'motion/react'
import { ChevronLeft, Plus } from 'lucide-react' // Ícone de voltar

import { useAppMetadata } from '@/modules/feedback/hooks/use-app-metadata'
import { useCreateFeedback } from '@/modules/feedback/hooks/use-create-feedback'
import {
	createFeedbackSchema,
	type CreateFeedbackPayload,
} from '@/modules/feedback/types/feedback.schema'

import { Button } from '@/components/ui/button'
import { FormField } from '@/components/common/form-field'

import { FormSelect } from '@/components/common/form-select'
import { SelectItem } from '@/components/ui/select'
import { FormTextarea } from '@/components/common/form-textarea'
import { GradientBackground } from '@/components/common/gradient-banner'

export const Route = createFileRoute('/_authenticated/feedbacks/new/')({
	component: CreateFeedbackPage,
})

// --- Animações ---
const containerVariants: Variants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { staggerChildren: 0.1 },
	},
}

const itemVariants: Variants = {
	hidden: { opacity: 0, y: 10 },
	visible: { opacity: 1, y: 0 },
}

export function CreateFeedbackPage() {
	const navigate = useNavigate()

	// 1. Carrega Categorias do Sistema
	const { data: metadata } = useAppMetadata()

	// 2. Hook de Mutação
	const { mutate: createFeedback, isPending } = useCreateFeedback()

	// 3. Formulário
	const {
		control,
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<CreateFeedbackPayload>({
		resolver: zodResolver(createFeedbackSchema),
	})

	const onSubmit = (data: CreateFeedbackPayload) => {
		createFeedback(data)
	}

	return (
		<div className="min-h-screen bg-brand-lighter flex justify-center p-6 md:py-20">
			<div className="w-full max-w-[540px] flex flex-col gap-y-16">
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
				>
					<Button
						variant="ghost"
						onClick={() => navigate({ to: '..' })}
						className="pl-0 hover:bg-transparent text-brand-grey hover:underline font-bold"
					>
						<ChevronLeft className="w-4 h-4 mr-2 text-brand-blue" />
						Go Back
					</Button>
				</motion.div>

				<motion.div
					variants={containerVariants}
					initial="hidden"
					animate="visible"
					className="bg-white flex flex-col gap-y-10 rounded-lg pt-11 px-6 pb-6 md:pt-14 md:px-10 relative shadow-sm"
				>
					<GradientBackground className="absolute -top-7 left-10 w-14 h-14 rounded-full">
						<div className="w-full h-full flex justify-center items-center">
							<Plus className="w-6 h-6 text-white" strokeWidth={3} />
						</div>
					</GradientBackground>

					<h1 className="text-h1 text-brand-dark">
						Create New Feedback
					</h1>

					<form
						onSubmit={handleSubmit(onSubmit)}
						className="flex flex-col gap-6"
					>
						{/* 1. Title */}
						<motion.div variants={itemVariants}>
							<FormField
								id="title"
								label="Feedback Title"
								description="Add a short, descriptive headline"
								placeholder="e.g. Add dark mode"
								registration={register('title')}
								error={errors.title?.message}
							/>
						</motion.div>

						{/* 2. Category (Dinâmico do Metadata) */}
						<motion.div variants={itemVariants}>
							<FormSelect
								control={control} // Passa o controle
								name="categorySlug" // Nome do campo no schema Zod
								label="Category"
								placeholder="Choose a category"
								description="Choose a category for your feedback"
								error={errors.categorySlug?.message}
							>
								{/* Renderiza as opções usando o SelectItem do seu componente */}
								{metadata?.feedback?.categories
									.sort((a, b) => a.label.localeCompare(b.label))
									.map((category) => (
										<SelectItem key={category.slug} value={category.slug}>
											{category.label}
										</SelectItem>
									))}
							</FormSelect>
						</motion.div>

						{/* 3. Description (Textarea) */}
						<motion.div variants={itemVariants}>
							<FormTextarea
								id="description"
								label="Feedback Detail"
								description="Include any specific comments on what should be improved, added, etc."
								registration={register('description')}
								error={errors.description?.message}
							/>
						</motion.div>

						{/* Actions */}
						<motion.div
							variants={itemVariants}
							className="flex flex-col-reverse md:flex-row justify-end gap-4 mt-4"
						>
							<Button
								type="button"
								variant="destructive" // Usar uma cor escura/cancelar
								className="bg-brand-dark hover:bg-brand-dark/80 text-white"
								onClick={() => navigate({ to: '..' })}
							>
								Cancel
							</Button>

							<Button
								type="submit"
								className="bg-brand-purple hover:bg-brand-purple/80 text-white min-w-[144px]"
								disabled={isPending}
							>
								{isPending ? 'Adding...' : 'Add Feedback'}
							</Button>
						</motion.div>
					</form>
				</motion.div>
			</div>
		</div>
	)
}
