import { env } from '@/config/env'

/**
 * Logger centralizado para o Frontend.
 * Controlado pela variável de ambiente VITE_ENABLE_LOGS.
 */
class Logger {
	private isEnabled = env.VITE_ENABLE_LOGS

	// Estilos CSS para o console do navegador (fica bonito e organizado)
	private styles = {
		debug: 'color: #9ca3af', // Cinza
		info: 'color: #2563eb; font-weight: bold', // Azul
		warn: 'color: #d97706; font-weight: bold', // Laranja
		error: 'color: #dc2626; font-weight: bold', // Vermelho
	}

	debug(message: string, ...args: unknown[]) {
		if (!this.isEnabled) return
		// console.debug é oculto por padrão em alguns navegadores, útil para logs barulhentos
		console.debug(`%c[DEBUG]`, this.styles.debug, message, ...args)
	}

	info(message: string, ...args: unknown[]) {
		if (!this.isEnabled) return
		console.info(`%c[INFO]`, this.styles.info, message, ...args)
	}

	warn(message: string, ...args: unknown[]) {
		// Warnings geralmente queremos ver mesmo em prod, mas depende da sua política.
		// Aqui estou respeitando a flag geral.
		if (!this.isEnabled) return
		console.warn(`%c[WARN]`, this.styles.warn, message, ...args)
	}

	error(message: string, ...args: unknown[]) {
		// Erros devem ser visíveis sempre?
		// Se quiser que apareçam mesmo com LOGS=false, remova o if abaixo.
		// Por enquanto, segue a regra do ambiente.
		if (!this.isEnabled) return
		console.error(`%c[ERROR]`, this.styles.error, message, ...args)
	}
}

export const logger = new Logger()
