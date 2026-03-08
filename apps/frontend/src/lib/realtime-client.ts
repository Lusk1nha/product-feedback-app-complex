import { Socket, Channel } from 'phoenix'

class RealtimeClient {
	private socket: Socket | null = null
	private channels: Map<string, Channel> = new Map()

	// Inicia a conexão (pode receber token JWT para autenticação no futuro)
	connect(token?: string) {
		if (this.socket) return

		// Usamos a rota relativa! O Vite (em dev) ou seu Nginx (em prod) farão o proxy
		const wsUrl = 'ws://127.0.0.1:4000/socket'

		this.socket = new Socket(wsUrl, { params: { token } })
		this.socket.connect()
	}

	disconnect() {
		if (this.socket) {
			this.socket.disconnect()
			this.socket = null
		}
	}

	// Padrão de projeto Flyweight/Registry para reaproveitar canais
	joinChannel(topic: string): Channel {
		if (!this.socket) this.connect()

		// Se já estamos nesse canal, apenas retorna ele
		if (this.channels.has(topic)) return this.channels.get(topic)!

		const channel = this.socket!.channel(topic, {})

		channel
			.join()
			.receive('ok', () => console.log(`[Realtime] Joined topic: ${topic}`))
			.receive('error', (resp) =>
				console.error(`[Realtime] Failed to join ${topic}`, resp),
			)

		this.channels.set(topic, channel)
		return channel
	}

	leaveChannel(topic: string) {
		const channel = this.channels.get(topic)
		if (channel) {
			channel.leave()
			this.channels.delete(topic)
		}
	}
}

// Exportamos uma única instância (Singleton)
export const realtimeClient = new RealtimeClient()
