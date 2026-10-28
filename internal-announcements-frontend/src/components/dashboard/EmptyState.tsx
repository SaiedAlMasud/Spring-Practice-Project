interface EmptyStateProps {
  message: string;
  className?: string;
}

export default function EmptyState({
  message,
  className = "h-48",
}: EmptyStateProps) {
  return (
    <div
      className={`flex items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 text-center text-sm text-slate-500 ${className}`}
    >
      {message}
    </div>
  );
}
