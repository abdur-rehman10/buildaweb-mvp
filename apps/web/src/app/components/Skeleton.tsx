// Skeleton loading components for better UX

export function SkeletonText({ width = '100%' }: { width?: string }) {
  return (
    <div
      className="h-4 bg-muted rounded animate-pulse"
      style={{ width }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="p-6 border border-border rounded-lg bg-card animate-pulse">
      <div className="h-6 w-3/4 bg-muted rounded mb-3" />
      <div className="h-4 w-full bg-muted rounded mb-2" />
      <div className="h-4 w-5/6 bg-muted rounded" />
    </div>
  );
}

export function SkeletonAvatar() {
  return (
    <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
  );
}

export function SkeletonButton() {
  return (
    <div className="h-10 w-24 bg-muted rounded-lg animate-pulse" />
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border border-border rounded-lg animate-pulse">
          <div className="h-10 w-10 rounded-full bg-muted flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 bg-muted rounded" />
            <div className="h-3 w-1/2 bg-muted rounded" />
          </div>
          <div className="h-8 w-20 bg-muted rounded" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-6 border border-border rounded-lg animate-pulse">
            <div className="h-4 w-24 bg-muted rounded mb-3" />
            <div className="h-8 w-16 bg-muted rounded" />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-48 bg-muted rounded mb-2 animate-pulse" />
          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-muted rounded animate-pulse" />
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
