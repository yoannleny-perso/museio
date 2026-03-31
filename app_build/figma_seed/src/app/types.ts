// Core domain types for Museio

export type JobStatus = 'requested' | 'drafted' | 'upcoming' | 'past' | 'invoice-sent' | 'paid' | 'deleted';

export type RequestStatus = 'pending' | 'quoted' | 'declined' | 'accepted';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  username?: string;
  company?: string;
  profileComplete: boolean;
  invoiceDetailsComplete: boolean;
  bankDetailsComplete: boolean;
}

export interface Client {
  id: string;
  venueName: string;
  contactName: string;
  email: string;
  phone: string;
  location: string;
}

export interface LineItem {
  id: string;
  name: string;
  unitCost: number;
  quantity: number;
  taxEnabled: boolean;
}

export interface Job {
  id: string;
  title: string;
  jobNumber: string;
  status: JobStatus;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  clientId?: string;
  lineItems: LineItem[];
  discountPercent: number;
  notes: string;
  invoiceSent?: boolean;
  invoiceSentDate?: string;
  paid?: boolean;
  paidDate?: string;
}

export interface BookingRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  eventName: string;
  eventDescription: string;
  location: string;
  budget: string;
  date: string;
  time: string;
  status: RequestStatus;
  quotedAmount?: number;
  quotedMessage?: string;
  quotedDate?: string;
}

export interface PortfolioSection {
  id: string;
  type: 'hero' | 'bio' | 'social' | 'photos' | 'videos' | 'featured' | 'music' | 'events' | 'booking' | 'smartlinks' | 'custom';
  title?: string;
  enabled: boolean;
  order: number;
  content: any;
}

export interface Portfolio {
  userId: string;
  isPublic: boolean;
  artistName: string;
  portraitUrl?: string;
  bio: string;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    youtube?: string;
    spotify?: string;
  };
  sections: PortfolioSection[];
}

export interface TimeSlot {
  start: string;
  end: string;
}

export interface DayAvailability {
  enabled: boolean;
  slots: TimeSlot[];
}

export interface WeekAvailability {
  monday: DayAvailability;
  tuesday: DayAvailability;
  wednesday: DayAvailability;
  thursday: DayAvailability;
  friday: DayAvailability;
  saturday: DayAvailability;
  sunday: DayAvailability;
}

export interface VacationPeriod {
  id: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface AvailabilitySettings {
  minimumNoticeHours: number;
  bookingBufferMinutes: number;
  breaksEnabled: boolean;
  defaultBreakMinutes: number;
}

export interface InvoiceSettings {
  signature: string;
  companyName?: string;
  logoUrl?: string;
  businessDetails?: string;
  defaultDueDays: number;
}

export interface BankDetails {
  accountHolderName: string;
  bsb: string;
  accountNumber: string;
  stripeConnected: boolean;
  stripeAccountId?: string;
}

export interface NotificationSettings {
  sendJobConfirmation: boolean;
  sendJobUpdates: boolean;
  sendJobCancellations: boolean;
  receiveEmailCopies: boolean;
  receivePushNotifications: boolean;
}

export interface FinanceData {
  totalEarnings: number;
  periodStart: string;
  periodEnd: string;
  forecast: number;
  forecastPeriod: 'weekly' | 'monthly';
  upcomingJobs: Job[];
}

// V2 Feature Types: Tax Centre & ATO Reporting
export interface TaxSettings {
  gstRegistered: boolean;
  abn?: string;
  gstRegistrationDate?: string;
  reportingCadence: 'monthly' | 'quarterly' | 'annual';
  defaultTaxMode: 'cash' | 'accrual';
  taxReserveEnabled: boolean;
}

export interface TaxPeriodReport {
  id: string;
  periodStart: string;
  periodEnd: string;
  gstCollected: number;
  gstPayable: number;
  gstFreeRevenue: number;
  taxableRevenue: number;
  adjustments: number;
  reconciliationStatus: 'matched' | 'partial' | 'manual';
  exported: boolean;
  exportedDate?: string;
}

export interface TaxTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  gstAmount: number;
  classification: 'taxable' | 'gst-free' | 'out-of-scope' | 'needs-review';
  jobId?: string;
}

export interface GSTHealthScore {
  score: number;
  readinessLevel: 'ready' | 'needs-attention' | 'not-ready';
  unclassifiedTransactions: number;
  missingABN: boolean;
  conflictingGSTModes: number;
}

// V2 Feature Types: Connected Calendars
export interface ConnectedCalendar {
  id: string;
  source: 'google' | 'calendly' | 'gmail';
  accountEmail: string;
  syncStatus: 'active' | 'refreshing' | 'stale' | 'permission-error' | 'disconnected';
  lastSyncDate?: string;
  isBlocking: boolean;
  includeTentative: boolean;
  privacyMaskEnabled: boolean;
  calendars: CalendarSource[];
}

export interface CalendarSource {
  id: string;
  name: string;
  color: string;
  enabled: boolean;
  isBlocking: boolean;
}

export interface ExternalEvent {
  id: string;
  source: 'google' | 'calendly';
  title: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'tentative';
  maskedTitle?: string;
  calendarId: string;
  ignored: boolean;
}

export interface CalendarConflict {
  id: string;
  date: string;
  internalEventId: string;
  externalEventId: string;
  conflictType: 'overlap' | 'duplicate';
  resolved: boolean;
}

// V2 Feature Types: Multi-slot Booking
export interface BookingSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'available' | 'unavailable' | 'selected';
  conflictReason?: string;
}

export interface MultiSlotBookingRequest extends Omit<BookingRequest, 'date' | 'time'> {
  bookingType: 'single' | 'multiple' | 'residency';
  slots: BookingSlot[];
  packageDiscount?: number;
}

// V2 Feature Types: Invoice Attachments
export interface InvoiceAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  attachmentType: 'receipt' | 'contract' | 'stage-plot' | 'tech-spec' | 'rider' | 'other';
  uploadDate: string;
  url: string;
  includeInEmail: boolean;
}

// V2 Feature Types: In-app Chat & Messages
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'artist' | 'client' | 'system';
  content: string;
  timestamp: string;
  read: boolean;
  systemEventType?: 'quote-sent' | 'deposit-paid' | 'invoice-viewed' | 'slot-changed' | 'job-confirmed';
}

export interface Conversation {
  id: string;
  jobId?: string;
  clientId?: string;
  clientName: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  messages: Message[];
}

// V2 Feature Types: Shareable Job Cards
export interface ShareableJobCard {
  id: string;
  jobId: string;
  cardType: 'job-summary' | 'quote' | 'invoice';
  token: string;
  expiryDate?: string;
  viewCount: number;
  actionCompleted: boolean;
  createdDate: string;
  settings: {
    hidePrice?: boolean;
    showDepositOnly?: boolean;
    showDueDate?: boolean;
    showArtistAvatar?: boolean;
  };
}

// V2 Feature Types: Deposits & Payment Plans
export interface DepositSchedule {
  id: string;
  jobId: string;
  depositAmount: number;
  depositType: 'percentage' | 'fixed';
  depositDueDate: string;
  depositPaid: boolean;
  depositPaidDate?: string;
  balanceAmount: number;
  balanceDueDate?: string;
  balancePaid: boolean;
  balancePaidDate?: string;
}

// V2 Feature Types: Split Payments
export interface PayoutBeneficiary {
  id: string;
  role: 'artist' | 'promoter' | 'agent' | 'platform' | 'other';
  name: string;
  accountStatus: 'verified' | 'pending' | 'invalid';
  amount: number;
  amountType: 'percentage' | 'fixed';
  stripeAccountId?: string;
}

export interface SplitPaymentRule {
  id: string;
  name: string;
  jobId?: string;
  beneficiaries: PayoutBeneficiary[];
  isTemplate: boolean;
  createdDate: string;
}

export interface PayoutAuditEntry {
  id: string;
  jobId: string;
  paymentId: string;
  timestamp: string;
  grossAmount: number;
  beneficiaryPayouts: {
    beneficiaryId: string;
    amount: number;
    status: 'completed' | 'pending' | 'failed';
  }[];
}