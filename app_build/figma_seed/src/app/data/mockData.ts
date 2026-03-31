// Mock data for realistic testing
import { User, Client, Job, BookingRequest, Portfolio, WeekAvailability, VacationPeriod, AvailabilitySettings, InvoiceSettings, BankDetails, NotificationSettings } from '../types';

// V3 Portfolio exports
export { mockPortfolioV3, mockPortfolioV3Blocks, mockPortfolioV3Insights } from './mockPortfolioV3';

export const mockUser: User = {
  id: '1',
  email: 'alex.rivers@example.com',
  firstName: 'Alex',
  lastName: 'Rivers',
  phone: '+61 412 345 678',
  username: 'alexrivers',
  company: 'Rivers Entertainment',
  profileComplete: true,
  invoiceDetailsComplete: true,
  bankDetailsComplete: true,
};

export const mockIncompleteUser: User = {
  id: '2',
  email: 'newuser@example.com',
  firstName: 'New',
  lastName: 'User',
  phone: '',
  profileComplete: false,
  invoiceDetailsComplete: false,
  bankDetailsComplete: false,
};

export const mockClients: Client[] = [
  {
    id: 'c1',
    venueName: 'The Grand Ballroom',
    contactName: 'Sarah Mitchell',
    email: 'sarah@grandballroom.com',
    phone: '+61 423 456 789',
    location: 'Sydney, NSW',
  },
  {
    id: 'c2',
    venueName: 'Skyline Events',
    contactName: 'James Chen',
    email: 'james@skylineevents.com.au',
    phone: '+61 434 567 890',
    location: 'Melbourne, VIC',
  },
  {
    id: 'c3',
    venueName: 'Beachside Weddings Co.',
    contactName: 'Emma Thompson',
    email: 'emma@beachsideweddings.com',
    phone: '+61 445 678 901',
    location: 'Gold Coast, QLD',
  },
];

export const mockJobs: Job[] = [
  {
    id: 'j1',
    title: 'Corporate Gala Night',
    jobNumber: 'MUS-2026-001',
    status: 'upcoming',
    startDate: '2026-03-28',
    endDate: '2026-03-28',
    startTime: '19:00',
    endTime: '23:00',
    clientId: 'c1',
    lineItems: [
      { id: 'li1', name: 'DJ Service', unitCost: 1200, quantity: 1, taxEnabled: true },
      { id: 'li2', name: 'Sound System', unitCost: 500, quantity: 1, taxEnabled: true },
    ],
    discountPercent: 0,
    notes: 'Premium sound system required. Client prefers house and R&B mix.',
  },
  {
    id: 'j2',
    title: 'Beach Wedding Reception',
    jobNumber: 'MUS-2026-002',
    status: 'upcoming',
    startDate: '2026-04-05',
    endDate: '2026-04-05',
    startTime: '16:00',
    endTime: '22:00',
    clientId: 'c3',
    lineItems: [
      { id: 'li3', name: 'DJ Service', unitCost: 1500, quantity: 1, taxEnabled: true },
      { id: 'li4', name: 'Wireless Microphones', unitCost: 150, quantity: 2, taxEnabled: true },
    ],
    discountPercent: 10,
    notes: 'Outdoor venue, weather contingency plan in place.',
  },
  {
    id: 'j3',
    title: 'Music Festival - 3 Day Event',
    jobNumber: 'MUS-2026-003',
    status: 'upcoming',
    startDate: '2026-04-15',
    endDate: '2026-04-17',
    startTime: '14:00',
    endTime: '23:00',
    clientId: 'c2',
    lineItems: [
      { id: 'li5', name: 'DJ Service - Day 1', unitCost: 2000, quantity: 1, taxEnabled: true },
      { id: 'li6', name: 'DJ Service - Day 2', unitCost: 2000, quantity: 1, taxEnabled: true },
      { id: 'li7', name: 'DJ Service - Day 3', unitCost: 2000, quantity: 1, taxEnabled: true },
      { id: 'li8', name: 'Equipment Rental', unitCost: 1500, quantity: 1, taxEnabled: true },
    ],
    discountPercent: 5,
    notes: 'Multi-day festival. Full setup required.',
  },
  {
    id: 'j4',
    title: 'Private Birthday Party',
    jobNumber: 'MUS-2026-004',
    status: 'invoice-sent',
    startDate: '2026-03-15',
    endDate: '2026-03-15',
    startTime: '20:00',
    endTime: '01:00',
    clientId: 'c1',
    lineItems: [
      { id: 'li9', name: 'DJ Service', unitCost: 800, quantity: 1, taxEnabled: true },
    ],
    discountPercent: 0,
    notes: '50th birthday celebration. Mix of 80s and 90s music.',
    invoiceSent: true,
    invoiceSentDate: '2026-03-16',
  },
  {
    id: 'j5',
    title: 'New Year\'s Eve Celebration',
    jobNumber: 'MUS-2025-025',
    status: 'paid',
    startDate: '2025-12-31',
    endDate: '2025-12-31',
    startTime: '21:00',
    endTime: '02:00',
    clientId: 'c2',
    lineItems: [
      { id: 'li10', name: 'DJ Service', unitCost: 2500, quantity: 1, taxEnabled: true },
      { id: 'li11', name: 'Lighting Package', unitCost: 800, quantity: 1, taxEnabled: true },
    ],
    discountPercent: 0,
    notes: 'Premium NYE event. Extended hours.',
    invoiceSent: true,
    invoiceSentDate: '2026-01-02',
    paid: true,
    paidDate: '2026-01-15',
  },
  {
    id: 'j6',
    title: 'Draft - Spring Festival',
    jobNumber: 'MUS-2026-DRAFT-001',
    status: 'drafted',
    startDate: '2026-05-20',
    endDate: '2026-05-20',
    startTime: '15:00',
    endTime: '20:00',
    lineItems: [
      { id: 'li12', name: 'DJ Service', unitCost: 1000, quantity: 1, taxEnabled: true },
    ],
    discountPercent: 0,
    notes: 'Draft job - pending client confirmation',
  },
];

export const mockBookingRequests: BookingRequest[] = [
  {
    id: 'br1',
    name: 'Michael Anderson',
    email: 'michael.anderson@email.com',
    phone: '+61 456 789 012',
    eventName: 'Summer Pool Party',
    eventDescription: 'Outdoor pool party for approximately 100 guests. Looking for upbeat house and dance music.',
    location: 'Brisbane, QLD',
    budget: '$1000 - $1500',
    date: '2026-04-25',
    time: '15:00',
    status: 'pending',
  },
  {
    id: 'br2',
    name: 'Lisa Wang',
    email: 'lisa.wang@email.com',
    phone: '+61 467 890 123',
    eventName: 'Corporate Product Launch',
    eventDescription: 'Tech company product launch event. Professional atmosphere with modern electronic music.',
    location: 'Sydney, NSW',
    budget: '$2000 - $2500',
    date: '2026-05-10',
    time: '18:00',
    status: 'quoted',
    quotedAmount: 2200,
    quotedMessage: 'Thanks for your inquiry! I\'d be happy to DJ your product launch. The quoted price includes premium sound system and lighting setup.',
    quotedDate: '2026-03-18',
  },
  {
    id: 'br3',
    name: 'David Martinez',
    email: 'david.m@email.com',
    phone: '+61 478 901 234',
    eventName: 'Anniversary Celebration',
    eventDescription: '25th wedding anniversary, intimate gathering of 50 people.',
    location: 'Perth, WA',
    budget: '$500 - $800',
    date: '2026-04-30',
    time: '18:30',
    status: 'declined',
  },
];

export const mockWeekAvailability: WeekAvailability = {
  monday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
  tuesday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
  wednesday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
  thursday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
  friday: { enabled: true, slots: [{ start: '09:00', end: '22:00' }] },
  saturday: { enabled: true, slots: [{ start: '10:00', end: '23:00' }] },
  sunday: { enabled: false, slots: [] },
};

export const mockVacationPeriods: VacationPeriod[] = [
  {
    id: 'v1',
    startDate: '2026-07-01',
    endDate: '2026-07-14',
    reason: 'Summer vacation',
  },
];

export const mockAvailabilitySettings: AvailabilitySettings = {
  minimumNoticeHours: 24,
  bookingBufferMinutes: 15,
  breaksEnabled: false,
  defaultBreakMinutes: 60,
};

export const mockInvoiceSettings: InvoiceSettings = {
  signature: 'Alex Rivers',
  companyName: 'Rivers Entertainment',
  businessDetails: 'ABN: 12 345 678 901\nAddress: 123 Music Lane, Sydney NSW 2000',
  defaultDueDays: 14,
};

export const mockBankDetails: BankDetails = {
  accountHolderName: 'Alex Rivers',
  bsb: '123-456',
  accountNumber: '12345678',
  stripeConnected: true,
  stripeAccountId: 'acct_1234567890',
};

export const mockNotificationSettings: NotificationSettings = {
  sendJobConfirmation: true,
  sendJobUpdates: true,
  sendJobCancellations: true,
  receiveEmailCopies: true,
  receivePushNotifications: true,
};

// Legacy V1 Portfolio (for backward compatibility with old Portfolio.tsx)
export const mockPortfolio: Portfolio = {
  userId: '1',
  isPublic: true,
  artistName: 'Alex Rivers',
  bio: 'Electronic music producer and DJ specializing in house, techno, and progressive beats. Over 10 years of experience performing at clubs and festivals worldwide.',
  socialLinks: {
    instagram: 'https://instagram.com/alexrivers',
    facebook: 'https://facebook.com/alexriversmusic',
    twitter: 'https://twitter.com/alexrivers',
    youtube: 'https://youtube.com/@alexrivers',
    spotify: 'https://open.spotify.com/artist/alexrivers',
  },
  sections: [
    {
      id: 's1',
      type: 'photos',
      title: 'Gallery',
      enabled: true,
      order: 0,
      content: {
        photos: [
          { id: 'p1', url: '', caption: 'Live at Ministry of Sound' },
          { id: 'p2', url: '', caption: 'Festival Performance' },
          { id: 'p3', url: '', caption: 'Studio Session' },
        ],
      },
    },
    {
      id: 's2',
      type: 'videos',
      title: 'Performance Videos',
      enabled: true,
      order: 1,
      content: {
        videos: [
          { id: 'v1', url: 'https://youtube.com/watch?v=example1', thumbnail: '', title: '2025 Festival Highlight Reel' },
          { id: 'v2', url: 'https://youtube.com/watch?v=example2', thumbnail: '', title: 'Live DJ Set - The Warehouse' },
        ],
      },
    },
    {
      id: 's3',
      type: 'music',
      title: 'Latest Releases',
      enabled: true,
      order: 2,
      content: {
        releases: [
          { id: 'r1', title: 'Midnight Dreams', artist: 'Alex Rivers', streamUrl: 'https://spotify.com/track/1', coverUrl: '' },
          { id: 'r2', title: 'Electric Pulse', artist: 'Alex Rivers', streamUrl: 'https://spotify.com/track/2', coverUrl: '' },
        ],
      },
    },
    {
      id: 's4',
      type: 'booking',
      title: 'Book Me',
      enabled: true,
      order: 3,
      content: {
        description: 'Available for clubs, festivals, private events, and brand activations. Let\'s create an unforgettable experience together.',
      },
    },
  ],
};