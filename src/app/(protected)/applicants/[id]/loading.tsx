import React from 'react'

const loading = () => {
    return (
        <div className="max-w-7xl mx-auto rounded-md sm:px-6 lg:px-0 h-[calc(100-10rem)]">
            <div className="bg-amber-100 rounded-sm md:rounded-lg flex flex-col mb-3 pt-1 animate-pulse ring-1 ring-yellow-500">
                {/* Title */}
                <div className="text-center mx-auto md:px-8 md:my-4 py-1 md:py-2">
                    <div className="h-6 md:h-8 w-1/2 bg-amber-200 rounded mx-auto" />
                </div>

                {/* Job Overview Skeleton */}
                <div className="p-3 md:p-6 grid md:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="space-y-3">
                            <div className="h-5 bg-amber-200 rounded w-2/3"></div>
                            <div className="h-4 bg-amber-200 rounded w-1/2"></div>
                            <div className="h-4 bg-amber-200 rounded w-3/4"></div>
                        </div>
                    ))}
                    <div className="col-span-3 h-4 bg-amber-200 rounded mt-2 w-full"></div>
                </div>

                {/* Divider */}
                <hr className="my-2 h-px bg-amber-200" />

                {/* Section Header */}
                <div className="pl-4 md:pl-6">
                    <div className="h-6 w-1/3 bg-amber-200 rounded mb-2"></div>
                </div>

                {/* Applicants Skeleton Cards */}
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="px-4 md:pl-6 py-2 w-full flex flex-col min-h-fit">
                        <div className="md:grid md:grid-cols-4 md:gap-2 bg-amber-100 w-full rounded-lg p-2 ring-1 space-y-4 md:space-y-0">
                            {/* Image placeholder */}
                            <div className="flex w-full items-center justify-center">
                                <div className="h-32 w-full bg-amber-200 rounded-md"></div>
                            </div>

                            {/* Info Column */}
                            <div className="w-full flex flex-col space-y-2">
                                <div className="h-4 bg-amber-200 rounded w-3/4"></div>
                                <div className="h-4 bg-amber-200 rounded w-1/2"></div>
                                <div className="h-4 bg-amber-200 rounded w-2/3"></div>
                            </div>

                            {/* Skills Column */}
                            <div className="space-y-2">
                                <div className="h-4 bg-amber-200 rounded w-5/6"></div>
                                <div className="h-4 bg-amber-200 rounded w-full"></div>
                                <div className="h-4 bg-amber-200 rounded w-3/4"></div>
                            </div>

                            {/* Status Column */}
                            <div className="w-full flex flex-col space-y-2">
                                <div className="h-4 bg-amber-200 rounded w-2/3"></div>
                                <div className="h-4 bg-amber-200 rounded w-1/2"></div>
                                <div className="h-6 bg-amber-200 rounded w-24"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default loading