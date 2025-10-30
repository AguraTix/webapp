import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { googleAuth, authUtils, getCurrentUser } from '../api/auth';

const GoogleCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing Google authentication...');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const tokenFromUrl = searchParams.get('token') || searchParams.get('access_token') || searchParams.get('jwt');
      const userParam = searchParams.get('user');
      const hash = window.location.hash || '';
      const hashParams = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
      const tokenFromHash = hashParams.get('token') || hashParams.get('access_token') || hashParams.get('jwt');
      const userFromHash = hashParams.get('user');

      const tokenInline = tokenFromUrl || tokenFromHash;
      const userInline = userParam || userFromHash;

      if (tokenInline) {
        try {
          localStorage.setItem('token', tokenInline);

          let userSaved = false;
          if (userInline) {
            try {
              const decoded = decodeURIComponent(userInline);
              const userObj = JSON.parse(decoded);
              authUtils.saveAuthData({ token: tokenInline, user: userObj } as any);
              userSaved = true;
            } catch {}
          }
          if (!userSaved) {
            const me = await getCurrentUser();
            if (me.success && me.data) {
              authUtils.saveAuthData({ token: tokenInline, user: me.data } as any);
            } else {
              // At least ensure token is set for ProtectedRoute to pass
              localStorage.setItem('token', tokenInline);
            }
          }

          // Clean URL to remove sensitive params
          try {
            const url = new URL(window.location.href);
            url.search = '';
            url.hash = '';
            window.history.replaceState(null, '', url.toString());
          } catch {}

          // One-time success message and redirect
          try { localStorage.setItem('postAuthMessage', 'Welcome! You are now signed in.'); } catch {}
          navigate('/dashboard', { replace: true });
          return;
        } catch (e) {
          setStatus('error');
          setMessage('Authentication processing failed');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }
      }
      
      if (error) {
        setStatus('error');
        setMessage(`Authentication failed: ${error}`);
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      if (!code) {
        setStatus('error');
        setMessage('No authorization code received from Google');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }
      try {
        const result = await googleAuth.handleGoogleCallback(code);

        if (result.success) {
          setStatus('success');
          setMessage('Authentication successful! Redirecting...');
          
          // Check if this is a popup callback
          if (window.opener) {
            // Send success message to parent window
            window.opener.postMessage({
              type: 'GOOGLE_AUTH_SUCCESS',
              authData: result.data
            }, window.location.origin);
            window.close();
          } else {
            // Regular redirect: set message for consistency then go immediately
            try { localStorage.setItem('postAuthMessage', 'Welcome! You are now signed in.'); } catch {}
            navigate('/dashboard', { replace: true });
          }
        } else {
          throw new Error(result.error || 'Authentication failed');
        }
      } catch (error) {
        console.error('Google callback error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Authentication failed');
        
        if (window.opener) {
          // Send error message to parent window
          window.opener.postMessage({
            type: 'GOOGLE_AUTH_ERROR',
            error: error instanceof Error ? error.message : 'Authentication failed'
          }, window.location.origin);
          window.close();
        } else {
          setTimeout(() => navigate('/login'), 3000);
        }
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="bg-[#1A1A1A] p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-white mb-2">Processing...</h2>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-green-400 mb-2">Success!</h2>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-red-400 mb-2">Error</h2>
            </>
          )}
          
          <p className="text-gray-300 text-sm">{message}</p>
          
          {status === 'error' && (
            <button
              onClick={() => navigate('/login')}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
            >
              Back to Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleCallback;