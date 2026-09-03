import { createClient } from './server';
import { NextResponse } from 'next/server';

/**
 * Verifies that the current request has a valid Supabase session
 * with an admin or super_admin role.
 * Returns { user } on success, or a NextResponse 401/403 on failure.
 */
export async function requireAdmin(): Promise<
  | { user: { id: string; email: string; role: string; full_name: string }; error: null }
  | { user: null; error: NextResponse }
> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return {
        user: null,
        error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      };
    }

    const role = user.user_metadata?.role ?? user.app_metadata?.role ?? 'customer';
    if (role !== 'admin' && role !== 'super_admin') {
      return {
        user: null,
        error: NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 }),
      };
    }

    return {
      user: {
        id: user.id,
        email: user.email ?? '',
        role,
        full_name: user.user_metadata?.full_name ?? user.email ?? 'Admin',
      },
      error: null,
    };
  } catch {
    return {
      user: null,
      error: NextResponse.json({ error: 'Internal Server Error' }, { status: 500 }),
    };
  }
}

/**
 * Verifies any authenticated user (customer or admin).
 */
export async function requireAuth(): Promise<
  | { user: { id: string; email: string; role: string }; error: null }
  | { user: null; error: NextResponse }
> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return {
        user: null,
        error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      };
    }

    return {
      user: {
        id: user.id,
        email: user.email ?? '',
        role: user.user_metadata?.role ?? user.app_metadata?.role ?? 'customer',
      },
      error: null,
    };
  } catch {
    return {
      user: null,
      error: NextResponse.json({ error: 'Internal Server Error' }, { status: 500 }),
    };
  }
}
