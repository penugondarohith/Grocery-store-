import { redirect } from 'next/navigation';

/**
 * /register → /signup redirect
 * The actual registration form lives at /signup (via the (auth) route group).
 */
export default function RegisterPage() {
  redirect('/signup');
}
