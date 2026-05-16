import { redirect } from 'next/navigation';
import CheckDatabaseClient from './CheckDatabaseClient';

export default function CheckDatabasePage() {
  if (process.env.NODE_ENV === 'production') {
    redirect('/en');
  }
  return <CheckDatabaseClient />;
}
