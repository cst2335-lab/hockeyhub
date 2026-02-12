import { DashboardSkeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="h-9 w-64 mb-6 animate-pulse rounded bg-slate-200" />
      <DashboardSkeleton />
    </div>
  );
}
