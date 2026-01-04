import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { faker } from '@faker-js/faker'
import * as schema from './schema'
import { sql } from 'drizzle-orm'

// Configura o Pool
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	// Aumenta um pouco o timeout para operações pesadas
	statement_timeout: 0,
	idleTimeoutMillis: 0,
})

const db = drizzle(pool, { schema })

async function seed() {
	console.log('🚀 Starting Massive Seed...')
	const startTime = performance.now()

	// --- 1. Garantir Categorias e Status (Mantido igual) ---
	const categorySlugs = ['ui', 'ux', 'enhancement', 'bug', 'feature']
	const statusSlugs = ['suggestion', 'planned', 'in-progress', 'live']

	// Inserção das tabelas auxiliares (rápido, não precisa de batch)
	console.log('📦 Seeding Categories and Statuses...')

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
				description: 'A suggestion',
				hexColor: '#AD1FEA',
				order: 0,
				includeInRoadmap: false,
			},
			{
				slug: 'planned',
				label: 'Planned',
				description: 'Prioritized',
				hexColor: '#F49F85',
				order: 1,
				includeInRoadmap: true,
			},
			{
				slug: 'in-progress',
				label: 'In-Progress',
				description: 'Dev',
				hexColor: '#AD1FEA',
				order: 2,
				includeInRoadmap: true,
			},
			{
				slug: 'live',
				label: 'Live',
				description: 'Released',
				hexColor: '#62BCFA',
				order: 3,
				includeInRoadmap: true,
			},
		])
		.onConflictDoUpdate({
			target: schema.feedbackStatuses.slug,
			set: { order: sql`excluded.order` },
		})

	// --- 2. Inserção em Massa com Batching ---

	const TOTAL_RECORDS = 1_000_000
	const BATCH_SIZE = 2000 // Tamanho seguro para o Postgres (evita erro de max params)

	console.log(
		`🔥 Preparing to insert ${TOTAL_RECORDS} records in batches of ${BATCH_SIZE}...`,
	)

	for (let i = 0; i < TOTAL_RECORDS; i += BATCH_SIZE) {
		const batch: (typeof schema.feedbacks.$inferInsert)[] = []

		// Calcula quantos faltam (para o último lote não passar do total)
		const currentBatchSize = Math.min(BATCH_SIZE, TOTAL_RECORDS - i)

		// Gera apenas o lote atual na memória
		for (let j = 0; j < currentBatchSize; j++) {
			const createdAt = faker.date.past({ years: 0.5 })
			const updatedAt = faker.date.between({ from: createdAt, to: new Date() })

			batch.push({
				title: faker.lorem.sentence({ min: 3, max: 7 }).replace('.', ''),
				description: faker.lorem.paragraph({ min: 1, max: 3 }),
				categorySlug: faker.helpers.arrayElement(categorySlugs),
				statusSlug: faker.helpers.arrayElement(statusSlugs),
				upvotesCount: faker.number.int({ min: 0, max: 150 }),
				// Randomiza o authorId para variar
				authorId: faker.number.int({ min: 1, max: 2 }),
				createdAt: createdAt,
				updatedAt: updatedAt,
				enabled: true,
			})
		}

		// Insere o lote
		await db.insert(schema.feedbacks).values(batch)

		// Feedback visual de progresso
		const progress = (((i + currentBatchSize) / TOTAL_RECORDS) * 100).toFixed(1)
		process.stdout.write(
			`\r⏳ Progress: ${progress}% | Inserted: ${i + currentBatchSize} records`,
		)
	}

	const endTime = performance.now()
	const duration = ((endTime - startTime) / 1000).toFixed(2)

	console.log(`\n\n✅ DONE! Inserted ${TOTAL_RECORDS} records in ${duration}s.`)
	await pool.end()
}

seed().catch((err) => {
	console.error('\n❌ Seed Error:', err)
	process.exit(1)
})
