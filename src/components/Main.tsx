export default function Main({children}: {children: React.ReactNode}) {
	return (
		<main className='w-full max-w-[540px] sm:max-w-[720px] md:max-w-[960px] lg:max-w-[1140px] xl:max-w-[1320px] mx-auto'>
			<div className='flex flex-col gap-3'>
				{children}
			</div>
		</main>
	)
}
