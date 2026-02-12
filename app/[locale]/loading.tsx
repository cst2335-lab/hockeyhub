import LoadingSpinner from '@/components/LoadingSpinner';

export default function LocaleLoading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <LoadingSpinner />
    </div>
  );
}
