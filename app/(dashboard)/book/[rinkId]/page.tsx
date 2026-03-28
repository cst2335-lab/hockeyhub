import { redirect } from 'next/navigation';

export default async function BookRinkPage({
  params,
}: {
  params: Promise<{ rinkId: string }>;
}) {
  const { rinkId } = await params;
  redirect(`/en/book/${encodeURIComponent(rinkId)}`);
}