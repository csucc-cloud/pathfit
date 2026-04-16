import React from 'react';

const SkeletonPulse = ({ className }) => (
  <div className={`animate-pulse bg-gray-300 rounded-md ${className}`} />
);

export default function UniversalSkeleton() {
  return (
    <div className="max-w-[1250px] mx-auto px-4 mt-8 space-y-8">
      
      <SkeletonPulse className="h-48 md:h-64 w-full rounded-xl" />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div className="lg:col-span-4 space-y-4">
          <SkeletonPulse className="h-32 w-full" />
          <SkeletonPulse className="h-64 w-full" />
        </div>
        
        <div className="lg:col-span-8 space-y-4">
          <SkeletonPulse className="h-12 w-1/3" />
          <SkeletonPulse className="h-96 w-full" />
        </div>
      </div>
    </div>
  );
}
