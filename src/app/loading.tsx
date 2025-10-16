const loading = () => {
  return (
    <div className="mx-auto md:space-y-12 max-w-7xl">
      {/* Hero Section - Skeleton */}
      <section className="text-center py-4 md:py-16 bg-amber-100 rounded-sm md:rounded-lg shadow-sm animate-pulse">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-2/3 md:w-1/3 h-6 md:h-8 bg-amber-200 rounded" />
          <div className="w-3/4 md:w-1/2 h-4 md:h-6 bg-amber-200 rounded" />
          <div className="w-40 h-8 bg-amber-200 rounded-md" />
        </div>
      </section>

      {/* Recent Jobs Section - Skeleton */}
      <section>
        <div className="grid gap-2 md:gap-6 md:grid-cols-2 lg:grid-cols-3 mt-2 md:mt-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-amber-100 p-3 md:p-6 rounded-sm md:rounded-lg shadow-sm hover:shadow-md transition-shadow animate-pulse space-y-3"
            >
              <div className="w-2/3 h-5 md:h-6 bg-amber-200 rounded" />
              <div className="w-1/2 h-3 bg-amber-200 rounded" />
              <div className="flex space-x-4 text-sm my-2">
                <div className="w-20 h-3 bg-amber-200 rounded" />
                <div className="w-16 h-3 bg-amber-200 rounded" />
              </div>
              <div className="w-full h-12 bg-amber-200 rounded" />
              <div className="w-24 h-4 bg-amber-200 rounded self-end ml-auto" />
            </div>
          ))}
        </div>

        {/* View All Button - Skeleton */}
        <div className="text-center mt-2 md:mt-8 animate-pulse">
          <div className="mx-auto w-36 md:w-48 h-6 bg-amber-200 rounded" />
        </div>
      </section>
    </div>
  );

}

export default loading