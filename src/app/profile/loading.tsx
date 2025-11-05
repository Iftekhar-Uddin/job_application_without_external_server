"use client";

import React from "react";

const ShimmerBlock: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={`relative overflow-hidden bg-gray-200 ${className}`}
  >
    <div className="absolute inset-0 bg-linear-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer"></div>
  </div>
);

export default function ProfileShimmer() {
  return (
    <div className="max-w-7xl mx-auto bg-white/80 py-8 px-4 sm:px-6 lg:px-8 rounded-2xl shadow-xl space-y-6">
      
      {/* Header */}
      <header className="flex flex-col lg:flex-row items-center lg:items-start gap-6 justify-between w-full">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 w-full lg:w-auto">
          <ShimmerBlock className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full border-4 border-white shadow-lg" />
          <div className="flex-1 text-center sm:text-left min-w-0 space-y-2">
            <ShimmerBlock className="h-6 w-40 rounded" />
            <ShimmerBlock className="h-4 w-32 rounded" />
            <div className="flex gap-2 mt-3">
              <ShimmerBlock className="h-8 w-24 rounded-full" />
              <ShimmerBlock className="h-8 w-28 rounded-full" />
            </div>
          </div>
        </div>
        <div className="w-full lg:w-auto text-center lg:text-right mt-4 lg:mt-0 space-y-1">
          <ShimmerBlock className="h-4 w-24 rounded mx-auto lg:mx-0" />
          <ShimmerBlock className="h-4 w-20 rounded mx-auto lg:mx-0" />
        </div>
      </header>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left side */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal details */}
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <ShimmerBlock className="h-5 w-32 rounded" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array(6).fill(0).map((_, i) => (
                <ShimmerBlock key={i} className="h-10 w-full rounded" />
              ))}
              <ShimmerBlock className="sm:col-span-2 h-20 w-full rounded" />
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-3">
            <ShimmerBlock className="h-5 w-24 rounded" />
            <div className="flex flex-wrap gap-2 mt-2">
              {Array(5).fill(0).map((_, i) => (
                <ShimmerBlock key={i} className="h-6 w-16 rounded-full" />
              ))}
            </div>
          </div>
        </div>

        {/* Right side */}
        <aside className="space-y-6">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm p-6 space-y-2">
              <ShimmerBlock className="h-5 w-32 rounded" />
              <ShimmerBlock className="h-4 w-full rounded" />
              <ShimmerBlock className="h-4 w-36 rounded" />
              <ShimmerBlock className="h-2 w-full rounded mt-1" />
            </div>
          ))}
        </aside>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
      `}</style>
    </div>
  );
}
