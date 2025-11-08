"use client";
import React from "react";

const HomeSkeletonWithShimmer = () => {
  const ShimmerOverlay = () => (
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
  );

  return (
    <div className="mx-auto max-w-7xl space-y-4 md:space-y-6 z-0">
      {/* Hero Section */}
      <section className="relative bg-gray-300 rounded-lg shadow-md overflow-hidden">
        <ShimmerOverlay />
        <div className="relative text-center py-4 md:py-20 px-4">
          <div className="h-8 md:h-12 w-3/4 md:w-1/2 bg-gray-400 rounded-lg mx-auto mb-4"></div>
          <div className="h-6 md:h-8 w-5/6 md:w-2/3 bg-gray-400 rounded mx-auto mb-2"></div>
          <div className="h-6 md:h-8 w-4/6 md:w-1/2 bg-gray-400 rounded mx-auto"></div>
        </div>
      </section>

      {/* Latest Jobs Section */}
      <section>
        <div className="flex mb-2 md:mb-6 relative overflow-hidden">
          <ShimmerOverlay />
          <div className="h-8 md:h-10 w-48 md:w-64 bg-gray-300 rounded-md"></div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="group relative block bg-white border border-gray-200 rounded-xl shadow-sm p-5 overflow-hidden"
            >
              <ShimmerOverlay />
              {/* Job content skeleton remains the same */}
              <div className="flex items-center gap-1.5 mb-3">
                <div className="h-6 w-32 bg-gray-300 rounded"></div>
                <div className="h-4 w-20 bg-gray-300 rounded"></div>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <div className="h-4 w-4 bg-gray-300 rounded-full"></div>
                    <div className="h-4 w-24 bg-gray-300 rounded"></div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-4 w-4 bg-gray-300 rounded-full"></div>
                    <div className="h-4 w-20 bg-gray-300 rounded"></div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1">
                      <div className="h-4 w-4 bg-gray-300 rounded-full"></div>
                      <div className="h-4 w-28 bg-gray-300 rounded"></div>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-4 w-4 bg-gray-300 rounded-full"></div>
                      <div className="h-4 w-32 bg-gray-300 rounded"></div>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-4 w-4 bg-gray-300 rounded-full"></div>
                      <div className="h-4 w-36 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                  <div className="w-24 h-16 bg-gray-300 rounded-md"></div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                <div className="h-6 w-16 bg-gray-300 rounded-md"></div>
                <div className="h-6 w-20 bg-gray-300 rounded-md"></div>
                <div className="h-6 w-14 bg-gray-300 rounded-md"></div>
              </div>

              <div className="mt-auto flex items-center justify-between border-t pt-3">
                <div className="h-4 w-24 bg-gray-300 rounded"></div>
                <div className="h-4 w-20 bg-gray-300 rounded hidden md:block"></div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center md:text-right mt-10 relative overflow-hidden">
          <ShimmerOverlay />
          <div className="inline-block h-12 w-48 bg-gray-300 rounded-md"></div>
        </div>
      </section>
    </div>
  );
};

export default HomeSkeletonWithShimmer;