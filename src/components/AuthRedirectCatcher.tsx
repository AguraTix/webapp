import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authUtils, getCurrentUser } from '../api/auth';

// Catches token/user params present on ANY route (query or hash) and finalizes login
export default function AuthRedirectCatcher() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const url = new URL(window.location.href);
    const searchParams = new URLSearchParams(url.search);

    const hash = url.hash || '';
    const hashParams = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);

    const token = searchParams.get('token') || searchParams.get('access_token') || searchParams.get('jwt')
      || hashParams.get('token') || hashParams.get('access_token') || hashParams.get('jwt');

    const userParam = searchParams.get('user') || hashParams.get('user');
    const authFlag = searchParams.get('auth') || hashParams.get('auth');

    // Only proceed if a token is present and this looks like an auth redirect
    if (!token) return;

    (async () => {
      try {
        // Persist token
        localStorage.setItem('token', token);

        // Try to persist user
        let userSaved = false;
        if (userParam) {
          try {
            const decoded = decodeURIComponent(userParam);
            const userObj = JSON.parse(decoded);
            authUtils.saveAuthData({ token, user: userObj } as any);
            userSaved = true;
          } catch {
            // fallthrough to fetch
          }
        }
        if (!userSaved) {
          const me = await getCurrentUser();
          if (me.success && me.data) {
            authUtils.saveAuthData({ token, user: me.data } as any);
          }
        }

        // Clean URL to remove sensitive params
        try {
          url.search = '';
          url.hash = '';
          window.history.replaceState(null, '', url.toString());
        } catch {}

        try { localStorage.setItem('postAuthMessage', 'Welcome! You are now signed in.'); } catch {}
        navigate('/dashboard', { replace: true });
      } catch (e) {
        // On failure, leave the page but clear the noisy params
        try {
          url.search = '';
          url.hash = '';
          window.history.replaceState(null, '', url.toString());
        } catch {}
      }
    })();
  // run only once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
