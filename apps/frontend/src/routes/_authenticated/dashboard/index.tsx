// src/routes/_authenticated/dashboard/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { MobileTopBar } from '@/components/mobile/mobile-top-bar'
import { MobileSidebar } from '@/components/mobile/mobile-sidebar'

export const Route = createFileRoute('/_authenticated/dashboard/')({
	component: DashboardPage,
})

export function DashboardPage() {
	const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false)

	return (
		<div className="relative min-h-screen bg-background">
			<header>
				<MobileTopBar
					isSidebarOpen={isMobileSidebarOpen}
					onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
				/>

				<MobileSidebar
					isOpen={isMobileSidebarOpen}
					onClose={() => setIsMobileSidebarOpen(false)}
				/>
			</header>

			<main className="container mx-auto px-4 py-8">
				<h2 className="text-h1 text-foreground">Conteúdo Principal</h2>
				<p className="text-muted-foreground">
					A lista de feedbacks vai aqui...
				</p>
			</main>
		</div>
	)
}
