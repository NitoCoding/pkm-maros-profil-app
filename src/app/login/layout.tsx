import type {Metadata} from 'next'

export const metadata: Metadata = {
	title: 'Login',
	description: 'Login to your account',
	keywords: 'login, account, admin',
	openGraph: {
		title: 'Login',
		description: 'Login to your account',
		type: 'website',
	},
}

export default function LoginLayout({
	children,
}: Readonly<{children: React.ReactNode}>) {
	return (
		<div className='flex items-center justify-center min-h-screen bg-gray-100'>
			<main>{children}</main>
		</div>
	)
}
