
export default function JobPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto min-h-[calc(100vh-9rem)] px-4 md:px-6 lg:px-8 bg-white/70 rounded-md sm:rounded-lg animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 py-4">

        <main className="lg:col-span-8">
          {/* Header skeleton */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="h-6 w-40 bg-gray-200 rounded-md mb-2 shimmer" />
              <div className="h-4 w-60 bg-gray-200 rounded-md shimmer" />
            </div>
            <div className="hidden md:flex gap-2">
              <div className="h-6 w-20 bg-gray-200 rounded-full shimmer" />
              <div className="h-6 w-16 bg-gray-200 rounded-full shimmer" />
            </div>
          </div>


          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white/70 border border-gray-200 rounded-2xl shadow-sm p-4 md:p-5"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="h-5 w-3/4 bg-gray-200 rounded-md shimmer mb-2" />
                    <div className="h-4 w-1/2 bg-gray-200 rounded-md shimmer" />
                  </div>
                  <div className="w-20 h-14 bg-gray-200 rounded-md shimmer" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                  <div className="flex gap-4">
                    <div className="h-4 w-24 bg-gray-200 rounded shimmer" />
                    <div className="h-4 w-20 bg-gray-200 rounded shimmer" />
                  </div>
                  <div className="flex justify-end gap-4">
                    <div className="h-4 w-16 bg-gray-200 rounded shimmer" />
                    <div className="h-4 w-20 bg-gray-200 rounded shimmer" />
                  </div>
                </div>

                <div className="flex gap-2 mb-3">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="h-5 w-12 bg-gray-200 rounded-md shimmer" />
                  ))}
                </div>

                <div className="h-4 w-full bg-gray-200 rounded shimmer" />
              </div>
            ))}
          </div>
        </main>

        <aside className="lg:col-span-4">
          <div className="sticky top-20 space-y-4">
            {/* Search card skeleton */}
            <div className="bg-white/70 border border-slate-300 rounded-2xl p-4 shadow-sm">
              <div className="h-5 w-32 bg-gray-200 rounded mb-4 shimmer" />
              <div className="space-y-3">
                <div className="h-9 bg-gray-200 rounded shimmer" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-9 bg-gray-200 rounded shimmer" />
                  <div className="h-9 bg-gray-200 rounded shimmer" />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 h-9 bg-gray-200 rounded shimmer" />
                  <div className="w-16 h-9 bg-gray-200 rounded shimmer" />
                </div>
              </div>
            </div>

            {/* Stats skeleton */}
            <div className="bg-white/70 border border-slate-300 rounded-2xl p-4 shadow-sm space-y-4">
              <div className="h-5 w-24 bg-gray-200 rounded shimmer" />
              <div className="flex justify-between items-center">
                <div className="h-4 w-20 bg-gray-200 rounded shimmer" />
                <div className="h-5 w-8 bg-gray-200 rounded shimmer" />
              </div>

              <div className="h-4 w-24 bg-gray-200 rounded shimmer mt-4" />
              <div className="grid grid-cols-2 gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-8 bg-gray-200 rounded shimmer" />
                ))}
              </div>

              <div className="h-4 w-28 bg-gray-200 rounded shimmer mt-4" />
              <div className="flex gap-2 items-end h-16">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gray-200 rounded-t shimmer"
                    style={{ height: `${20 + i * 10}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Quick actions skeleton */}
            <div className="bg-white/70 border border-slate-300 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="h-5 w-24 bg-gray-200 rounded shimmer" />
              <div className="h-9 bg-gray-200 rounded shimmer" />
              <div className="h-9 bg-gray-200 rounded shimmer" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
