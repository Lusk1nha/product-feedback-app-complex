import { useEffect } from 'react'
import { realtimeClient } from '@/lib/realtime-client'

export function useRealtimeSubscription<T>(
	topic: string,
	event: string,
	onMessage: (payload: T) => void,
) {
	useEffect(() => {
		// Entra no canal (ex: "feedbacks:list")
		const channel = realtimeClient.joinChannel(topic)

		// Inscreve-se no evento (ex: "new_feedback")
		const eventRef = channel.on(event, (payload: T) => {
			onMessage(payload)
		})

		// Cleanup function: remove o listener quando o componente desmontar
		return () => {
			channel.off(event, eventRef)
		}
	}, [topic, event, onMessage])
}
