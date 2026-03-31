import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Mail, Lock, Loader2, Chrome } from 'lucide-react';
import { useApp } from '../context/AppContext';

type AuthMode = 'signin' | 'signup' | 'recovery';

export function Auth() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (mode === 'recovery') {
        // Mock recovery
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSuccess('Recovery email sent! Check your inbox.');
        setIsLoading(false);
      } else if (mode === 'signup') {
        // Mock signup
        await new Promise(resolve => setTimeout(resolve, 1000));
        await login(email, password);
        navigate('/app/home');
      } else {
        // Mock signin
        await login(email, password);
        navigate('/app/home');
      }
    } catch (err) {
      setError('Invalid credentials. Please try again.');
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    setIsLoading(true);
    // Mock OAuth flow
    setTimeout(() => {
      navigate('/auth/callback');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4EEFD] via-white to-[#E3DBF9] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8F6EE6] to-[#7A42E8] mb-4">
            <span className="text-3xl font-bold text-white">M</span>
          </div>
          <h1 className="text-3xl font-bold text-[#1F2430] mb-2">
            {mode === 'recovery' ? 'Reset Password' : mode === 'signup' ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-[#7A7F8C]">
            {mode === 'recovery' 
              ? 'Enter your email to receive a reset link' 
              : mode === 'signup'
              ? 'Start your creative journey with Museio'
              : 'Sign in to continue to Museio'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-[#DDDCE7]">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#1F2430] mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A4A9B6]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            {mode !== 'recovery' && (
              <div>
                <label className="block text-sm font-medium text-[#1F2430] mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A4A9B6]" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Error/Success Messages */}
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            {success && (
              <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}

            {/* Forgot Password */}
            {mode === 'signin' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setMode('recovery')}
                  className="text-sm text-[#7A42E8] font-medium hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Please wait...</span>
                </>
              ) : (
                <span>
                  {mode === 'recovery' ? 'Send Reset Link' : mode === 'signup' ? 'Create Account' : 'Sign In'}
                </span>
              )}
            </button>
          </form>

          {/* OAuth Options */}
          {mode !== 'recovery' && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#DDDCE7]" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-[#7A7F8C]">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="w-full py-3 rounded-xl border-2 border-[#DDDCE7] text-[#1F2430] font-medium hover:bg-[#F8F9FB] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Chrome className="w-5 h-5" />
                <span>Google</span>
              </button>
            </>
          )}

          {/* Mode Toggle */}
          <div className="mt-6 text-center">
            {mode === 'recovery' ? (
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError('');
                  setSuccess('');
                }}
                className="text-sm text-[#7A7F8C]"
              >
                Back to{' '}
                <span className="text-[#7A42E8] font-medium hover:underline">Sign In</span>
              </button>
            ) : (
              <p className="text-sm text-[#7A7F8C]">
                {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === 'signin' ? 'signup' : 'signin');
                    setError('');
                  }}
                  className="text-[#7A42E8] font-medium hover:underline"
                >
                  {mode === 'signin' ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-[#7A7F8C] hover:text-[#7A42E8]"
          >
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  );
}
