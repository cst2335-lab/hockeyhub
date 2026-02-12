// Redirect /login to localized login; middleware also redirects, this is a fallback
import { redirect } from 'next/navigation';

export default function LoginPage() {
  redirect('/en/login');
}
