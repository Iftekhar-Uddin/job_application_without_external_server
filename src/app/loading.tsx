export default function HomeSkeleton() {
  const shimmerLayer = (
    <div className="absolute inset-0 -translate-x-full bg-[linear-gradient(to_right,transparent,#93C5FD66,#86EFAC66,#FDBA7466,transparent)] animate-shimmer" />
  );

  return (
    <div className="mx-auto max-w-7xl space-y-4 md:space-y-6 p-4">
      {/* Hero Section */}
      <section className="relative bg-gray-100 rounded-lg shadow-md overflow-hidden py-6 md:py-20 text-center">
        <div className="flex flex-col items-center space-y-4 relative overflow-hidden">
          {shimmerLayer}
          <div className="w-2/3 md:w-1/3 h-8 bg-gray-200 rounded"></div>
          <div className="w-3/4 md:w-1/2 h-4 bg-gray-200 rounded"></div>
          <div className="w-36 h-10 bg-gray-200 rounded-md"></div>
        </div>
      </section>

      {/* Recent Jobs Skeleton Grid */}
      <section className="relative">
        <div className="flex justify-between items-center mb-4 relative overflow-hidden">
          {shimmerLayer}
          <div className="w-48 h-6 bg-gray-200 rounded"></div>
          <div className="w-20 h-6 bg-gray-200 rounded hidden md:block"></div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="relative bg-gray-100 p-4 md:p-6 rounded-lg shadow-sm space-y-3 overflow-hidden"
            >
              {shimmerLayer}
              <div className="w-2/3 h-5 bg-gray-200 rounded"></div>
              <div className="w-1/2 h-3 bg-gray-200 rounded"></div>

              <div className="flex justify-between">
                <div className="space-y-2">
                  <div className="w-24 h-3 bg-gray-200 rounded"></div>
                  <div className="w-28 h-3 bg-gray-200 rounded"></div>
                  <div className="w-32 h-3 bg-gray-200 rounded"></div>
                </div>
                <div className="w-24 h-16 bg-gray-200 rounded-md"></div>
              </div>

              <div className="flex flex-wrap gap-2">
                {[...Array(4)].map((_, s) => (
                  <div key={s} className="w-12 h-4 bg-gray-200 rounded"></div>
                ))}
              </div>

              <div className="border-t pt-2 flex justify-between">
                <div className="w-24 h-3 bg-gray-200 rounded"></div>
                <div className="w-16 h-3 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Explore All Jobs Button */}
        <div className="text-center md:text-right mt-10 relative overflow-hidden">
          {shimmerLayer}
          <div className="inline-block w-40 md:w-48 h-10 bg-gray-200 rounded-md"></div>
        </div>
      </section>
    </div>
  );
}