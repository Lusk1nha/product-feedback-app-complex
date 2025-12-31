import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence, type Variants } from 'motion/react'
import { Link } from '@tanstack/react-router'

import { useAuth } from '@/modules/iam/hooks/use-auth'
import { loginSchema, type LoginDto } from '@/modules/iam/types/auth.schemas'
import { AppError } from '@/lib/app-error'

// Componentes UI
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/common/form-field'

// --- Animation Config ---
const containerVariants: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			delayChildren: 0.1,
			staggerChildren: 0.1,
		},
	},
}

const itemVariants: Variants = {
	hidden: { y: 20, opacity: 0, filter: 'blur(5px)' },
	visible: {
		y: 0,
		opacity: 1,
		filter: 'blur(0px)',
		transition: { type: 'spring', bounce: 0.4, duration: 0.8 },
	},
}

export function LoginForm() {
	const navigate = useNavigate()
	const { login } = useAuth()

	const form = useForm<LoginDto>({
		defaultValues: {
			email: 'john@example.com',
			password: 'StrongP@ssword123',
		},
		resolver: zodResolver(loginSchema),
	})

	const {
		register,
		handleSubmit,
		setError,
		formState: { errors },
	} = form

	const onSubmit = (data: LoginDto) => {
		login.mutate(data, {
			onSuccess: () => {
				// Redireciona para o Dashboard com os params padrão
				navigate({
					to: '/dashboard',
					replace: true,
					search: {
						sort: 'most_upvotes',
						category: 'all',
					},
				})
			},
			onError: (error) => {
				if (error instanceof AppError) {
					setError('root', { message: error.message })
				} else {
					setError('root', {
						message: 'Unexpected error occurred. Please try again.',
					})
				}
			},
		})
	}

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-brand-lighter p-4 relative overflow-hidden">
			{/* Background Decorativo */}
			<motion.div
				animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
				transition={{ duration: 8, repeat: Infinity }}
				className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-purple/10 rounded-full blur-3xl pointer-events-none"
			/>
			<motion.div
				animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
				transition={{ duration: 10, repeat: Infinity, delay: 1 }}
				className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-blue/10 rounded-full blur-3xl pointer-events-none"
			/>

			{/* Card Principal */}
			<motion.div
				variants={containerVariants}
				initial="hidden"
				animate="visible"
				className="w-full max-w-md bg-white rounded-2xl p-8 shadow-xl border border-white/50 relative z-10 backdrop-blur-sm"
			>
				{/* Header */}
				<div className="text-center mb-8">
					<motion.div
						variants={itemVariants}
						className="w-14 h-14 bg-linear-to-tr from-brand-purple to-brand-blue rounded-xl mx-auto mb-5 flex items-center justify-center shadow-lg shadow-brand-purple/20"
						whileHover={{ rotate: 10, scale: 1.1 }}
						transition={{ type: 'spring', stiffness: 300 }}
					>
						<div className="w-6 h-6 bg-white/20 rounded-full" />
					</motion.div>

					<motion.h1
						variants={itemVariants}
						className="text-h1 text-brand-dark mb-2"
					>
						Welcome back!
					</motion.h1>
					<motion.p
						variants={itemVariants}
						className="text-body-1 text-brand-grey"
					>
						Access your account to give feedbacks
					</motion.p>
				</div>

				{/* Formulário */}
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
					<motion.div variants={itemVariants}>
						<FormField
							id="email"
							label="E-mail"
							type="email"
							placeholder="john.doe@example.com"
							registration={register('email')}
							error={errors.email?.message}
						/>
					</motion.div>

					<motion.div variants={itemVariants}>
						<FormField
							id="password"
							label="Password"
							type="password"
							placeholder="••••••••"
							registration={register('password')}
							error={errors.password?.message}
						/>
					</motion.div>

					{/* Área de Erro (Shake Animation) */}
					<AnimatePresence mode="wait">
						{errors.root && (
							<motion.div
								initial={{ opacity: 0, height: 0, scale: 0.95 }}
								animate={{
									opacity: 1,
									height: 'auto',
									scale: 1,
									x: [0, -5, 5, -5, 5, 0], // Shake
								}}
								exit={{ opacity: 0, height: 0, scale: 0.95 }}
								transition={{ duration: 0.3 }}
								className="overflow-hidden"
							>
								<div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center font-bold border border-destructive/20">
									{errors.root.message}
								</div>
							</motion.div>
						)}
					</AnimatePresence>

					<motion.div variants={itemVariants}>
						<Button
							asChild
							className="w-full shadow-lg shadow-brand-purple/20"
							disabled={login.isPending}
						>
							<motion.button
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.95 }}
								transition={{ type: 'spring', stiffness: 400, damping: 10 }}
							>
								{login.isPending ? (
									<span className="flex items-center gap-2">
										<span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
										Logging in...
									</span>
								) : (
									'Login'
								)}
							</motion.button>
						</Button>
					</motion.div>
				</form>

				{/* Footer */}
				<motion.div
					variants={itemVariants}
					className="mt-8 text-center text-body-2 text-brand-grey"
				>
					Don't have an account?{' '}
					<Link
						to="/register"
						className="text-brand-blue font-bold hover:underline decoration-2 underline-offset-4 transition-all"
					>
						Register
					</Link>
				</motion.div>
			</motion.div>
		</div>
	)
}
