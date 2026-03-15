import { useEffect } from 'react'
import { realtimeClient } from '@/lib/realtime-client'

export function useRealtimeSubscription<T>(
	topic: string,
	event: string,
	onMessage: (payload: T) => void,
) {
	useEffect(() => {
		const channel = realtimeClient.joinChannel(topic)

		const eventRef = channel.on(event, (payload: T) => {
			onMessage(payload)
		})

		return () => {
			channel.off(event, eventRef)
		}
	}, [topic, event, onMessage])
}
