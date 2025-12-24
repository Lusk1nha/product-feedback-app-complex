import { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { apiReference } from '@scalar/nestjs-api-reference'

export function setupSwaggerWithScalar(app: INestApplication, route: string) {
	const config = new DocumentBuilder()
		.setTitle('Product Feedback - App - API Reference')
		.setDescription('The product feedback API description')
		.setVersion('1.0')
		.addTag('product-feedback')
		.addBearerAuth()
		.build()

	const document = SwaggerModule.createDocument(app, config)

	app.use(
		route,
		apiReference({
			spec: {
				content: document,
			},
			theme: 'saturn',
		}),
	)
}
