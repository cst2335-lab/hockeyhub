import { redirect } from 'next/navigation';
import TestNotificationsClient from './TestNotificationsClient';

export default function TestNotificationsPage() {
  if (process.env.NODE_ENV === 'production') {
    redirect('/en');
  }
  return <TestNotificationsClient />;
}
