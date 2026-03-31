import { Outlet, useLocation, useNavigate } from 'react-router';
import {
  Home, Briefcase, Image, DollarSign, MoreHorizontal, Users, Calendar,
  Settings as SettingsIcon, X, MessageSquare, Link as LinkIcon, FileText, ChevronRight,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { WelcomeModal } from './WelcomeModal';
import { useApp } from '../context/AppContext';

const tabs = [
  { id: 'home',      label: 'Home',      icon: Home,          path: '/app/home' },
  { id: 'jobs',      label: 'Jobs',      icon: Briefcase,     path: '/app/jobs' },
  { id: 'portfolio', label: 'Portfolio', icon: Image,         path: '/app/portfolio' },
  { id: 'finance',   label: 'Finance',   icon: DollarSign,    path: '/app/finance' },
  { id: 'more',      label: 'More',      icon: MoreHorizontal,path: '/app/more' },
];

const moreOptions = [
  { id: 'clients',    label: 'Clients',             icon: Users,         path: '/app/clients',             subtitle: 'Manage your client CRM' },
  { id: 'messages',   label: 'Messages',            icon: MessageSquare, path: '/app/messages',            subtitle: 'Conversations with clients' },
  { id: 'availability',label: 'My Availability',    icon: Calendar,      path: '/app/availability',        subtitle: 'Set your working hours' },
  { id: 'calendars',  label: 'Connected Calendars', icon: LinkIcon,      path: '/app/connected-calendars', subtitle: 'Google Calendar & Calendly sync' },
  { id: 'tax',        label: 'Tax Centre',          icon: FileText,      path: '/app/tax-centre',          subtitle: 'GST, BAS and ATO reporting' },
  { id: 'settings',   label: 'Settings',            icon: SettingsIcon,  path: '/app/settings',            subtitle: 'Account and preferences' },
];

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showWelcomePopup } = useApp();
  const [showMoreSheet, setShowMoreSheet] = useState(false);

  const getActiveTab = () => {
    const path = location.pathname;
    if (
      path.includes('/clients') ||
      path.includes('/messages') ||
      path.includes('/availability') ||
      path.includes('/connected-calendars') ||
      path.includes('/tax-centre') ||
      path.includes('/settings')
    ) return 'more';
    const tab = tabs.find(t => path.startsWith(t.path));
    return tab?.id || 'home';
  };

  const activeTab = getActiveTab();

  const handleTabClick = (tab: typeof tabs[0]) => {
    if (tab.id === 'more') {
      setShowMoreSheet(true);
    } else {
      navigate(tab.path);
    }
  };

  const handleMoreOptionClick = (option: typeof moreOptions[0]) => {
    setShowMoreSheet(false);
    navigate(option.path);
  };

  useEffect(() => {
    if (location.pathname === '/app' || location.pathname === '/app/') {
      navigate('/app/home');
    }
  }, [location.pathname, navigate]);

  // Unread message badge (mock)
  const unreadMessages = 3;

  return (
    <div className="h-screen flex flex-col md:flex-row bg-[#F8F9FB]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-white border-r border-[#DDDCE7] flex-shrink-0">
        {/* Logo */}
        <div className="p-6 border-b border-[#DDDCE7]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-light to-brand flex items-center justify-center">
              <span className="font-bold text-white text-lg">M</span>
            </div>
            <span className="font-bold text-lg text-[#1F2430]">Museio</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {tabs.filter(tab => tab.id !== 'more').map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => navigate(tab.path)}
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 ${ 
                    isActive ? 'bg-brand-lighter text-brand' : 'text-[#4F5868] hover:bg-[#F8F9FB]'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}

            {/* Divider */}
            <div className="pt-4 border-t border-[#DDDCE7] mt-4 space-y-1">
              <p className="px-4 text-[10px] font-semibold text-[#A4A9B6] uppercase tracking-widest mb-2">More</p>
              {moreOptions.map((option) => {
                const Icon = option.icon;
                const isActive = location.pathname.startsWith(option.path);
                return (
                  <button
                    key={option.id}
                    onClick={() => navigate(option.path)}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-colors relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 ${ 
                      isActive ? 'bg-brand-lighter text-brand' : 'text-[#4F5868] hover:bg-[#F8F9FB]'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium text-sm">{option.label}</span>
                    {option.id === 'messages' && unreadMessages > 0 && (
                      <span className="ml-auto w-5 h-5 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center">
                        {unreadMessages}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[#DDDCE7]">
          <button
            onClick={() => navigate('/app/settings')}
            className="w-full flex items-center gap-4 px-2 py-2 rounded-xl hover:bg-[#F8F9FB] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-light to-brand flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-[#1F2430] truncate">Artist</div>
              <div className="text-xs text-[#7A7F8C]">Settings</div>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-20 md:pb-0 min-w-0">
        <Outlet />
      </main>

      {/* Mobile Bottom Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#DDDCE7] z-20">
        <div className="flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors relative min-w-[52px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 ${
                  isActive ? 'text-brand' : 'text-[#7A7F8C]'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5]' : ''}`} />
                  {tab.id === 'more' && unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand text-white text-[9px] font-bold flex items-center justify-center">
                      {unreadMessages}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* More Sheet — Mobile */}
      {showMoreSheet && (
        <div className="md:hidden fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowMoreSheet(false)} />
          <div className="relative w-full bg-white rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-center pt-4 pb-2">
              <div className="w-12 h-1 rounded-full bg-[#DDDCE7]" />
            </div>
            <div className="px-6 pb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#1F2430]">More</h2>
                <button 
                  onClick={() => setShowMoreSheet(false)} 
                  className="p-2 rounded-full hover:bg-[#F8F9FB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
                >
                  <X className="w-5 h-5 text-[#7A7F8C]" />
                </button>
              </div>
              <div className="space-y-2">
                {moreOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleMoreOptionClick(option)}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-[#F8F9FB] transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
                    >
                      <div className="w-12 h-12 rounded-full bg-brand-lighter flex items-center justify-center flex-shrink-0 relative">
                        <Icon className="w-6 h-6 text-brand" />
                        {option.id === 'messages' && unreadMessages > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand border-2 border-white text-[10px] text-white font-bold flex items-center justify-center">
                            {unreadMessages}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-[#1F2430]">{option.label}</div>
                        <div className="text-sm text-[#7A7F8C]">{option.subtitle}</div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#DDDCE7]" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {showWelcomePopup && <WelcomeModal />}
    </div>
  );
}