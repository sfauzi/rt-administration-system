// app/page.tsx
// Route: /  → redirect ke /dashboard (AuthGuard akan handle kalau belum login)

import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/login');
}