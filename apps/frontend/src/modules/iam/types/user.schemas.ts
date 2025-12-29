import { z } from 'zod'

// --- Enums & Constantes ---
// Definimos os papéis possíveis. Se houver mais, adicione aqui.
export const RoleEnum = z.enum(['USER', 'ADMIN'])

// Definimos os Subjects possíveis para o CASL/Permissões
export const SubjectEnum = z.enum(['all', 'User', 'Feedback'])

// --- Schemas ---

export const userSchema = z.object({
	id: z.number(),
	username: z.string(),
	email: z.email('Invalid email'), // z.string().email() é o correto
	fullName: z.string(),
	avatarUrl: z.url().nullable().optional(), // Valida se é URL se não for null
	role: RoleEnum, // Adicionado conforme o JSON real

	// Validamos se é uma string de data ISO válida
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
})

export const ruleSchema = z.object({
	action: z.string(), // ex: 'read', 'update', 'delete', 'manage'
	subject: SubjectEnum,

	// CORREÇÃO CRÍTICA:
	// 1. Mudou de 'condition' para 'conditions' (conforme o JSON)
	// 2. É .optional() porque a regra "read all" não tem condições
	// 3. É z.record(z.any()) pois é um objeto dinâmico { "id": 1, "authorId": 1 }
	conditions: z.record(z.string(), z.any()).optional(),
})

export const meResponseSchema = z.object({
	user: userSchema,
	rules: z.array(ruleSchema),
})

// --- Tipos Inferidos ---
export type User = z.infer<typeof userSchema>
export type UserRole = z.infer<typeof RoleEnum>
export type Rule = z.infer<typeof ruleSchema>
export type MeResponse = z.infer<typeof meResponseSchema>
