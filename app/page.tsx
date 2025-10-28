// app/page.tsx
import {redirect} from 'next/navigation';

export default function Root() {
  // 统一重定向到 /en（middleware 也会兜底）
  redirect('/en');
}
