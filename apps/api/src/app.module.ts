import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { DatabaseModule } from './shared/infrastructure/database/database.module'
import { IamModule } from './modules/iam/iam.module'

import { validate } from './shared/infrastructure/environment/env.validation'
import { SharedModule } from './shared/shared.module'

@Module({
  imports: [
    // --- Camada de Configuração ---
    ConfigModule.forRoot({
      isGlobal: true, // Disponível para todo o app sem precisar importar de novo
      cache: true, // Melhora performance (lê process.env uma vez só)
      expandVariables: true, // Permite usar variáveis dentro de variáveis no .env
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
      validate, // <--- AQUI: O Zod valida tudo antes do app subir!
    }),

    DatabaseModule, // Inicia o Pool do Postgres e o Provider do Drizzle
    SharedModule, // Inicia o módulos compartilhados

    IamModule, // Carrega rotas de /users, auth, etc.
  ],
  controllers: [], // Geralmente vazios no root
  providers: [], // Geralmente vazios no root
})
export class AppModule {}
