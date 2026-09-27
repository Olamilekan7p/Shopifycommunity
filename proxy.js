import { next } from '@vercel/functions';
import { isAdminRequest } from './lib/auth.js';

const ADMIN_FILES = new Set(['/admin', '/admin.html', '/admin.js']);

export default function proxy(request) {
  if (isAdminRequest(request)) {
    return next({
      headers: {
        'Cache-Control': 'private, no-store, max-age=0',
        'X-Robots-Tag': 'noindex, nofollow, noarchive'
      }
    });
  }

  const url = new URL(request.url);
  if (url.pathname.startsWith('/api/admin/')) {
    return Response.json({ error: 'Authentication required.' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  }

  if (ADMIN_FILES.has(url.pathname)) {
    const login = new URL('/admin/login', request.url);
    login.searchParams.set('next', url.pathname);
    const response = Response.redirect(login, 307);
    response.headers.set('Cache-Control', 'no-store');
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    return response;
  }

  return next();
}
