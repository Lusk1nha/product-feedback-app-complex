import { GradientBackground } from '../common/gradient-banner'

export function DashboardLogo() {
	return (
		<GradientBackground className="h-[178px] rounded-lg">
			<div className="w-full h-full flex flex-col items-start justify-end p-6">
				<h1 className="text-h1 font-bold">Frontend Mentor</h1>
				<p className="text-body-3 font-normal text-brand-light">Feedback App</p>
			</div>
		</GradientBackground>
	)
}
