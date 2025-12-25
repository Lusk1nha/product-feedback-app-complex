import {
	createFileRoute,
	Link,
	redirect,
	useNavigate,
} from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence, type Variants } from 'motion/react'
import { useAuth } from '@/modules/iam/hooks/use-auth'
import {
	registerSchema,
	type RegisterDto,
} from '@/modules/iam/types/auth.schemas'

// Componentes UI
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/common/form-field'
import { AppError } from '@/lib/app-error'
import { useAuthContext } from '@/modules/iam/contexts/auth-context'
import { useEffect } from 'react'

export const Route = createFileRoute('/register')({
	beforeLoad: ({ context }) => {
		if (!context.auth.isLoading && context.auth.isAuthenticated) {
			throw redirect({ to: '/' })
		}
	},

	component: RegisterPage,
})

// --- Animation Config (Reutilizando para consistência) ---
const containerVariants: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			delayChildren: 0.1,
			staggerChildren: 0.08, // Levemente mais rápido pois tem mais itens
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

export function RegisterPage() {
	const { isLoading, isAuthenticated } = useAuthContext()
	const navigate = useNavigate()

	const { register: registerMutation } = useAuth()

	useEffect(() => {
		if (!isLoading && isAuthenticated) {
			navigate({ to: '/', replace: true })
		}
	}, [isLoading, isAuthenticated, navigate])

	const form = useForm<RegisterDto>({
		resolver: zodResolver(registerSchema),
	})

	if (isLoading || isAuthenticated) {
		return (
			<div className="flex h-screen items-center justify-center bg-brand-lighter">
				<motion.div
					animate={{ rotate: 360 }}
					transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
					className="w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full"
				/>
			</div>
		)
	}

	const {
		register,
		handleSubmit,
		setError,
		formState: { errors },
	} = form

	const onSubmit = (data: RegisterDto) => {
		registerMutation.mutate(data, {
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
			<motion.div
				animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
				transition={{ duration: 12, repeat: Infinity }}
				className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-brand-blue/10 rounded-full blur-3xl pointer-events-none"
			/>
			<motion.div
				animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
				transition={{ duration: 9, repeat: Infinity, delay: 2 }}
				className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-purple/10 rounded-full blur-3xl pointer-events-none"
			/>

			{/* Card Principal */}
			<motion.div
				variants={containerVariants}
				initial="hidden"
				animate="visible"
				className="w-full max-w-md bg-white rounded-2xl p-8 shadow-xl border border-white/50 relative z-10 backdrop-blur-sm my-8"
			>
				{/* Header */}
				<div className="text-center mb-6">
					<motion.div
						variants={itemVariants}
						className="w-12 h-12 bg-linear-to-bl from-brand-blue to-brand-purple rounded-xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-brand-blue/20"
						whileHover={{ rotate: -10, scale: 1.1 }}
						transition={{ type: 'spring', stiffness: 300 }}
					>
						{/* Ícone de Cadastro (+ ou user) */}
						<div className="relative w-6 h-6">
							<div className="absolute inset-0 bg-white/20 rounded-full" />
							<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-0.5 bg-white/60 rounded-full" />
							<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-0.5 bg-white/60 rounded-full" />
						</div>
					</motion.div>

					<motion.h1
						variants={itemVariants}
						className="text-h1 text-brand-dark mb-1"
					>
						Create an account
					</motion.h1>
					<motion.p
						variants={itemVariants}
						className="text-body-1 text-brand-grey"
					>
						Start sharing your product feedback
					</motion.p>
				</div>

				{/* Formulário */}
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<motion.div variants={itemVariants}>
						<FormField
							id="fullName"
							label="Full Name"
							type="text"
							placeholder="John Doe"
							registration={register('fullName')}
							error={errors.fullName?.message}
						/>
					</motion.div>

					<motion.div variants={itemVariants}>
						<FormField
							id="username"
							label="Username"
							type="text"
							placeholder="johndoe"
							registration={register('username')}
							error={errors.username?.message}
						/>
						<p className="text-[11px] text-brand-grey mt-1 ml-1">
							Only lowercase letters, numbers, and underscores.
						</p>
					</motion.div>

					<motion.div variants={itemVariants}>
						<FormField
							id="email"
							label="E-mail"
							type="email"
							placeholder="john@example.com"
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
								initial={{ opacity: 0, height: 0 }}
								animate={{
									opacity: 1,
									height: 'auto',
									x: [0, -5, 5, -5, 5, 0], // Shake
								}}
								exit={{ opacity: 0, height: 0 }}
								className="overflow-hidden"
							>
								<div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center font-bold border border-destructive/20 mt-2">
									{errors.root.message}
								</div>
							</motion.div>
						)}
					</AnimatePresence>

					{/* Botão de Submit */}
					<motion.div variants={itemVariants} className="pt-2">
						<Button
							asChild
							className="w-full shadow-lg shadow-brand-blue/20" // Sombra azul para diferenciar do login
							disabled={registerMutation?.isPending}
						>
							<motion.button
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.95 }}
								transition={{ type: 'spring', stiffness: 400, damping: 10 }}
							>
								{registerMutation?.isPending ? (
									<span className="flex items-center gap-2">
										<span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
										Creating account...
									</span>
								) : (
									'Sign Up'
								)}
							</motion.button>
						</Button>
					</motion.div>
				</form>

				{/* Footer */}
				<motion.div
					variants={itemVariants}
					className="mt-6 text-center text-body-2 text-brand-grey"
				>
					Already have an account?{' '}
					<Link
						to="/login"
						className="text-brand-purple font-bold hover:underline decoration-2 underline-offset-4 transition-all"
					>
						Login
					</Link>
				</motion.div>
			</motion.div>
		</div>
	)
}
