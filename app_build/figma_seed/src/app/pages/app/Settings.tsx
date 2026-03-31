import { useState, useRef } from 'react';
import { Settings as SettingsIcon, User, FileText, CreditCard, Mail, ExternalLink, Calendar, ChevronRight, Upload, Check, AlertCircle, Lock, Receipt } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useSearchParams, useNavigate } from 'react-router';

type SettingsTab = 'account' | 'invoice' | 'banking' | 'emails' | 'tax' | 'security';

export function Settings() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as SettingsTab) || 'account';
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const { user, updateUser, invoiceSettings, updateInvoiceSettings, bankDetails, updateBankDetails, notificationSettings, updateNotificationSettings } = useApp();
  
  // Ref for scrolling to content
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Form states
  const [saveStatus, setSaveStatus] = useState<{ [key: string]: 'idle' | 'saving' | 'success' | 'error' }>({});
  const [logoPreview, setLogoPreview] = useState<string | null>(invoiceSettings.logoUrl || null);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [taxSettings, setTaxSettings] = useState({
    gstRegistered: false,
    abn: '',
    gstRate: 10,
    taxInvoicePrefix: 'INV-',
  });

  const tabs = [
    { id: 'account' as SettingsTab, label: 'Account', icon: User },
    { id: 'invoice' as SettingsTab, label: 'Invoice', icon: FileText },
    { id: 'banking' as SettingsTab, label: 'Banking', icon: CreditCard },
    { id: 'tax' as SettingsTab, label: 'Tax & GST', icon: Receipt },
    { id: 'emails' as SettingsTab, label: 'Emails', icon: Mail },
    { id: 'security' as SettingsTab, label: 'Security', icon: Lock },
  ];

  const handleConnectStripe = () => {
    // Simulate Stripe onboarding
    window.location.href = '/stripe-callback?status=success';
  };

  const handleSave = async (section: string) => {
    setSaveStatus({ ...saveStatus, [section]: 'saving' });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mark completion flags based on section
    if (section === 'account' && user) {
      const isComplete = !!(user.firstName && user.lastName && user.email && user.phone);
      updateUser({ profileComplete: isComplete });
    } else if (section === 'invoice') {
      const isComplete = !!(invoiceSettings.signature);
      updateUser({ invoiceDetailsComplete: isComplete });
    } else if (section === 'banking') {
      const isComplete = !!(bankDetails.accountHolderName && bankDetails.bsb && bankDetails.accountNumber);
      updateUser({ bankDetailsComplete: isComplete });
    }
    
    setSaveStatus({ ...saveStatus, [section]: 'success' });
    
    // Reset to idle after 2 seconds
    setTimeout(() => {
      setSaveStatus({ ...saveStatus, [section]: 'idle' });
    }, 2000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        updateInvoiceSettings({ logoUrl: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      alert('Passwords do not match');
      return;
    }
    
    if (passwords.new.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }

    await handleSave('security');
    setPasswords({ current: '', new: '', confirm: '' });
  };

  // Handle shortcut click with smooth scroll
  const handleShortcutClick = (tab: SettingsTab) => {
    setActiveTab(tab);
    
    // Smooth scroll to content after a short delay to allow tab change
    setTimeout(() => {
      contentRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
      });
    }, 100);
  };

  const SaveButton = ({ section, onClick }: { section: string; onClick?: () => void }) => {
    const status = saveStatus[section] || 'idle';
    
    return (
      <button
        onClick={onClick || (() => handleSave(section))}
        disabled={status === 'saving'}
        className={`w-full px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
          status === 'success'
            ? 'bg-green-500 text-white'
            : status === 'saving'
            ? 'bg-[#A4A9B6] text-white cursor-not-allowed'
            : 'bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white hover:shadow-lg'
        }`}
      >
        {status === 'saving' && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
        {status === 'success' && <Check className="w-5 h-5" />}
        <span>
          {status === 'saving' ? 'Saving...' : status === 'success' ? 'Saved!' : 'Save Changes'}
        </span>
      </button>
    );
  };

  // Calculate setup completion percentage
  const completedSteps = [
    user?.profileComplete,
    user?.invoiceDetailsComplete,
    user?.bankDetailsComplete
  ].filter(Boolean).length;
  const totalSteps = 3;
  const completionPercentage = Math.round((completedSteps / totalSteps) * 100);

  // Circular progress gauge component
  const CircularGauge = ({ percentage }: { percentage: number }) => {
    const radius = 48;
    const strokeWidth = 8;
    const normalizedRadius = radius - strokeWidth / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative flex items-center justify-center">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            stroke="#E3DBF9"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Progress circle */}
          <circle
            stroke="url(#gradient)"
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease' }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8F6EE6" />
              <stop offset="100%" stopColor="#7A42E8" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#7A42E8]">{percentage}%</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <SettingsIcon className="w-8 h-8 text-[#7A42E8]" />
          <h1 className="text-3xl font-bold text-[#1F2430]">Settings</h1>
        </div>

        {/* Onboarding Progress */}
        <div className="bg-gradient-to-br from-[#F4EEFD] to-[#E3DBF9] rounded-2xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Circular Gauge */}
            <div className="flex-shrink-0">
              <CircularGauge percentage={completionPercentage} />
            </div>
            
            {/* Progress Cards */}
            <div className="flex-1 w-full">
              <h3 className="font-semibold text-[#1F2430] mb-4">Account Setup Progress</h3>
              <div className="space-y-3">
                {/* Profile Card */}
                <button
                  onClick={() => !user?.profileComplete && handleShortcutClick('account')}
                  disabled={user?.profileComplete}
                  className={`w-full p-4 rounded-xl transition-all text-left ${
                    user?.profileComplete 
                      ? 'bg-[#45C05A]/10 border-2 border-[#45C05A] cursor-default' 
                      : 'bg-white border-2 border-[#DDDCE7] hover:border-[#7A42E8] hover:shadow-md cursor-pointer active:scale-[0.98]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#7A7F8C] uppercase tracking-wide mb-1">Profile</div>
                      <div className={`font-semibold ${user?.profileComplete ? 'text-[#45C05A]' : 'text-[#7A7F8C]'}`}>
                        {user?.profileComplete ? 'Complete' : 'Incomplete'}
                      </div>
                    </div>
                    {user?.profileComplete ? (
                      <div className="w-8 h-8 rounded-full bg-[#45C05A] flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    ) : (
                      <ChevronRight className="w-5 h-5 text-[#7A42E8]" />
                    )}
                  </div>
                </button>

                {/* Invoice Card */}
                <button
                  onClick={() => !user?.invoiceDetailsComplete && handleShortcutClick('invoice')}
                  disabled={user?.invoiceDetailsComplete}
                  className={`w-full p-4 rounded-xl transition-all text-left ${
                    user?.invoiceDetailsComplete 
                      ? 'bg-[#45C05A]/10 border-2 border-[#45C05A] cursor-default' 
                      : 'bg-white border-2 border-[#DDDCE7] hover:border-[#7A42E8] hover:shadow-md cursor-pointer active:scale-[0.98]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#7A7F8C] uppercase tracking-wide mb-1">Invoice</div>
                      <div className={`font-semibold ${user?.invoiceDetailsComplete ? 'text-[#45C05A]' : 'text-[#7A7F8C]'}`}>
                        {user?.invoiceDetailsComplete ? 'Complete' : 'Incomplete'}
                      </div>
                    </div>
                    {user?.invoiceDetailsComplete ? (
                      <div className="w-8 h-8 rounded-full bg-[#45C05A] flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    ) : (
                      <ChevronRight className="w-5 h-5 text-[#7A42E8]" />
                    )}
                  </div>
                </button>

                {/* Banking Card */}
                <button
                  onClick={() => !user?.bankDetailsComplete && handleShortcutClick('banking')}
                  disabled={user?.bankDetailsComplete}
                  className={`w-full p-4 rounded-xl transition-all text-left ${
                    user?.bankDetailsComplete 
                      ? 'bg-[#45C05A]/10 border-2 border-[#45C05A] cursor-default' 
                      : 'bg-white border-2 border-[#DDDCE7] hover:border-[#7A42E8] hover:shadow-md cursor-pointer active:scale-[0.98]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#7A7F8C] uppercase tracking-wide mb-1">Banking</div>
                      <div className={`font-semibold ${user?.bankDetailsComplete ? 'text-[#45C05A]' : 'text-[#7A7F8C]'}`}>
                        {user?.bankDetailsComplete ? 'Complete' : 'Incomplete'}
                      </div>
                    </div>
                    {user?.bankDetailsComplete ? (
                      <div className="w-8 h-8 rounded-full bg-[#45C05A] flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    ) : (
                      <ChevronRight className="w-5 h-5 text-[#7A42E8]" />
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Connected Calendars Entry Point */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/app/connected-calendars')}
            className="w-full p-5 rounded-2xl bg-white border border-[#DDDCE7] hover:border-[#7A42E8] transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-sky-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-[#1F2430] mb-1">Connected Calendars</h3>
                <p className="text-sm text-[#7A7F8C]">Sync Google Calendar and Calendly</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#7A7F8C] group-hover:text-[#7A42E8] transition-colors" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleShortcutClick(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#7A42E8] text-white'
                    : 'bg-white text-[#4F5868] border border-[#DDDCE7] hover:border-[#8F6EE6]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl border border-[#DDDCE7] p-8" ref={contentRef}>
          {/* Account Tab */}
          {activeTab === 'account' && user && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#1F2430] mb-2">First Name</label>
                  <input
                    type="text"
                    value={user.firstName}
                    onChange={(e) => updateUser({ firstName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1F2430] mb-2">Last Name</label>
                  <input
                    type="text"
                    value={user.lastName}
                    onChange={(e) => updateUser({ lastName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2430] mb-2">Email</label>
                <input
                  type="email"
                  value={user.email}
                  onChange={(e) => updateUser({ email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2430] mb-2">Phone</label>
                <input
                  type="tel"
                  value={user.phone}
                  onChange={(e) => updateUser({ phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2430] mb-2">Company (Optional)</label>
                <input
                  type="text"
                  value={user.company || ''}
                  onChange={(e) => updateUser({ company: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2430] mb-2">
                  Public Username
                  <span className="ml-2 text-xs text-[#7A7F8C]">For your portfolio URL</span>
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-[#7A7F8C]">{window.location.origin}/</span>
                  <input
                    type="text"
                    value={user.username || ''}
                    onChange={(e) => updateUser({ username: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') })}
                    placeholder="yourname"
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
                  />
                </div>
              </div>
              <SaveButton section="account" />
            </div>
          )}

          {/* Invoice Tab */}
          {activeTab === 'invoice' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#1F2430] mb-2">Invoice Signature</label>
                <input
                  type="text"
                  value={invoiceSettings.signature}
                  onChange={(e) => updateInvoiceSettings({ signature: e.target.value })}
                  placeholder="Your signature"
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2430] mb-2">Company Name (Optional)</label>
                <input
                  type="text"
                  value={invoiceSettings.companyName || ''}
                  onChange={(e) => updateInvoiceSettings({ companyName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2430] mb-2">Business Details</label>
                <textarea
                  value={invoiceSettings.businessDetails || ''}
                  onChange={(e) => updateInvoiceSettings({ businessDetails: e.target.value })}
                  placeholder="ABN, Address, etc."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2430] mb-2">Default Payment Terms (days)</label>
                <input
                  type="number"
                  value={invoiceSettings.defaultDueDays}
                  onChange={(e) => updateInvoiceSettings({ defaultDueDays: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="block text-sm font-medium text-[#1F2430] mb-2">Invoice Logo (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="px-4 py-2 rounded-lg border border-[#7A42E8] text-[#7A42E8] font-medium hover:bg-[#7A42E8]/10 flex items-center gap-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Logo</span>
                </label>
                {logoPreview && (
                  <div className="flex items-center gap-2">
                    <img
                      src={logoPreview}
                      alt="Logo Preview"
                      className="w-10 h-10 object-cover rounded-full"
                    />
                    <button
                      onClick={() => {
                        setLogoPreview(null);
                        updateInvoiceSettings({ logoUrl: null });
                      }}
                      className="px-2 py-1 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
              <SaveButton section="invoice" />
            </div>
          )}

          {/* Banking Tab */}
          {activeTab === 'banking' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#1F2430] mb-2">Account Holder Name</label>
                <input
                  type="text"
                  value={bankDetails.accountHolderName}
                  onChange={(e) => updateBankDetails({ accountHolderName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#1F2430] mb-2">BSB Number</label>
                  <input
                    type="text"
                    value={bankDetails.bsb}
                    onChange={(e) => updateBankDetails({ bsb: e.target.value })}
                    placeholder="123-456"
                    className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1F2430] mb-2">Account Number</label>
                  <input
                    type="text"
                    value={bankDetails.accountNumber}
                    onChange={(e) => updateBankDetails({ accountNumber: e.target.value })}
                    placeholder="12345678"
                    className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
                  />
                </div>
              </div>

              {/* Stripe Connection */}
              <div className="border-t border-[#DDDCE7] pt-6 mt-6">
                <h3 className="font-semibold text-[#1F2430] mb-4">Stripe Payment Processing</h3>
                {bankDetails.stripeConnected ? (
                  <div className="p-6 rounded-2xl bg-[#45C05A]/5 border-2 border-[#45C05A]">
                    <div className="space-y-4">
                      <div>
                        <div className="font-semibold text-[#45C05A] mb-1">Connected</div>
                        <div className="text-sm text-[#4F5868]">Account ID: {bankDetails.stripeAccountId}</div>
                      </div>
                      <a
                        href="https://dashboard.stripe.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#45C05A] text-[#45C05A] font-medium hover:bg-[#45C05A]/10 transition-colors"
                      >
                        <span>Dashboard</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-[#F4EEFD] border-2 border-[#DDDCE7]">
                    <p className="text-[#4F5868] mb-4">
                      Connect your Stripe account to accept online payments from clients.
                    </p>
                    <button
                      onClick={handleConnectStripe}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white font-semibold hover:shadow-lg transition-all"
                    >
                      Connect Stripe Account
                    </button>
                  </div>
                )}
              </div>

              <SaveButton section="banking" />
            </div>
          )}

          {/* Emails Tab */}
          {activeTab === 'emails' && (
            <div className="space-y-6">
              <h3 className="font-semibold text-[#1F2430] mb-4">Email Notifications</h3>
              <div className="space-y-4">
                <label className="flex items-center gap-3 p-4 rounded-xl border border-[#DDDCE7] hover:bg-[#F8F9FB] cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={notificationSettings.sendJobConfirmation}
                    onChange={(e) => updateNotificationSettings({ sendJobConfirmation: e.target.checked })}
                    className="w-5 h-5 rounded"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-[#1F2430]">Job Confirmations</div>
                    <div className="text-sm text-[#7A7F8C]">Send confirmation emails when jobs are created</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 rounded-xl border border-[#DDDCE7] hover:bg-[#F8F9FB] cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={notificationSettings.sendJobUpdates}
                    onChange={(e) => updateNotificationSettings({ sendJobUpdates: e.target.checked })}
                    className="w-5 h-5 rounded"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-[#1F2430]">Job Updates</div>
                    <div className="text-sm text-[#7A7F8C]">Send emails when jobs are updated</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 rounded-xl border border-[#DDDCE7] hover:bg-[#F8F9FB] cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={notificationSettings.sendJobCancellations}
                    onChange={(e) => updateNotificationSettings({ sendJobCancellations: e.target.checked })}
                    className="w-5 h-5 rounded"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-[#1F2430]">Job Cancellations</div>
                    <div className="text-sm text-[#7A7F8C]">Send emails when jobs are cancelled</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 rounded-xl border border-[#DDDCE7] hover:bg-[#F8F9FB] cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={notificationSettings.receiveEmailCopies}
                    onChange={(e) => updateNotificationSettings({ receiveEmailCopies: e.target.checked })}
                    className="w-5 h-5 rounded"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-[#1F2430]">Email Copies</div>
                    <div className="text-sm text-[#7A7F8C]">Receive copies of emails sent to clients</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 rounded-xl border border-[#DDDCE7] hover:bg-[#F8F9FB] cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={notificationSettings.receivePushNotifications}
                    onChange={(e) => updateNotificationSettings({ receivePushNotifications: e.target.checked })}
                    className="w-5 h-5 rounded"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-[#1F2430]">Push Notifications</div>
                    <div className="text-sm text-[#7A7F8C]">Receive push notifications for important updates</div>
                  </div>
                </label>
              </div>

              <SaveButton section="emails" />
            </div>
          )}

          {/* Tax Tab */}
          {activeTab === 'tax' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <label className="block text-sm font-medium text-[#1F2430] mb-2">GST Registered</label>
                <input
                  type="checkbox"
                  checked={taxSettings.gstRegistered}
                  onChange={(e) => setTaxSettings({ ...taxSettings, gstRegistered: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
              </div>
              {taxSettings.gstRegistered && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1F2430] mb-2">ABN</label>
                    <input
                      type="text"
                      value={taxSettings.abn}
                      onChange={(e) => setTaxSettings({ ...taxSettings, abn: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1F2430] mb-2">GST Rate (%)</label>
                    <input
                      type="number"
                      value={taxSettings.gstRate}
                      onChange={(e) => setTaxSettings({ ...taxSettings, gstRate: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1F2430] mb-2">Tax Invoice Prefix</label>
                    <input
                      type="text"
                      value={taxSettings.taxInvoicePrefix}
                      onChange={(e) => setTaxSettings({ ...taxSettings, taxInvoicePrefix: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
                    />
                  </div>
                </div>
              )}
              <SaveButton section="tax" />
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#1F2430] mb-2">Current Password</label>
                  <input
                    type="password"
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1F2430] mb-2">New Password</label>
                  <input
                    type="password"
                    value={passwords.new}
                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1F2430] mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-[#DDDCE7] focus:border-[#7A42E8] focus:outline-none"
                  />
                </div>
              </div>
              <SaveButton section="security" onClick={handlePasswordChange} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}