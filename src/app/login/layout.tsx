import type {Metadata} from 'next'

export const metadata: Metadata = {
	title: 'Kelurahan Bilokka ⋅ Login',
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
