"use client";
import React from "react";

const DashboardSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-6 bg-white/70 rounded-sm md:rounded-lg">
      {/* Header */}
      <div className="mb-6 space-y-3">
        <div className="h-6 w-48 bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer rounded" />
        <div className="h-4 w-72 bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer rounded" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-4 rounded-xl border bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer h-24"
          />
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:h-[calc(100vh-25rem)] overflow-hidden">
        {/* Left section (Jobs/Applications List) */}
        <div className="lg:col-span-2 space-y-4 md:overflow-y-auto md:pr-2 scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-gray-100">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="p-5 bg-white rounded-xl shadow-sm border space-y-3 animate-shimmer bg-linear-to-r from-gray-200 via-gray-100 to-gray-200"
            >
              <div className="h-5 w-1/3 rounded bg-gray-200" />
              <div className="h-4 w-2/3 rounded bg-gray-200" />
              <div className="flex gap-2 mt-2">
                {[1, 2, 3].map((b) => (
                  <div
                    key={b}
                    className="h-4 w-16 rounded bg-gray-200"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-xl border space-y-3">
            <div className="h-5 w-32 bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer rounded" />
            <div className="h-8 w-full bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer rounded" />
            <div className="h-8 w-full bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer rounded" />
          </div>

          <div className="p-4 bg-white rounded-xl border space-y-2">
            <div className="h-5 w-40 bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer rounded" />
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-3 w-full bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer rounded"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;