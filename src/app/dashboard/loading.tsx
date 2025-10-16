
const loading = () => {
    return (
        <div className="max-w-7xl mx-auto rounded-md sm:px-6 lg:px-0 min-h-[calc(100vh-10rem)]">
            {/* Header */}
            <div className="bg-amber-100 rounded-sm md:rounded-lg flex flex-col mb-1.5 md:mb-2.5 pt-0 md:pt-1 font-sans">
                <div className="flex justify-center mt-3 mb-2">
                    <div className="w-40 h-6 bg-amber-200 animate-pulse rounded" />
                </div>
                <div className="flex justify-around items-center pb-2">
                    <div className="w-32 h-4 bg-amber-200 animate-pulse rounded" />
                    <div className="w-32 h-4 bg-amber-200 animate-pulse rounded" />
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4 gap-2">
                {/* Posted Jobs Skeleton */}
                <div className="bg-amber-100 rounded-sm md:rounded-lg shadow-sm md:px-2">
                    <div className="max-h-[calc(100vh-15rem)] overflow-y-auto divide-y divide-amber-200">
                        {[...Array(5)].map((_, i) => (
                            <div key={`post-${i}`} className="p-3 md:p-4 animate-pulse space-y-3">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="space-y-2">
                                        <div className="w-40 h-4 bg-amber-200 rounded" />
                                        <div className="w-24 h-3 bg-amber-200 rounded" />
                                    </div>
                                    <div className="w-24 h-6 bg-amber-200 rounded-full" />
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-sm">
                                    <div className="w-16 h-3 bg-amber-200 rounded" />
                                    <div className="w-1 h-1 bg-amber-300 rounded-full" />
                                    <div className="w-20 h-3 bg-amber-200 rounded" />
                                    <div className="w-1 h-1 bg-amber-300 rounded-full" />
                                    <div className="w-24 h-3 bg-amber-200 rounded" />
                                </div>
                                <div className="flex justify-end">
                                    <div className="w-24 h-4 bg-amber-200 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Applications Skeleton */}
                <div className="bg-amber-100 rounded-sm md:rounded-lg shadow-sm md:px-2">
                    <div className="max-h-[calc(100vh-15rem)] overflow-y-auto divide-y divide-gray-200">
                        {[...Array(5)].map((_, i) => (
                            <div key={`app-${i}`} className="p-3 md:p-4 animate-pulse space-y-3">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="space-y-2">
                                        <div className="w-40 h-4 bg-amber-200 rounded" />
                                        <div className="w-24 h-3 bg-amber-200 rounded" />
                                    </div>
                                    <div className="w-20 h-6 bg-amber-300 rounded-full" />
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-sm">
                                    <div className="w-20 h-3 bg-amber-200 rounded" />
                                    <div className="w-1 h-1 bg-amber-300 rounded-full" />
                                    <div className="w-20 h-3 bg-amber-200 rounded" />
                                    <div className="w-1 h-1 bg-amber-300 rounded-full" />
                                    <div className="w-28 h-3 bg-amber-200 rounded" />
                                </div>
                                <div className="flex justify-end">
                                    <div className="w-24 h-4 bg-amber-200 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default loading