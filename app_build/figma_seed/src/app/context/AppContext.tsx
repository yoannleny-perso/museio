import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, Client, Job, BookingRequest, Portfolio, WeekAvailability, VacationPeriod, AvailabilitySettings, InvoiceSettings, BankDetails, NotificationSettings } from '../types';
import { mockUser, mockIncompleteUser, mockClients, mockJobs, mockBookingRequests, mockPortfolio, mockWeekAvailability, mockVacationPeriods, mockAvailabilitySettings, mockInvoiceSettings, mockBankDetails, mockNotificationSettings } from '../data/mockData';

interface AppContextType {
  // Auth
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  
  // Onboarding
  showWelcomePopup: boolean;
  dismissWelcomePopup: (permanent?: boolean) => void;
  
  // Clients
  clients: Client[];
  addClient: (client: Omit<Client, 'id'>) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  
  // Jobs
  jobs: Job[];
  addJob: (job: Omit<Job, 'id'>) => void;
  updateJob: (id: string, job: Partial<Job>) => void;
  deleteJob: (id: string) => void;
  
  // Booking Requests
  bookingRequests: BookingRequest[];
  quoteRequest: (id: string, amount: number, message: string) => void;
  declineRequest: (id: string) => void;
  removeRequest: (id: string) => void;
  
  // Portfolio
  portfolio: Portfolio;
  updatePortfolio: (portfolio: Partial<Portfolio>) => void;
  addPortfolioSection: (section: any) => void;
  updatePortfolioSection: (id: string, section: Partial<any>) => void;
  deletePortfolioSection: (id: string) => void;
  reorderPortfolioSections: (sections: any[]) => void;
  
  // Availability
  weekAvailability: WeekAvailability;
  updateWeekAvailability: (availability: WeekAvailability) => void;
  vacationPeriods: VacationPeriod[];
  addVacationPeriod: (period: Omit<VacationPeriod, 'id'>) => void;
  deleteVacationPeriod: (id: string) => void;
  availabilitySettings: AvailabilitySettings;
  updateAvailabilitySettings: (settings: Partial<AvailabilitySettings>) => void;
  
  // Settings
  invoiceSettings: InvoiceSettings;
  updateInvoiceSettings: (settings: Partial<InvoiceSettings>) => void;
  bankDetails: BankDetails;
  updateBankDetails: (details: Partial<BankDetails>) => void;
  notificationSettings: NotificationSettings;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  updateUser: (user: Partial<User>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>(mockBookingRequests);
  const [portfolio, setPortfolio] = useState<Portfolio>(mockPortfolio);
  const [weekAvailability, setWeekAvailability] = useState<WeekAvailability>(mockWeekAvailability);
  const [vacationPeriods, setVacationPeriods] = useState<VacationPeriod[]>(mockVacationPeriods);
  const [availabilitySettings, setAvailabilitySettings] = useState<AvailabilitySettings>(mockAvailabilitySettings);
  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>(mockInvoiceSettings);
  const [bankDetails, setBankDetails] = useState<BankDetails>(mockBankDetails);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(mockNotificationSettings);

  const login = async (email: string, password: string) => {
    // Mock login - use incomplete user to demonstrate welcome modal
    setIsAuthenticated(true);
    setUser(mockIncompleteUser);
    
    // Show welcome popup if setup incomplete and user hasn't dismissed it permanently
    const setupComplete = mockIncompleteUser.profileComplete && mockIncompleteUser.invoiceDetailsComplete && mockIncompleteUser.bankDetailsComplete;
    const dismissedPermanently = localStorage.getItem('museio_welcome_dismissed') === 'true';
    setShowWelcomePopup(!setupComplete && !dismissedPermanently);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  const dismissWelcomePopup = (permanent?: boolean) => {
    setShowWelcomePopup(false);
    if (permanent) {
      localStorage.setItem('museio_welcome_dismissed', 'true');
    }
  };

  const addClient = (client: Omit<Client, 'id'>) => {
    const newClient = { ...client, id: `c${Date.now()}` };
    setClients([...clients, newClient]);
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients(clients.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteClient = (id: string) => {
    setClients(clients.filter(c => c.id !== id));
  };

  const addJob = (job: Omit<Job, 'id'>) => {
    const newJob = { ...job, id: `j${Date.now()}` };
    setJobs([...jobs, newJob]);
  };

  const updateJob = (id: string, updates: Partial<Job>) => {
    setJobs(jobs.map(j => j.id === id ? { ...j, ...updates } : j));
  };

  const deleteJob = (id: string) => {
    setJobs(jobs.filter(j => j.id !== id));
  };

  const quoteRequest = (id: string, amount: number, message: string) => {
    setBookingRequests(bookingRequests.map(br => 
      br.id === id ? { 
        ...br, 
        status: 'quoted' as const,
        quotedAmount: amount,
        quotedMessage: message,
        quotedDate: new Date().toISOString(),
      } : br
    ));
  };

  const declineRequest = (id: string) => {
    setBookingRequests(bookingRequests.map(br => 
      br.id === id ? { ...br, status: 'declined' as const } : br
    ));
  };

  const removeRequest = (id: string) => {
    setBookingRequests(bookingRequests.filter(br => br.id !== id));
  };

  const updatePortfolio = (updates: Partial<Portfolio>) => {
    setPortfolio({ ...portfolio, ...updates });
  };

  const addPortfolioSection = (section: any) => {
    const newSection = { ...section, id: `s${Date.now()}`, order: portfolio.sections.length };
    setPortfolio({ ...portfolio, sections: [...portfolio.sections, newSection] });
  };

  const updatePortfolioSection = (id: string, updates: Partial<any>) => {
    setPortfolio({
      ...portfolio,
      sections: portfolio.sections.map(s => s.id === id ? { ...s, ...updates } : s),
    });
  };

  const deletePortfolioSection = (id: string) => {
    setPortfolio({
      ...portfolio,
      sections: portfolio.sections.filter(s => s.id !== id),
    });
  };

  const reorderPortfolioSections = (sections: any[]) => {
    setPortfolio({ ...portfolio, sections });
  };

  const updateWeekAvailability = (availability: WeekAvailability) => {
    setWeekAvailability(availability);
  };

  const addVacationPeriod = (period: Omit<VacationPeriod, 'id'>) => {
    const newPeriod = { ...period, id: `v${Date.now()}` };
    setVacationPeriods([...vacationPeriods, newPeriod]);
  };

  const deleteVacationPeriod = (id: string) => {
    setVacationPeriods(vacationPeriods.filter(v => v.id !== id));
  };

  const updateAvailabilitySettings = (settings: Partial<AvailabilitySettings>) => {
    setAvailabilitySettings({ ...availabilitySettings, ...settings });
  };

  const updateInvoiceSettings = (settings: Partial<InvoiceSettings>) => {
    setInvoiceSettings({ ...invoiceSettings, ...settings });
  };

  const updateBankDetails = (details: Partial<BankDetails>) => {
    setBankDetails({ ...bankDetails, ...details });
  };

  const updateNotificationSettings = (settings: Partial<NotificationSettings>) => {
    setNotificationSettings({ ...notificationSettings, ...settings });
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  // Auto-hide welcome popup when setup is complete
  useEffect(() => {
    if (user && isAuthenticated) {
      const setupComplete = user.profileComplete && user.invoiceDetailsComplete && user.bankDetailsComplete;
      if (setupComplete && showWelcomePopup) {
        setShowWelcomePopup(false);
      }
    }
  }, [user?.profileComplete, user?.invoiceDetailsComplete, user?.bankDetailsComplete, isAuthenticated]);

  return (
    <AppContext.Provider value={{
      isAuthenticated,
      user,
      login,
      logout,
      showWelcomePopup,
      dismissWelcomePopup,
      clients,
      addClient,
      updateClient,
      deleteClient,
      jobs,
      addJob,
      updateJob,
      deleteJob,
      bookingRequests,
      quoteRequest,
      declineRequest,
      removeRequest,
      portfolio,
      updatePortfolio,
      addPortfolioSection,
      updatePortfolioSection,
      deletePortfolioSection,
      reorderPortfolioSections,
      weekAvailability,
      updateWeekAvailability,
      vacationPeriods,
      addVacationPeriod,
      deleteVacationPeriod,
      availabilitySettings,
      updateAvailabilitySettings,
      invoiceSettings,
      updateInvoiceSettings,
      bankDetails,
      updateBankDetails,
      notificationSettings,
      updateNotificationSettings,
      updateUser,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}