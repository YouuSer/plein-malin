interface SkeletonProps {
  className?: string;
  count?: number;
}

export function Skeleton({ className = "h-16", count = 1 }: SkeletonProps) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`skeleton ${className}`}
        />
      ))}
    </div>
  );
}

export function StationCardSkeleton() {
  return (
    <div
      className="flex items-center gap-3 p-3.5"
      style={{
        background: "var(--surface-secondary)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
      }}
    >
      <div className="w-11 h-11 rounded-full skeleton shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-28 skeleton rounded-full" />
        <div className="h-3 w-36 skeleton rounded-full" />
      </div>
      <div className="h-8 w-20 skeleton" />
    </div>
  );
}

export function StationListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: count }).map((_, i) => (
        <StationCardSkeleton key={i} />
      ))}
    </div>
  );
}
