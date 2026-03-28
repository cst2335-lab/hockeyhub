import { redirect } from 'next/navigation';

export default async function EditGamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/en/games/${encodeURIComponent(id)}/edit`);
}