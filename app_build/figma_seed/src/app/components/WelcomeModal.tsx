import { Sparkles, CheckCircle2, Circle, Settings, X } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';

export function WelcomeModal() {
  const navigate = useNavigate();
  const { user, dismissWelcomePopup } = useApp();

  if (!user) return null;

  const handleTakeToSettings = () => {
    dismissWelcomePopup(false);
    navigate('/app/settings');
  };

  const handleSkipForNow = () => {
    dismissWelcomePopup(false);
  };

  const handleDontShowAgain = () => {
    dismissWelcomePopup(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full my-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 sm:p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#A78BFA] to-[#8B5CF6] flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center mb-4 bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] bg-clip-text text-transparent">
            Welcome to MUSEIO
          </h2>

          {/* Description */}
          <p className="text-center text-[#4F5868] mb-8 leading-relaxed">
            We're excited to have you here. To get the most out of MUSEIO, let's set up your account with these essential details for invoicing and mailing:
          </p>

          {/* Checklist */}
          <div className="space-y-6 mb-8">
            {/* Personal account */}
            <div className="flex gap-4">
              {user.profileComplete ? (
                <CheckCircle2 className="w-6 h-6 text-[#10B981] flex-shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-6 h-6 text-[#DDDCE7] flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-[#1F2430]">Personal account</span>
                  <span className="text-xs font-semibold text-[#8B5CF6] uppercase">Required</span>
                </div>
                <p className="text-sm text-[#7A7F8C]">
                  So clients know who they're working with.
                </p>
              </div>
            </div>

            {/* Invoicing Details */}
            <div className="flex gap-4">
              {user.invoiceDetailsComplete ? (
                <CheckCircle2 className="w-6 h-6 text-[#10B981] flex-shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-6 h-6 text-[#DDDCE7] flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-[#1F2430]">Invoicing Details</span>
                  <span className="text-xs font-semibold text-[#8B5CF6] uppercase">Required</span>
                </div>
                <p className="text-sm text-[#7A7F8C]">
                  Add your signature, optionally your company name, logo, and business details to make your invoices look professional.
                </p>
              </div>
            </div>

            {/* Bank Account */}
            <div className="flex gap-4">
              {user.bankDetailsComplete ? (
                <CheckCircle2 className="w-6 h-6 text-[#10B981] flex-shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-6 h-6 text-[#DDDCE7] flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-[#1F2430]">Bank Account</span>
                  <span className="text-xs font-semibold text-[#8B5CF6] uppercase">Required</span>
                </div>
                <p className="text-sm text-[#7A7F8C]">
                  Make it easy to get paid by telling your clients exactly where to send the money.
                </p>
              </div>
            </div>
          </div>

          {/* Primary Action */}
          <button
            onClick={handleTakeToSettings}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 mb-3"
          >
            <Settings className="w-5 h-5" />
            <span>Take me to Settings</span>
          </button>

          {/* Skip for now */}
          <button
            onClick={handleSkipForNow}
            className="w-full py-3 text-[#4F5868] font-medium hover:text-[#1F2430] transition-colors mb-3"
          >
            Skip for now
          </button>

          {/* Don't show this again */}
          <button
            onClick={handleDontShowAgain}
            className="w-full py-3 text-[#7A7F8C] hover:text-[#1F2430] transition-colors flex items-center justify-center gap-2 mb-6"
          >
            <X className="w-4 h-4" />
            <span>Don't show this again</span>
          </button>

          {/* Footer note */}
          <p className="text-xs text-center text-[#A4A9B6]">
            You can access these settings anytime<br />from the Settings page
          </p>
        </div>
      </div>
    </div>
  );
}