'use client'

import HeaderPage from '@/components/layout/HeaderPage'
import Main from '@/components/layout/Main'
import InovasiCard from '@/components/cards/InovasiCard'
import { useInovasi } from '@/hooks/useInovasi'
import { LoadMoreButton } from '@/components/ui/LoadMoreButton'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'

export default function InovasiPageClient() {
  const { inovasi = [], loading, error, hasMore, loadMore } = useInovasi({ pageSize: 20 })

  return (
    <>
      <div className='pt-12 min-h-screen pb-3'>
        <Main>
          <div className='mt-5 px-4 sm:px-6 lg:px-8'>
            <div className='container mx-auto max-w-7xl'>



              {/* ERROR STATE */}
              {error && (
                <ErrorState
                  error={error}
                  onRetry={() => window.location.reload()}
                />
              )}

              {/* EMPTY STATE */}
              {!loading && !error && inovasi.length === 0 && (
                <EmptyState
                  title="Belum Ada Inovasi"
                  message="Desa kami terus berinovasi. Nantikan terobosan menarik dari warga Desa Benteng Gajah!"
                  emoji="🚀"
                />
              )}

              {/* GRID INOVASI */}
              {inovasi.length > 0 && (
                <div className="w-full px-4 grid grid-cols-1 gap-8">
                  {inovasi.map((item) => (
                    <InovasiCard key={item.id} inovasi={item} />
                  ))}
                </div>
              )}

              {/* LOADING AWAL */}
              {loading && inovasi.length === 0 && (
                <LoadingState message="Memuat data inovasi..." />
              )}

              {/* LOADING TAMBAHAN */}
              {loading && inovasi.length > 0 && (
                <LoadingState message="Memuat inovasi lainnya..." />
              )}

              {/* LOAD MORE BUTTON */}
              {!loading && hasMore && (
              <LoadMoreButton
                loading={loading}
                hasMore={hasMore}
                onClick={loadMore}
                label="Muat Inovasi Lainnya"
              />
              )}
            </div>
          </div>
        </Main>
      </div>
    </>
  )
}