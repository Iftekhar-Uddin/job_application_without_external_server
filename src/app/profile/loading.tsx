"use client";
import React from "react";

const ProfilePageSkeleton = () => {
  const ShimmerOverlay = () => (
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
  );

  return (
    <div className="max-w-7xl mx-auto bg-white/80 py-8 px-4 sm:px-6 lg:px-8 rounded-md sm:rounded-lg shadow-xl">
      {/* Header Section Skeleton */}
      <header className="flex flex-col lg:flex-row items-center lg:items-start gap-6 justify-between w-full">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 w-full lg:w-auto">
          {/* Profile Image Skeleton */}
          <div className="relative mx-auto sm:mx-0 w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-300 flex items-center justify-center shrink-0">
            <ShimmerOverlay />
          </div>

          {/* User Info Skeleton */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="h-8 w-48 bg-gray-300 rounded-lg mx-auto sm:mx-0 mb-3 relative overflow-hidden">
              <ShimmerOverlay />
            </div>
            <div className="h-5 w-64 bg-gray-300 rounded mx-auto sm:mx-0 mb-4 relative overflow-hidden">
              <ShimmerOverlay />
            </div>

            {/* Action Buttons Skeleton */}
            <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
              <div className="h-10 w-32 bg-gray-300 rounded-full relative overflow-hidden">
                <ShimmerOverlay />
              </div>
              <div className="h-10 w-40 bg-gray-300 rounded-full relative overflow-hidden">
                <ShimmerOverlay />
              </div>
            </div>
          </div>
        </div>

        {/* Last Updated Skeleton */}
        <div className="w-full lg:w-auto text-center lg:text-right mt-4 lg:mt-0">
          <div className="h-4 w-20 bg-gray-300 rounded mx-auto lg:mx-0 mb-1 relative overflow-hidden">
            <ShimmerOverlay />
          </div>
          <div className="h-4 w-32 bg-gray-300 rounded mx-auto lg:mx-0 relative overflow-hidden">
            <ShimmerOverlay />
          </div>
        </div>
      </header>

      {/* Main Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Left Column - Personal Details & Skills */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Details Card Skeleton */}
          <div className="bg-white rounded-2xl shadow-sm p-6 relative overflow-hidden">
            <ShimmerOverlay />
            <div className="h-6 w-40 bg-gray-300 rounded mb-4 relative overflow-hidden">
              <ShimmerOverlay />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="h-4 w-20 bg-gray-300 rounded relative overflow-hidden">
                    <ShimmerOverlay />
                  </div>
                  <div className="h-10 w-full bg-gray-300 rounded-md relative overflow-hidden">
                    <ShimmerOverlay />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills Card Skeleton */}
          <div className="bg-white rounded-2xl shadow-sm p-6 relative overflow-hidden">
            <ShimmerOverlay />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
              <div className="h-6 w-24 bg-gray-300 rounded relative overflow-hidden">
                <ShimmerOverlay />
              </div>
              <div className="flex gap-2">
                <div className="h-10 w-40 bg-gray-300 rounded-md relative overflow-hidden">
                  <ShimmerOverlay />
                </div>
                <div className="h-10 w-16 bg-gray-300 rounded-full relative overflow-hidden">
                  <ShimmerOverlay />
                </div>
              </div>
            </div>

            {/* Skills Tags Skeleton */}
            <div className="flex flex-wrap gap-2">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="h-8 w-20 bg-gray-300 rounded-full relative overflow-hidden">
                  <ShimmerOverlay />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar Skeleton */}
        <aside className="space-y-6">
          {/* Security Card Skeleton */}
          <div className="bg-white rounded-2xl shadow-sm p-6 relative overflow-hidden">
            <ShimmerOverlay />
            <div className="h-5 w-32 bg-gray-300 rounded mb-3 relative overflow-hidden">
              <ShimmerOverlay />
            </div>
            <div className="h-4 w-40 bg-gray-300 rounded mb-3 relative overflow-hidden">
              <ShimmerOverlay />
            </div>
            <div className="h-9 w-full bg-gray-300 rounded-md mb-2 relative overflow-hidden">
              <ShimmerOverlay />
            </div>
            <div className="h-9 w-full bg-gray-300 rounded-md relative overflow-hidden">
              <ShimmerOverlay />
            </div>
          </div>

          {/* Profile Completeness Card Skeleton */}
          <div className="bg-white rounded-2xl shadow-sm p-6 relative overflow-hidden">
            <ShimmerOverlay />
            <div className="h-5 w-40 bg-gray-300 rounded mb-3 relative overflow-hidden">
              <ShimmerOverlay />
            </div>
            <div className="w-full bg-gray-300 rounded-full h-2 mb-2 relative overflow-hidden">
              <ShimmerOverlay />
            </div>
            <div className="h-4 w-48 bg-gray-300 rounded relative overflow-hidden">
              <ShimmerOverlay />
            </div>
          </div>

          {/* Support Card Skeleton */}
          <div className="bg-white rounded-2xl shadow-sm p-6 relative overflow-hidden">
            <ShimmerOverlay />
            <div className="h-5 w-24 bg-gray-300 rounded mb-3 relative overflow-hidden">
              <ShimmerOverlay />
            </div>
            <div className="h-4 w-full bg-gray-300 rounded mb-3 relative overflow-hidden">
              <ShimmerOverlay />
            </div>
            <div className="h-5 w-32 bg-gray-300 rounded relative overflow-hidden">
              <ShimmerOverlay />
            </div>
          </div>
        </aside>
      </div>

      {/* Password Modal Skeleton */}
      {/* <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative max-w-md w-full bg-white rounded-2xl shadow-xl p-6">
          <div className="h-6 w-40 bg-gray-300 rounded mb-4 relative overflow-hidden">
            <ShimmerOverlay />
          </div>
          
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="h-4 w-32 bg-gray-300 rounded relative overflow-hidden">
                  <ShimmerOverlay />
                </div>
                <div className="h-10 w-full bg-gray-300 rounded-md relative overflow-hidden">
                  <ShimmerOverlay />
                </div>
                {index === 1 && (
                  <>
                    <div className="h-3 w-24 bg-gray-300 rounded relative overflow-hidden">
                      <ShimmerOverlay />
                    </div>
                    <div className="w-full bg-gray-300 h-2 rounded-full relative overflow-hidden">
                      <ShimmerOverlay />
                    </div>
                  </>
                )}
              </div>
            ))}
            
            <div className="flex gap-2 justify-end pt-2">
              <div className="h-10 w-20 bg-gray-300 rounded-md relative overflow-hidden">
                <ShimmerOverlay />
              </div>
              <div className="h-10 w-32 bg-gray-300 rounded-md relative overflow-hidden">
                <ShimmerOverlay />
              </div>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default ProfilePageSkeleton;
