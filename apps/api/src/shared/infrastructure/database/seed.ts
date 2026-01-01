import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { faker } from '@faker-js/faker' // Importando o Faker
import * as schema from './schema'
import { sql } from 'drizzle-orm'

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
})

const db = drizzle(pool, { schema })

async function seed() {
	console.log('🌱 Starting Seed with Faker...')

	// --- 1. Garantir Categorias e Status (Dados Fixos) ---

	// Listas auxiliares para o Faker escolher aleatoriamente depois
	const categorySlugs = ['ui', 'ux', 'enhancement', 'bug', 'feature']
	const statusSlugs = ['suggestion', 'planned', 'in-progress', 'live']

	await db
		.insert(schema.feedbackCategories)
		.values([
			{ slug: 'ui', label: 'UI', order: 1 },
			{ slug: 'ux', label: 'UX', order: 2 },
			{ slug: 'enhancement', label: 'Enhancement', order: 3 },
			{ slug: 'bug', label: 'Bug', order: 4 },
			{ slug: 'feature', label: 'Feature', order: 5 },
		])
		.onConflictDoUpdate({
			target: schema.feedbackCategories.slug,
			set: { order: sql`excluded.order` },
		})

	await db
		.insert(schema.feedbackStatuses)
		.values([
			{
				slug: 'suggestion',
				label: 'Suggestion',
				hexColor: '#AD1FEA',
				order: 0,
				includeInRoadmap: false,
			},
			{
				slug: 'planned',
				label: 'Planned',
				hexColor: '#F49F85',
				order: 1,
				includeInRoadmap: true,
			},
			{
				slug: 'in-progress',
				label: 'In-Progress',
				hexColor: '#AD1FEA',
				order: 2,
				includeInRoadmap: true,
			},
			{
				slug: 'live',
				label: 'Live',
				hexColor: '#62BCFA',
				order: 3,
				includeInRoadmap: true,
			},
		])
		.onConflictDoNothing()

	// --- 2. Gerar Feedbacks Dinâmicos com Faker ---

	const feedbacksToInsert: (typeof schema.feedbacks.$inferInsert)[] = []

	// Vamos gerar 50 itens
	const AMOUNT_TO_GENERATE = 50

	for (let i = 0; i < AMOUNT_TO_GENERATE; i++) {
		// Gera uma data de criação no passado (últimos 6 meses)
		const createdAt = faker.date.past({ years: 0.5 })

		// A data de atualização deve ser entre a criação e agora
		const updatedAt = faker.date.between({ from: createdAt, to: new Date() })

		feedbacksToInsert.push({
			// Gera um título estilo frase, sem o ponto final
			title: faker.lorem.sentence({ min: 3, max: 7 }).replace('.', ''),

			// Gera descrições mais ricas
			description: faker.lorem.paragraph({ min: 1, max: 3 }),

			// Escolhe aleatoriamente uma das categorias existentes
			categorySlug: faker.helpers.arrayElement(categorySlugs),

			// Escolhe aleatoriamente um status
			// Dica: Se quiser que a maioria seja 'suggestion', podemos usar faker.helpers.weightedArrayElement (se precisar de lógica complexa)
			// Por enquanto, aleatório simples:
			statusSlug: faker.helpers.arrayElement(statusSlugs),

			// Upvotes aleatórios entre 0 e 150
			upvotesCount: faker.number.int({ min: 0, max: 150 }),

			// IMPORTANTE: Assumindo que o author_id 1 existe.
			// Se você tiver seeded users, pode fazer: faker.number.int({ min: 1, max: 5 })
			authorId: faker.number.int({ min: 1, max: 2 }),

			createdAt: createdAt,
			updatedAt: updatedAt,
			enabled: true,
		})
	}

	// --- 3. Inserção em Massa ---
	console.log(`⏳ Inserting ${AMOUNT_TO_GENERATE} feedbacks...`)

	await db.insert(schema.feedbacks).values(feedbacksToInsert)

	console.log('✅ Seed Finished!')
	await pool.end()
}

seed().catch((err) => {
	console.error('❌ Seed Error:', err)
	process.exit(1)
})
