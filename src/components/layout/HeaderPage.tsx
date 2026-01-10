export default function HeaderPage({
	title,
	description,
	customClass = ''
}: {
	title: string
	description: string
	customClass?: string
}) {
	return (
		<div className={`container mx-auto md:py-6 pb-0 text-center ${customClass ? customClass : 'md:text-start'}`}>
			<h1 className='text-2xl font-bold mb-4 text-green-700 md:text-4xl'>
				{title}
			</h1>
			<p className='text-gray-500 no-underline'>{description}</p>
		</div>
	)
}
