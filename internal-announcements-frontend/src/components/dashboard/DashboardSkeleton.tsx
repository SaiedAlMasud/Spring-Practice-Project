interface DashboardSkeletonProps {
  cards: number;
}

export default function DashboardSkeleton({ cards }: DashboardSkeletonProps) {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true">
      <div
        className={`grid gap-4 sm:grid-cols-2 ${
          cards === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
        }`}
      >
        {Array.from({ length: cards }).map((_, index) => (
          <div key={index} className="h-32 rounded-xl bg-slate-200/70" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="h-80 rounded-xl bg-slate-200/70 lg:col-span-2" />
        <div className="h-80 rounded-xl bg-slate-200/70" />
      </div>
      <div className="h-64 rounded-xl bg-slate-200/70" />
    </div>
  );
}
