import React from 'react';

export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-[#ebebe6] ${className}`}
      {...props}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#e4e4df] shadow-sm space-y-3">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-8 w-80" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      {/* KPI 4 Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-[#e4e4df] space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      {/* Progress Bar Skeleton */}
      <div className="bg-white p-6 rounded-xl border border-[#e4e4df] space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-6 w-32 rounded-lg" />
        </div>
        <Skeleton className="h-2.5 w-full rounded-full" />
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-xl border border-[#e4e4df] p-6 space-y-4">
        <Skeleton className="h-5 w-48" />
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-[#f0f0eb] last:border-none">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-20 rounded-md" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="bg-white rounded-xl border border-[#e4e4df] overflow-hidden shadow-sm animate-pulse">
      <div className="bg-[#f4f4f0] p-4 border-b border-[#e4e4df] flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      <div className="p-4 space-y-4">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-4 py-2 border-b border-[#f0f0eb] last:border-none">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DetailPageSkeleton() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-pulse">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-[#e4e4df] space-y-4">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="bg-white p-6 rounded-xl border border-[#e4e4df] space-y-4">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-[#e4e4df] space-y-4">
        <Skeleton className="h-5 w-48" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}