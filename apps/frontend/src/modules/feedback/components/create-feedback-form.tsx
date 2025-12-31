import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, type Variants } from 'motion/react'
import { ChevronLeft, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { FormField } from '@/components/common/form-field'
import { FormSelect } from '@/components/common/form-select'
import { SelectItem } from '@/components/ui/select'
import { FormTextarea } from '@/components/common/form-textarea'
import { GradientBackground } from '@/components/common/gradient-banner'

import { useCreateFeedback } from '@/modules/feedback/hooks/use-create-feedback'
import {
	createFeedbackSchema,
	type CreateFeedbackPayload,
	type MetadataResponse,
} from '@/modules/feedback/types/feedback.schema'

interface CreateFeedbackFormProps {
	metadata: MetadataResponse
}

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

export function CreateFeedbackForm({ metadata }: CreateFeedbackFormProps) {
	const navigate = useNavigate()
	const { mutate: createFeedback, isPending } = useCreateFeedback()

	const {
		control,
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<CreateFeedbackPayload>({
		resolver: zodResolver(createFeedbackSchema),
		defaultValues: {
			categorySlug: metadata.feedback.categories[0]?.slug || 'feature', // Default inteligente
		},
	})

	const onSubmit = (data: CreateFeedbackPayload) => {
		createFeedback(data)
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
						<Plus className="w-6 h-6 text-white" strokeWidth={3} />
					</div>
				</GradientBackground>

				<h1 className="text-h1 text-brand-dark">Create New Feedback</h1>

				<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
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

					<motion.div variants={itemVariants}>
						<FormTextarea
							id="description"
							label="Feedback Detail"
							description="Include any specific comments on what should be improved, added, etc."
							registration={register('description')}
							error={errors.description?.message}
						/>
					</motion.div>

					<motion.div
						variants={itemVariants}
						className="flex flex-col-reverse md:flex-row justify-end gap-4 mt-4"
					>
						<Button
							type="button"
							variant="destructive"
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
	)
}
