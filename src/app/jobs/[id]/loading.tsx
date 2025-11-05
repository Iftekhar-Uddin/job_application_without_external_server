"use client";

import React from "react";

const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent relative overflow-hidden bg-gray-200 dark:bg-gray-700";

export default function JobDetailsSkeleton() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-6 bg-white/70 rounded-xl shadow-sm border border-gray-300 animate-fadeIn">
      {/* Top section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className={`h-4 w-24 rounded ${shimmer}`} />
        <div className={`h-4 w-40 rounded ${shimmer}`} />
      </div>

      {/* Logo & Title */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-lg ${shimmer}`} />
        <div className="flex-1 space-y-2">
          <div className={`h-5 sm:h-6 w-3/4 rounded ${shimmer}`} />
          <div className={`h-4 sm:h-5 w-1/2 rounded ${shimmer}`} />
        </div>
      </div>

      {/* Details grid */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-700">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`h-4 w-full rounded ${shimmer}`} />
        ))}
      </div>

      {/* Responsibilities */}
      <div className="mt-8 space-y-2">
        <div className={`h-5 w-48 rounded ${shimmer}`} />
        <div className={`h-16 w-full rounded ${shimmer}`} />
      </div>

      {/* Benefits */}
      <div className="mt-8 space-y-2">
        <div className={`h-5 w-56 rounded ${shimmer}`} />
        {[...Array(3)].map((_, i) => (
          <div key={i} className={`h-4 w-2/3 rounded ${shimmer}`} />
        ))}
      </div>

      {/* Footer Info */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className={`h-4 w-2/3 rounded ${shimmer}`} />
        ))}
      </div>

      {/* Button */}
      <div className="flex justify-end mt-6">
        <div className={`h-10 w-32 rounded-md ${shimmer}`} />
      </div>

      {/* Shimmer animation keyframes */}
      <style jsx>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </section>
  );
}
