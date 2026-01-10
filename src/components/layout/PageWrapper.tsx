// src/components/layout/PageWrapper.tsx
import HeaderPage from '@/components/layout/HeaderPage'
import Main from '@/components/layout/Main'
import PageHead from '@/components/layout/PageHead'

type PageWrapperProps = {
    title: string
    description?: string
    keywords?: string
    children: React.ReactNode
    className?: string
}

export default function PageWrapper({
    title,
    description = '',
    keywords = '',
    children,
    className = '',
}: PageWrapperProps) {
    return (
        <>
            <PageHead title={title} description={description || title} keywords={keywords} />

            <div className="pt-20  pb-4 min-h-screen  bg-gray-50">
                <Main>
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                        <HeaderPage
                            title={title}
                            description={description}
                            customClass="mx-auto text-center"
                        />
                        <div className={className}>
                            {children}
                        </div>
                    </div>
                </Main>
            </div>
        </>
    )
}