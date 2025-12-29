import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import * as schema from './schema'
import { sql } from 'drizzle-orm'

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
})

const db = drizzle(pool, { schema })

async function seed() {
	console.log('🌱 Starting Seed...')

	// Como importamos * as schema, acessamos as tabelas assim: schema.feedbackCategories

	// 1. Categories
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
			set: { order: sql`excluded.order` }, // Atualiza a ordem mesmo se já existir
		})

	// 2. Statuses
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

	console.log('✅ Seed Finished!')
	await pool.end()
}

seed().catch((err) => {
	console.error('❌ Seed Error:', err)
	process.exit(1)
})
