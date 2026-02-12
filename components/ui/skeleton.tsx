import { cn } from '@/lib/utils';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-slate-200', className)}
      {...props}
    />
  );
}

/** Dashboard 统计卡片骨架 */
function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-lg shadow p-6">
          <Skeleton className="h-4 w-32 mb-4" />
          <Skeleton className="h-9 w-16" />
        </div>
      ))}
    </div>
  );
}

/** 比赛/冰场卡片列表骨架 */
function CardListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow p-6 space-y-4">
          <div className="flex justify-between">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-6 w-16 rounded" />
            <Skeleton className="h-6 w-20 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** 表单骨架 */
function FormSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4 max-w-2xl">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-10 w-full" />
      <div className="pt-4">
        <Skeleton className="h-10 w-full rounded" />
      </div>
    </div>
  );
}

export { Skeleton, DashboardSkeleton, CardListSkeleton, FormSkeleton };
