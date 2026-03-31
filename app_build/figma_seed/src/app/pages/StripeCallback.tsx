import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

type CallbackState = 'loading' | 'success' | 'error';

export function StripeCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<CallbackState>('loading');
  
  // Get status from query params
  const status = searchParams.get('status'); // 'success' | 'error'

  useEffect(() => {
    // Simulate Stripe callback processing
    const timer = setTimeout(() => {
      if (status === 'error') {
        setState('error');
      } else {
        setState('success');
        // Redirect to banking settings after success
        setTimeout(() => navigate('/app/settings?tab=banking'), 2000);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [status, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4EEFD] via-white to-[#E3DBF9] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl p-12 border border-[#DDDCE7] text-center">
          {state === 'loading' && (
            <>
              <Loader2 className="w-16 h-16 text-[#7A42E8] mx-auto mb-6 animate-spin" />
              <h2 className="text-2xl font-bold text-[#1F2430] mb-2">Processing Connection</h2>
              <p className="text-[#7A7F8C]">Please wait while we connect your Stripe account...</p>
            </>
          )}

          {state === 'success' && (
            <>
              <div className="w-16 h-16 rounded-full bg-[#45C05A]/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-[#45C05A]" />
              </div>
              <h2 className="text-2xl font-bold text-[#1F2430] mb-2">Successfully Connected!</h2>
              <p className="text-[#7A7F8C]">Your Stripe account has been connected. Redirecting...</p>
            </>
          )}

          {state === 'error' && (
            <>
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-[#1F2430] mb-2">Connection Failed</h2>
              <p className="text-[#7A7F8C] mb-6">
                We couldn't connect your Stripe account. Please try again.
              </p>
              <button
                onClick={() => navigate('/app/settings?tab=banking')}
                className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white font-semibold hover:shadow-lg transition-all"
              >
                Back to Settings
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
