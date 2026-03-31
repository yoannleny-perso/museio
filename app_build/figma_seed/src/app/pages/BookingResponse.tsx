import { useNavigate, useSearchParams } from 'react-router';
import { CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react';

type ResponseState = 'accepted' | 'declined' | 'invalid' | 'expired' | 'processed' | 'error';

export function BookingResponse() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Mock: determine state from query params
  const action = searchParams.get('action'); // 'accept' | 'decline'
  const token = searchParams.get('token');
  
  // Simulate different states based on token
  const getState = (): ResponseState => {
    if (!token) return 'invalid';
    if (token === 'expired') return 'expired';
    if (token === 'processed') return 'processed';
    if (token === 'error') return 'error';
    return action === 'accept' ? 'accepted' : action === 'decline' ? 'declined' : 'invalid';
  };

  const state = getState();

  const stateConfig = {
    accepted: {
      icon: CheckCircle2,
      iconColor: 'text-[#45C05A]',
      iconBg: 'bg-[#45C05A]/10',
      title: 'Booking Confirmed!',
      message: 'You\'ve successfully accepted the quote. The artist will receive a confirmation and will be in touch soon with next steps.',
    },
    declined: {
      icon: XCircle,
      iconColor: 'text-[#7A7F8C]',
      iconBg: 'bg-[#F4EEFD]',
      title: 'Quote Declined',
      message: 'You\'ve declined this quote. Thank you for considering this artist for your event.',
    },
    invalid: {
      icon: AlertCircle,
      iconColor: 'text-orange-500',
      iconBg: 'bg-orange-50',
      title: 'Invalid Link',
      message: 'This booking response link is invalid or malformed. Please check the link in your email and try again.',
    },
    expired: {
      icon: Clock,
      iconColor: 'text-orange-500',
      iconBg: 'bg-orange-50',
      title: 'Link Expired',
      message: 'This quote response link has expired. Quote links are valid for 30 days. Please contact the artist directly if you\'re still interested.',
    },
    processed: {
      icon: AlertCircle,
      iconColor: 'text-[#7A7F8C]',
      iconBg: 'bg-[#F4EEFD]',
      title: 'Already Processed',
      message: 'You\'ve already responded to this quote. If you need to make changes, please contact the artist directly.',
    },
    error: {
      icon: XCircle,
      iconColor: 'text-red-500',
      iconBg: 'bg-red-50',
      title: 'Something Went Wrong',
      message: 'We encountered an error processing your response. Please try again or contact the artist directly.',
    },
  };

  const config = stateConfig[state];
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4EEFD] via-white to-[#E3DBF9] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl p-12 border border-[#DDDCE7] text-center">
          {/* Icon */}
          <div className={`w-24 h-24 rounded-full ${config.iconBg} flex items-center justify-center mx-auto mb-6`}>
            <Icon className={`w-14 h-14 ${config.iconColor}`} />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-[#1F2430] mb-4">{config.title}</h1>

          {/* Message */}
          <p className="text-[#4F5868] mb-8">{config.message}</p>

          {/* Additional info for accepted state */}
          {state === 'accepted' && (
            <div className="bg-[#F4EEFD] rounded-2xl p-6 mb-8 text-left">
              <h3 className="font-semibold text-[#1F2430] mb-3">What happens next?</h3>
              <ul className="space-y-2 text-sm text-[#4F5868]">
                <li className="flex gap-2">
                  <span className="text-[#7A42E8]">•</span>
                  <span>Your booking has been added to the artist's calendar</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#7A42E8]">•</span>
                  <span>You'll receive a confirmation email shortly</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#7A42E8]">•</span>
                  <span>The artist will send you an invoice with payment details</span>
                </li>
              </ul>
            </div>
          )}

          {/* Back to Home */}
          <button
            onClick={() => navigate('/')}
            className="w-full px-8 py-4 rounded-2xl bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white font-semibold hover:shadow-lg transition-all"
          >
            {state === 'accepted' ? 'Great!' : 'Go to Homepage'}
          </button>

          {/* Support Link */}
          {(state === 'invalid' || state === 'error' || state === 'expired') && (
            <p className="mt-6 text-sm text-[#7A7F8C]">
              Need help?{' '}
              <a href="mailto:support@museio.app" className="text-[#7A42E8] hover:underline">
                Contact Support
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
