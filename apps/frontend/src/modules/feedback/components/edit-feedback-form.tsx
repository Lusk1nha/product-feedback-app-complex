import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, type Variants } from 'motion/react'
import { ChevronLeft, PenLine } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { FormField } from '@/components/common/form-field'
import { FormSelect } from '@/components/common/form-select'
import { SelectItem } from '@/components/ui/select'
import { FormTextarea } from '@/components/common/form-textarea'
import { GradientBackground } from '@/components/common/gradient-banner'

import {
	updateFeedbackSchema,
	type UpdateFeedbackPayload,
	type Feedback,
	type MetadataResponse,
} from '@/modules/feedback/types/feedback.schema'
import { useUpdateFeedback } from '../hooks/use-update-feedback'
import { useDeleteFeedback } from '../hooks/use-delete-feedback'
import { ConfirmDeleteDialog } from '@/components/common/dialogs/confirm-delete-dialog'

interface EditFeedbackFormProps {
	initialData: Feedback
	metadata: MetadataResponse
}

// Variantes de animação
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

export function EditFeedbackForm({
	initialData,
	metadata,
}: EditFeedbackFormProps) {
	const navigate = useNavigate()

	// Mutations
	const { mutate: updateFeedback, isPending: isSaving } = useUpdateFeedback(
		initialData.id,
	)
	const { mutate: deleteFeedback, isPending: isDeleting } = useDeleteFeedback()

	// Configuração do Formulário
	const {
		control,
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<UpdateFeedbackPayload>({
		resolver: zodResolver(updateFeedbackSchema),
		defaultValues: {
			title: initialData.title,
			categorySlug: initialData.categorySlug,
			statusSlug: initialData.statusSlug,
			description: initialData.description,
		},
	})

	const onSubmit = (data: UpdateFeedbackPayload) => {
		updateFeedback(data)
	}

	return (
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
						<PenLine className="w-6 h-6 text-white" strokeWidth={3} />
					</div>
				</GradientBackground>

				<h1 className="text-h1 text-brand-dark">
					Editing ‘{initialData.title}’
				</h1>

				<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
					{/* Title */}
					<motion.div variants={itemVariants}>
						<FormField
							id="title"
							label="Feedback Title"
							description="Add a short, descriptive headline"
							registration={register('title')}
							error={errors.title?.message}
						/>
					</motion.div>

					{/* Category */}
					<motion.div variants={itemVariants}>
						<FormSelect
							control={control}
							name="categorySlug"
							label="Category"
							description="Choose a category for your feedback"
							error={errors.categorySlug?.message}
						>
							{metadata.feedback.categories.map((category) => (
								<SelectItem key={category.slug} value={category.slug}>
									{category.label}
								</SelectItem>
							))}
						</FormSelect>
					</motion.div>

					{/* Status */}
					<motion.div variants={itemVariants}>
						<FormSelect
							control={control}
							name="statusSlug"
							label="Update Status"
							description="Change feature state"
							error={errors.statusSlug?.message}
						>
							{metadata.feedback.statuses.map((status) => (
								<SelectItem key={status.slug} value={status.slug}>
									{status.label}
								</SelectItem>
							))}
						</FormSelect>
					</motion.div>

					{/* Description */}
					<motion.div variants={itemVariants}>
						<FormTextarea
							id="description"
							label="Feedback Detail"
							description="Include any specific comments on what should be improved, added, etc."
							registration={register('description')}
							error={errors.description?.message}
							rows={4}
						/>
					</motion.div>

					{/* Actions */}
					<motion.div
						variants={itemVariants}
						className="flex flex-col md:flex-row justify-between items-center gap-4 mt-4 w-full"
					>
						<ConfirmDeleteDialog
							onConfirm={() => deleteFeedback(initialData.id)}
							disabled={isDeleting}
							title="Delete this feedback?"
							description="This action cannot be undone. This will permanently remove the feedback and all associated data."
							trigger={
								<Button
									type="button"
									variant="destructive"
									disabled={isDeleting}
									className="w-full md:w-auto bg-destructive hover:bg-destructive/80 text-white h-[44px]"
								>
									{isDeleting ? 'Deleting...' : 'Delete'}
								</Button>
							}
						/>

						<div className="flex flex-col-reverse md:flex-row gap-4 w-full md:w-auto">
							<Button
								type="button"
								onClick={() => navigate({ to: '..' })}
								className="bg-brand-dark hover:bg-brand-dark/80 text-white h-[44px] md:min-w-[90px]"
							>
								Cancel
							</Button>

							<Button
								type="submit"
								disabled={isSaving}
								className="bg-brand-purple hover:bg-brand-purple/80 text-white h-[44px] md:min-w-[144px]"
							>
								{isSaving ? 'Saving...' : 'Save Changes'}
							</Button>
						</div>
					</motion.div>
				</form>
			</motion.div>
		</div>
	)
}
