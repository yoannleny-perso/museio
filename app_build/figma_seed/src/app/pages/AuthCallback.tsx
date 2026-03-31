import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

type CallbackState = 'loading' | 'success' | 'error';

export function AuthCallback() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [state, setState] = useState<CallbackState>('loading');

  useEffect(() => {
    // Simulate OAuth callback processing
    const timer = setTimeout(async () => {
      // 90% success rate
      if (Math.random() > 0.1) {
        // Call login to set user state
        await login('oauth@example.com', 'oauth-token');
        setState('success');
        setTimeout(() => navigate('/app/home'), 1500);
      } else {
        setState('error');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate, login]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4EEFD] via-white to-[#E3DBF9] flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="bg-white rounded-3xl shadow-xl p-12 border border-[#DDDCE7]">
          {state === 'loading' && (
            <>
              <Loader2 className="w-16 h-16 text-[#7A42E8] mx-auto mb-6 animate-spin" />
              <h2 className="text-2xl font-bold text-[#1F2430] mb-2">Completing Sign In</h2>
              <p className="text-[#7A7F8C]">Please wait while we verify your account...</p>
            </>
          )}

          {state === 'success' && (
            <>
              <div className="w-16 h-16 rounded-full bg-[#45C05A]/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-[#45C05A]" />
              </div>
              <h2 className="text-2xl font-bold text-[#1F2430] mb-2">Success!</h2>
              <p className="text-[#7A7F8C]">Redirecting to your dashboard...</p>
            </>
          )}

          {state === 'error' && (
            <>
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-[#1F2430] mb-2">Authentication Failed</h2>
              <p className="text-[#7A7F8C] mb-6">
                We couldn't complete your sign in. Please try again.
              </p>
              <button
                onClick={() => navigate('/auth')}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white font-semibold hover:shadow-lg transition-all"
              >
                Back to Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}