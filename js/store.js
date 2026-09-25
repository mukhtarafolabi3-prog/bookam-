/**
 * BOOKAM - Central Store & LocalStorage Controller with Real-Time Firebase Sync
 */

import firebaseConfig from '../firebase-applet-config.json';
import { initializeApp } from 'firebase/app';
import { 
  initializeFirestore,
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc,
  onSnapshot,
  getDocs,
  query as fsQuery,
  where
} from 'firebase/firestore';

let db = null;
try {
  const app = initializeApp(firebaseConfig);
  const settings = {
    experimentalForceLongPolling: true
  };
  if (firebaseConfig.firestoreDatabaseId) {
    db = initializeFirestore(app, settings, firebaseConfig.firestoreDatabaseId);
  } else {
    db = initializeFirestore(app, settings);
  }
} catch (err) {
  try {
    const app = initializeApp(firebaseConfig);
    if (firebaseConfig.firestoreDatabaseId) {
      db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    } else {
      db = getFirestore(app);
    }
  } catch (fallbackErr) {
    console.warn('Firebase initialization notice:', err, fallbackErr);
  }
}

const STORAGE_KEYS = {
  EVENTS: 'bookam_events',
  PAYMENTS: 'bookam_payments',
  TICKETS: 'bookam_tickets',
  ORGANIZER: 'bookam_organizer',
  CURRENT_ORDER: 'bookam_current_order',
  CURRENT_ORGANIZER: 'bookam_current_organizer',
  ORGANIZERS_LIST: 'bookam_organizers_list',
  CONTESTS: 'bookam_contests',
  INFLUENCERS: 'bookam_influencers',
  COMMISSIONS: 'bookam_commissions',
  INFLUENCER_SESSION: 'bookam_influencer_session',
  CONTROL_PANEL_SESSION: 'bookam_control_panel_session',
  SETTINGS: 'bookam_platform_settings',
  AUDIT_LOGS: 'bookam_audit_logs',
  REFUNDS: 'bookam_refunds',
  NOTIFICATIONS: 'bookam_notifications',
  CAREER_APPLICATIONS: 'bookam_career_applications',
  VENUE_RFPS: 'bookam_venue_rfps'
};

// All 36 Nigerian States + FCT Abuja
export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT - Abuja', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
  'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto',
  'Taraba', 'Yobe', 'Zamfara'
];

// Master Platform Default Configuration
const DEFAULT_PLATFORM_SETTINGS = {
  platformName: 'BOOKAM',
  supportPhone: '+234 916 290 1356',
  supportWhatsApp: '+2349162901356',
  supportEmail: 'Bookam26@gmail.com',
  bankName: 'Moniepoint',
  accountName: 'kaiwe digital',
  accountNumber: '8021174926',
  paymentPlatform: 'Moniepoint kaiwe digital',
  eventLocation: 'Oyo State, Ibadan · Wakajeje, First Floor, Abiola Building, Opposite Government College',
  locationAddress: 'Wakajeje, First Floor, Abiola Building, Opposite Government College',
  locationCity: 'Ibadan',
  locationState: 'Oyo State',
  paymentInstruction: 'Please make your payment using the account details provided and keep your payment confirmation/receipt for reference.',
  serviceCharge: 400,
  serviceFeePercent: 5,
  maintenanceMode: false,
  maintenanceMessage: 'BOOKAM is currently undergoing scheduled platform maintenance. Please check back shortly.'
};

// Initial Seed Influencers (Event Specific)
const DEFAULT_INFLUENCERS = [
  {
    id: 'inf-bookam26',
    eventId: 'evt-001',
    eventName: 'Eko Afrobeat Music & Cultural Festival 2026',
    name: 'BOOKAM Official Promoter',
    username: 'Bookam26',
    email: 'Bookam26@gmail.com',
    password: 'Linodrip$1123',
    phone: '+234 916 290 1356',
    promoCode: 'BOOKAM26',
    discountType: 'percentage', // 'percentage' | 'fixed'
    discountValue: 10, // 10% customer discount
    commissionType: 'percentage', // 'percentage' | 'fixed'
    commissionValue: 10, // 10% influencer commission
    applicableTiers: ['all'],
    usageLimit: 1000,
    usedCount: 58,
    clicks: 840,
    ticketsSold: 58,
    revenueGenerated: 1450000,
    commissionEarned: 145000,
    bankName: 'Moniepoint',
    accountName: 'KAIWE DIGITAL',
    accountNumber: '8021174926',
    startDate: '2026-08-01',
    endDate: '2026-12-31',
    status: 'Active',
    createdAt: '2026-08-01T08:00:00Z'
  },
  {
    id: 'inf-001',
    eventId: 'evt-001',
    eventName: 'Eko Afrobeat Music & Cultural Festival 2026',
    name: 'Tunde Adeleke',
    username: 'tunde',
    email: 'tunde.promotions@gmail.com',
    password: 'Linodrip$1123',
    phone: '+234 803 451 9921',
    promoCode: 'TUNDE10',
    discountType: 'percentage', // 'percentage' | 'fixed'
    discountValue: 10, // 10% customer discount
    commissionType: 'percentage', // 'percentage' | 'fixed'
    commissionValue: 5, // 5% influencer commission
    applicableTiers: ['all'],
    usageLimit: 500,
    usedCount: 47,
    clicks: 683,
    ticketsSold: 47,
    revenueGenerated: 940000,
    commissionEarned: 47000,
    startDate: '2026-08-01',
    endDate: '2026-10-15',
    status: 'Active',
    createdAt: '2026-08-01T10:00:00Z'
  },
  {
    id: 'inf-002',
    eventId: 'evt-001',
    eventName: 'Eko Afrobeat Music & Cultural Festival 2026',
    name: 'Amaka Okafor',
    username: 'amaka',
    email: 'amaka.events@gmail.com',
    phone: '+234 812 390 1284',
    promoCode: 'AMAKA15',
    discountType: 'percentage',
    discountValue: 15,
    commissionType: 'percentage',
    commissionValue: 5,
    applicableTiers: ['all'],
    usageLimit: 300,
    usedCount: 32,
    clicks: 420,
    ticketsSold: 32,
    revenueGenerated: 640000,
    commissionEarned: 32000,
    startDate: '2026-08-01',
    endDate: '2026-10-15',
    status: 'Active',
    createdAt: '2026-08-02T11:30:00Z'
  },
  {
    id: 'inf-003',
    eventId: 'evt-001',
    eventName: 'Eko Afrobeat Music & Cultural Festival 2026',
    name: 'Jayden "Jay" Cole',
    username: 'jay',
    email: 'jaycole.hype@yahoo.com',
    phone: '+234 905 112 8840',
    promoCode: 'JAY5K',
    discountType: 'fixed',
    discountValue: 2000,
    commissionType: 'fixed',
    commissionValue: 1000,
    applicableTiers: ['all'],
    usageLimit: 200,
    usedCount: 21,
    clicks: 290,
    ticketsSold: 21,
    revenueGenerated: 420000,
    commissionEarned: 21000,
    startDate: '2026-08-05',
    endDate: '2026-10-15',
    status: 'Active',
    createdAt: '2026-08-05T09:15:00Z'
  }
];

// Initial Seed Commissions
const DEFAULT_COMMISSIONS = [
  {
    id: 'COM-1001',
    eventId: 'evt-001',
    influencerId: 'inf-001',
    influencerName: 'Tunde Adeleke',
    influencerCode: 'TUNDE10',
    paymentId: 'PAY-892101',
    ticketId: 'BKM-2026-000101',
    customerName: 'Kemi Balogun',
    orderTotal: 20000,
    ticketQuantity: 1,
    amount: 1000,
    status: 'Paid',
    createdAt: '2026-08-10T14:20:00Z',
    paidAt: '2026-08-15T10:00:00Z'
  },
  {
    id: 'COM-1002',
    eventId: 'evt-001',
    influencerId: 'inf-001',
    influencerName: 'Tunde Adeleke',
    influencerCode: 'TUNDE10',
    paymentId: 'PAY-892102',
    ticketId: 'BKM-2026-000102',
    customerName: 'Femi Daniels',
    orderTotal: 40000,
    ticketQuantity: 2,
    amount: 2000,
    status: 'Approved',
    createdAt: '2026-08-18T16:40:00Z',
    paidAt: null
  },
  {
    id: 'COM-1003',
    eventId: 'evt-001',
    influencerId: 'inf-001',
    influencerName: 'Tunde Adeleke',
    influencerCode: 'TUNDE10',
    paymentId: 'PAY-892103',
    ticketId: 'BKM-2026-000103',
    customerName: 'Chidi Nwosu',
    orderTotal: 20000,
    ticketQuantity: 1,
    amount: 1000,
    status: 'Pending',
    createdAt: '2026-08-28T09:12:00Z',
    paidAt: null
  },
  {
    id: 'COM-1004',
    eventId: 'evt-001',
    influencerId: 'inf-002',
    influencerName: 'Amaka Okafor',
    influencerCode: 'AMAKA15',
    paymentId: 'PAY-892104',
    ticketId: 'BKM-2026-000104',
    customerName: 'Tariq Al-Hassan',
    orderTotal: 34000,
    ticketQuantity: 2,
    amount: 1700,
    status: 'Approved',
    createdAt: '2026-08-20T11:00:00Z',
    paidAt: null
  },
  {
    id: 'COM-1005',
    eventId: 'evt-001',
    influencerId: 'inf-003',
    influencerName: 'Jayden "Jay" Cole',
    influencerCode: 'JAY5K',
    paymentId: 'PAY-892105',
    ticketId: 'BKM-2026-000105',
    customerName: 'Blessing Udoh',
    orderTotal: 20000,
    ticketQuantity: 1,
    amount: 1000,
    status: 'Paid',
    createdAt: '2026-08-12T13:45:00Z',
    paidAt: '2026-08-15T10:00:00Z'
  }
];

// Initial Seed Contests
const DEFAULT_CONTESTS = [
  {
    id: 'cnt-001',
    title: 'Miss Campus Elegance 2026',
    organizerId: 'org-admin-001',
    organizerName: 'KAIWE DIGITAL',
    category: 'Beauty Pageant',
    description: 'The premier campus beauty, intelligence, and poise pageant. Vote for your favorite queen to represent our university at the national grand finale and win ₦2,000,000 in grand scholarship prizes!',
    banner: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
    votePrice: 100,
    startDate: '2026-08-01',
    endDate: '2026-08-30',
    status: 'Active',
    createdAt: new Date().toISOString(),
    contestants: [
      {
        id: 'cst-001',
        code: '001',
        name: 'Amina Bello',
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
        bio: '300L Mass Communication student, runway model & advocate for girls education.',
        votes: 1420
      },
      {
        id: 'cst-002',
        code: '002',
        name: 'Chidimma Okeke',
        photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
        bio: '400L Law student, youth climate delegate & passionate creative writer.',
        votes: 1890
      },
      {
        id: 'cst-003',
        code: '003',
        name: 'Zainab Abubakar',
        photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
        bio: '200L Biochemistry student & active community healthcare volunteer.',
        votes: 950
      },
      {
        id: 'cst-004',
        code: '004',
        name: 'Toluwani Adeleke',
        photo: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=80',
        bio: 'Final year Computer Science student & sustainable fashion entrepreneur.',
        votes: 1210
      }
    ]
  },
  {
    id: 'cnt-002',
    title: 'National Youth Tech Innovator Award 2026',
    organizerId: 'org-admin-001',
    organizerName: 'KAIWE DIGITAL',
    category: 'Tech & Innovation',
    description: 'Recognizing and empowering exceptional young African founders building scalable tech solutions in Fintech, Agritech, Healthtech, and Artificial Intelligence.',
    banner: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
    votePrice: 200,
    startDate: '2026-08-01',
    endDate: '2026-09-15',
    status: 'Active',
    createdAt: new Date().toISOString(),
    contestants: [
      {
        id: 'cst-101',
        code: '101',
        name: 'David Emeka (AgroConnect AI)',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
        bio: 'AI-driven marketplace connecting smallholder farmers directly to wholesale markets.',
        votes: 2350
      },
      {
        id: 'cst-102',
        code: '102',
        name: 'Kafayat Salami (HealthPulse)',
        photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
        bio: 'Portable solar diagnostics device for maternal care in rural communities.',
        votes: 3100
      },
      {
        id: 'cst-103',
        code: '103',
        name: 'Babatunde Fashola (PayGrid)',
        photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
        bio: 'Zero-internet offline USSD financial stack for unbanked micro-merchants.',
        votes: 1820
      }
    ]
  },
  {
    id: 'cnt-003',
    title: 'Voice of Nigeria Vocal Challenge',
    organizerId: 'org-admin-001',
    organizerName: 'KAIWE DIGITAL',
    category: 'Talent & Music',
    description: 'Nigeria\'s biggest digital vocal talent hunt! Vote for your favorite singer to land a ₦5,000,000 record deal & international studio production contract.',
    banner: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    votePrice: 100,
    startDate: '2026-08-01',
    endDate: '2026-08-25',
    status: 'Active',
    createdAt: new Date().toISOString(),
    contestants: [
      {
        id: 'cst-201',
        code: '201',
        name: 'Samuel "Sam Vocalz" King',
        photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
        bio: 'Soulful Afro-R&B vocalist & acoustic guitar performer.',
        votes: 4120
      },
      {
        id: 'cst-202',
        code: '202',
        name: 'Grace "G-Melody" Udoh',
        photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=600&q=80',
        bio: 'Anointing-filled gospel lead vocalist and pianist from Calabar.',
        votes: 3950
      },
      {
        id: 'cst-203',
        code: '203',
        name: 'Dapo "D-Flow" Williams',
        photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=80',
        bio: 'High-energy Afro-fusion singer blending traditional rhythms with trap soul.',
        votes: 2780
      }
    ]
  }
];

// Initial Seed Events - Landmark Africa Flagship & Partner Events
const DEFAULT_EVENTS = [
  {
    id: 'evt-landmark-001',
    title: 'Beauty West Africa International Expo 2026',
    organizer: 'BtoB Events & Landmark Africa',
    organizerId: 'org-landmark-btob',
    category: 'Exhibitions & Expos',
    date: '2026-11-24',
    endDate: '2026-11-26',
    time: '10:00',
    endTime: '18:00',
    hall: 'Hall 1, 2 & 3',
    venue: 'Landmark Centre — Hall 1, 2 & 3, Victoria Island, Lagos',
    venueAddress: 'Plot 2 & 3, Water Corporation Drive, Victoria Island, Lagos',
    city: 'Victoria Island, Lagos',
    state: 'Lagos',
    country: 'Nigeria',
    description: 'Africa’s largest international trade exhibition for beauty, cosmetics, personal care, and wellness. Featuring over 250 global exhibitors from 30+ countries, live hair demonstrations, cosmetic masterclasses, and VIP buyer networking.',
    banner: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
    featured: true,
    status: 'APPROVED',
    onboardingStatus: 'APPROVED',
    expectedAttendees: 5000,
    startingPrice: 0,
    tiers: [
      { id: 'tier-bwa-free', name: 'Free Trade Visitor Pass', price: 0, maxQuantity: 3000, soldQuantity: 1840, description: 'Access to exhibition floor halls 1, 2 & 3, brand showcases and live demos.' },
      { id: 'tier-bwa-vip', name: 'VIP Buyer & Masterclass Delegate', price: 15000, maxQuantity: 400, soldQuantity: 215, description: 'Fast-track badge, access to exclusive VIP Buyer Lounge & all technical masterclasses.' },
      { id: 'tier-bwa-gala', name: 'Gala Banquet & Industry Awards', price: 45000, maxQuantity: 150, soldQuantity: 89, description: 'Evening dinner banquet, awards ceremony, and prime networking with global delegates.' }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'evt-landmark-002',
    title: 'The Big 5 Construct Nigeria 2026',
    organizer: 'dmg events & Landmark Centre',
    organizerId: 'org-landmark-dmg',
    category: 'Exhibitions & Expos',
    date: '2026-10-20',
    endDate: '2026-10-22',
    time: '09:00',
    endTime: '17:00',
    hall: 'Hall 1 & 2',
    venue: 'Landmark Centre — Hall 1 & 2, Victoria Island, Lagos',
    venueAddress: 'Plot 2 & 3, Water Corporation Drive, Victoria Island, Lagos',
    city: 'Victoria Island, Lagos',
    state: 'Lagos',
    country: 'Nigeria',
    description: 'West Africa’s leading construction, architecture, and engineering exhibition. Bringing together thousands of industry leaders, contractors, architects, and government stakeholders showcasing smart building technologies and sustainable infrastructure.',
    banner: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=1200&q=80',
    featured: true,
    status: 'APPROVED',
    onboardingStatus: 'APPROVED',
    expectedAttendees: 6000,
    startingPrice: 5000,
    tiers: [
      { id: 'tier-big5-trade', name: 'Trade Visitor Day Pass', price: 5000, maxQuantity: 2500, soldQuantity: 1420, description: 'Single-day access to heavy machinery pavilion and product demonstrations.' },
      { id: 'tier-big5-conf', name: '3-Day Full Technical Conference Pass', price: 25000, maxQuantity: 600, soldQuantity: 340, description: '3-day conference access, CPD accredited certificates & conference materials.' },
      { id: 'tier-big5-exec', name: 'Executive VIP Boardroom Pass', price: 75000, maxQuantity: 100, soldQuantity: 58, description: 'Full access to Landmark Executive Lounge, B2B matchmaking service & private lunch.' }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'evt-landmark-003',
    title: 'Nigeria Energy Summit & Clean Tech Exhibition 2026',
    organizer: 'Informa Markets & Landmark Centre',
    organizerId: 'org-informa-energy',
    category: 'Conferences & Summits',
    date: '2026-11-10',
    endDate: '2026-11-12',
    time: '09:30',
    endTime: '17:30',
    hall: 'Hall 1 & Auditorium',
    venue: 'Landmark Centre — Hall 1, Victoria Island, Lagos',
    venueAddress: 'Plot 2 & 3, Water Corporation Drive, Victoria Island, Lagos',
    city: 'Victoria Island, Lagos',
    state: 'Lagos',
    country: 'Nigeria',
    description: 'The premier energy transition conference in West Africa focusing on power generation, transmission, renewable solar energy, and grid resilience. Meet ministers, energy commissioners, and international power consortiums.',
    banner: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80',
    featured: true,
    status: 'APPROVED',
    onboardingStatus: 'APPROVED',
    expectedAttendees: 3500,
    startingPrice: 10000,
    tiers: [
      { id: 'tier-ne-delegate', name: 'Summit Delegate Pass', price: 10000, maxQuantity: 800, soldQuantity: 460, description: 'Access to keynote plenaries, energy technology pavilion, and digital papers.' },
      { id: 'tier-ne-vip', name: 'Ministerial VIP Investor Pass', price: 50000, maxQuantity: 150, soldQuantity: 92, description: 'VIP seating, ministerial lunch, closed-door investment roundtable entry.' }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'evt-002',
    title: 'Lagos AI & Tech Founders Summit 2026',
    organizer: 'KAIWE DIGITAL & Landmark Innovation Hub',
    organizerId: 'org-admin-001',
    category: 'Tech & Summits',
    date: '2026-11-05',
    time: '09:00',
    endTime: '18:00',
    hall: 'Landmark Centre Grand Auditorium',
    venue: 'Landmark Centre — Grand Auditorium, Victoria Island, Lagos',
    venueAddress: 'Plot 2 & 3, Water Corporation Drive, Victoria Island, Lagos',
    city: 'Victoria Island, Lagos',
    state: 'Lagos',
    country: 'Nigeria',
    description: 'The definitive annual gathering for African tech founders, venture capitalists, AI researchers, and engineers building the future of West Africa. Live pitch competition, product keynotes, and investor matchmaking.',
    banner: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    featured: true,
    status: 'APPROVED',
    onboardingStatus: 'APPROVED',
    tiers: [
      { id: 'tier-002-reg', name: 'Delegate Pass', price: 10000, maxQuantity: 300, soldQuantity: 210, description: 'Access to general conference track, startup demo day & lunch.' },
      { id: 'tier-002-vip', name: 'VIP Investor Access', price: 35000, maxQuantity: 50, soldQuantity: 38, description: 'Investor lounge, private networking dinner & priority seating.' }
    ],
    startingPrice: 10000,
    createdAt: new Date().toISOString()
  },
  {
    id: 'evt-landmark-004',
    title: 'The Landmark Beachfront Sunset Rave & Afrobeat Festival',
    organizer: 'Landmark Leisure & Waveline Events',
    organizerId: 'org-landmark-beach',
    category: 'Beach & Festivals',
    date: '2026-12-18',
    time: '16:00',
    endTime: '02:00',
    hall: 'The Landmark Beachfront & Boardwalk',
    venue: 'The Landmark Beach — Oceanfront Lawn, Victoria Island, Lagos',
    venueAddress: 'Plot 3 & 4, Water Corporation Drive, Oniru, Victoria Island, Lagos',
    city: 'Victoria Island, Lagos',
    state: 'Lagos',
    country: 'Nigeria',
    description: 'The signature year-end open-air beach rave on the Atlantic shore. Experience world-renowned Afrobeat DJs, bonfire installations, beachside cocktail bars, watersports, and fire dancers under the starry Lagos sky.',
    banner: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    featured: true,
    status: 'APPROVED',
    onboardingStatus: 'APPROVED',
    expectedAttendees: 4000,
    startingPrice: 8000,
    tiers: [
      { id: 'tier-beach-gen', name: 'Beach General Admission', price: 8000, maxQuantity: 2000, soldQuantity: 910, description: 'Beachfront festival entry & 1 welcome tropical cocktail.' },
      { id: 'tier-beach-vip', name: 'VIP Oceanview Deck Pass', price: 25000, maxQuantity: 300, soldQuantity: 180, description: 'Elevated VIP timber deck, dedicated bars, finger food buffet & express entry.' },
      { id: 'tier-beach-cabana', name: 'Private Luxury Beach Cabana (For 8)', price: 350000, maxQuantity: 20, soldQuantity: 14, description: 'Exclusive private beach cabana, 2 premium champagne bottles, gourmet platter & butler service.' }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'evt-landmark-005',
    title: 'POP Landmark Comedy & Acoustic Sessions',
    organizer: 'POP Landmark Arts & Entertainment',
    organizerId: 'org-pop-landmark',
    category: 'Arts & Lifestyle',
    date: '2026-10-28',
    time: '19:00',
    endTime: '22:30',
    hall: 'POP Landmark Lounge Stage',
    venue: 'POP Landmark — Boutique Lounge, Victoria Island, Lagos',
    venueAddress: 'Water Corporation Drive, Victoria Island, Lagos',
    city: 'Victoria Island, Lagos',
    state: 'Lagos',
    country: 'Nigeria',
    description: 'An intimate evening of live stand-up comedy, acoustic soul performances, artisan cocktails, and delicious small chops at Landmark’s trendiest waterfront lifestyle lounge.',
    banner: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
    featured: false,
    status: 'APPROVED',
    onboardingStatus: 'APPROVED',
    startingPrice: 6000,
    tiers: [
      { id: 'tier-pop-std', name: 'Standard Seating & Cocktail', price: 6000, maxQuantity: 100, soldQuantity: 45, description: 'Admission and 1 signature craft cocktail.' },
      { id: 'tier-pop-front', name: 'Front Row VIP Table (Couples)', price: 20000, maxQuantity: 25, soldQuantity: 18, description: 'Reserved front-row table for 2 with gourmet platter and bottle of wine.' }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'evt-004',
    title: 'Pulse Lagos Beach Rave & Sunset Party',
    organizer: 'Waveline Events & Media',
    organizerId: 'org-wave-002',
    organizerEmail: 'hello@waveline.ng',
    organizerPhone: '+234 814 552 1902',
    organizerWhatsapp: '+234 814 552 1902',
    organizerInstagram: '@wavelinelagos',
    organizerType: 'Event Company',
    category: 'Party / Club Event',
    date: '2026-10-30',
    time: '16:00',
    endTime: '23:30',
    hall: 'The Landmark Beachfront',
    venue: 'The Landmark Beach — Victoria Island, Lagos',
    venueAddress: 'Water Corporation Drive, Oniru, Victoria Island, Lagos',
    city: 'Lagos',
    state: 'Lagos',
    country: 'Nigeria',
    venueCapacity: 1500,
    venueType: 'Beachfront / Lawn',
    description: 'An exclusive oceanfront sunset rave featuring international guest DJs, beach fire pits, cocktail bars, and non-stop Afro-house vibes until midnight.',
    banner: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    featured: false,
    status: 'APPROVED',
    onboardingStatus: 'APPROVED',
    submittedAt: '2026-09-02T10:30:00Z',
    expectedAttendance: 1200,
    targetAudience: ['Young Professionals', 'Students', 'Creatives'],
    ageRequirement: '18+',
    eventAccess: 'Ticket Required',
    tiers: [
      { id: 'tier-004-eb', name: 'Early Bird Pass', price: 7000, maxQuantity: 200, soldQuantity: 0, description: 'Access to main beach rave arena and 1 complimentary welcome cocktail.' },
      { id: 'tier-004-reg', name: 'Regular Entry', price: 10000, maxQuantity: 600, soldQuantity: 0, description: 'Standard general admission pass.' },
      { id: 'tier-004-vip', name: 'VIP Cabana Lounge', price: 25000, maxQuantity: 100, soldQuantity: 0, description: 'Dedicated VIP elevated deck, express bar and lounge seating.' }
    ],
    influencers: [
      { name: 'DJ Tunez Hype', promoCode: 'TUNEZ10', discountType: 'percentage', discountValue: 10, commission: 8 },
      { name: 'Bella Lagos Hype', promoCode: 'BELLA5', discountType: 'percentage', discountValue: 5, commission: 5 }
    ],
    declarationAccepted: true,
    startingPrice: 7000,
    createdAt: '2026-09-02T10:30:00Z'
  },
  {
    id: 'evt-landmark-006',
    title: 'West Africa Maritime, Marine & Yachting Expo 2026',
    organizer: 'Lagos Maritime Guild & Landmark Waterfront',
    organizerId: 'org-maritime-lagos',
    organizerEmail: 'expo@westafricamaritime.org',
    organizerPhone: '+234 802 334 9912',
    category: 'Exhibitions & Expos',
    date: '2026-11-18',
    time: '10:00',
    endTime: '17:00',
    hall: 'Hall 2 & Waterfront Marina',
    venue: 'Landmark Centre — Hall 2 & Waterfront Marina, Victoria Island, Lagos',
    city: 'Victoria Island, Lagos',
    state: 'Lagos',
    country: 'Nigeria',
    description: 'International yachting showcase, marine logistics, shipping technology, and luxury boat exhibition at the Landmark Waterfront.',
    banner: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
    featured: false,
    status: 'APPROVED',
    onboardingStatus: 'APPROVED',
    submittedAt: '2026-09-08T14:20:00Z',
    expectedAttendees: 2000,
    startingPrice: 12000,
    tiers: [
      { id: 'tier-maritime-day', name: 'Exhibition & Marina Pass', price: 12000, maxQuantity: 1000, soldQuantity: 0, description: 'Access to Hall 2 exhibition and Marina dock pontoon tours.' },
      { id: 'tier-maritime-vip', name: 'VIP Yacht Club & Sunset Cruise', price: 65000, maxQuantity: 120, soldQuantity: 0, description: 'Full conference badge, VIP lounge catering & sunset catamaran boat cruise.' }
    ],
    createdAt: '2026-09-08T14:20:00Z'
  },
  {
    id: 'evt-oyo-001',
    title: 'Ibadan Creative & Tech Innovation Summit 2026',
    organizer: 'kaiwe digital & Oyo State Creative Guild',
    organizerId: 'org-admin-001',
    organizerEmail: 'Bookam26@gmail.com',
    organizerPhone: '+234 916 290 1356',
    category: 'Tech & Summits',
    date: '2026-11-14',
    endDate: '2026-11-15',
    time: '09:30',
    endTime: '18:00',
    hall: 'Main Innovation Hall & Executive Suite',
    venue: 'Wakajeje, First Floor, Abiola Building, Opposite Government College',
    venueAddress: 'Wakajeje, First Floor, Abiola Building, Opposite Government College, Ibadan, Oyo State',
    city: 'Ibadan',
    state: 'Oyo',
    country: 'Nigeria',
    venueCapacity: 2500,
    venueType: 'Conference Hall & Tech Hub',
    description: 'The premier technology, creator economy, and youth entrepreneurship summit in Oyo State. Bringing together innovators, creators, developers, and investors for keynotes, workshops, and startup pitching.',
    banner: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80',
    featured: true,
    status: 'APPROVED',
    onboardingStatus: 'APPROVED',
    submittedAt: '2026-09-10T09:00:00Z',
    expectedAttendees: 2500,
    startingPrice: 0,
    tiers: [
      { id: 'tier-oyo-free', name: 'General RSVP Delegate Pass (Free)', price: 0, maxQuantity: 1500, soldQuantity: 820, description: 'Full access to conference presentations, exhibition floor & startup hub.' },
      { id: 'tier-oyo-master', name: 'Technical Masterclass & Certification', price: 5000, maxQuantity: 400, soldQuantity: 210, description: 'Hands-on AI & coding workshops, lunch pack & verified certificate.' },
      { id: 'tier-oyo-vip', name: 'VIP Executive & Investor Dinner Pass', price: 20000, maxQuantity: 100, soldQuantity: 65, description: 'Reserved front-row seating, private VIP lounge networking and evening banquet.' }
    ],
    createdAt: '2026-09-10T09:00:00Z'
  },
  {
    id: 'evt-better-marriages-2',
    title: 'Better Marriages 2.0',
    organizer: 'Better Marriages Initiative & TheBunker',
    organizerId: 'org-better-marriages',
    organizerEmail: 'Bookam26@gmail.com',
    organizerPhone: '+234 916 290 1356',
    category: 'Lifestyle & Relationships',
    date: '2026-10-31',
    time: '10:00',
    endTime: '17:00',
    hall: 'Main Hall',
    venue: 'TheBunker, ibadan',
    venueAddress: 'TheBunker, Ibadan, Oyo State',
    city: 'Ibadan',
    state: 'Oyo',
    country: 'Nigeria',
    venueCapacity: 1000,
    venueType: 'Event Centre & Lounge',
    description: 'Better Marriages 2.0 is an inspiring, transformative event designed for couples, intending couples, and relationship builders seeking deep connections, proven marital wisdom, communication mastery, and joyful partnership. Join us at TheBunker, Ibadan for an unforgettable experience.',
    banner: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    featured: true,
    status: 'APPROVED',
    onboardingStatus: 'APPROVED',
    submittedAt: '2026-09-15T10:00:00Z',
    expectedAttendees: 600,
    startingPrice: 5000,
    tickets: [
      {
        type: 'First Wave',
        name: 'First Wave Ticket',
        price: 5000,
        benefits: ['First Wave Admission', 'Standard Venue Access', 'Fast-track Entry']
      }
    ],
    tiers: [
      {
        id: 'tier-bm-firstwave',
        name: 'First Wave Ticket',
        price: 5000,
        maxQuantity: 600,
        soldQuantity: 140,
        description: 'Exclusive First Wave Ticket for Better Marriages 2.0 at TheBunker, Ibadan.'
      }
    ],
    createdAt: '2026-09-15T10:00:00Z'
  },
  {
    id: 'evt-abuja-001',
    title: 'Abuja International Cultural & Leadership Summit 2026',
    organizer: 'Federal Capital Creative Forum',
    organizerId: 'org-fct-01',
    category: 'Conferences & Summits',
    date: '2026-12-05',
    time: '09:00',
    endTime: '17:00',
    venue: 'International Conference Centre, Central Business District, Abuja',
    venueAddress: 'Central Area, Herbert Macaulay Way, Abuja, FCT',
    city: 'Abuja',
    state: 'FCT - Abuja',
    country: 'Nigeria',
    description: 'National delegates conference uniting policymakers, civic innovators, and business leaders across Nigeria for high-impact governance & creative development panels.',
    banner: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    featured: true,
    status: 'APPROVED',
    onboardingStatus: 'APPROVED',
    startingPrice: 15000,
    tiers: [
      { id: 'tier-abj-reg', name: 'Delegate Standard Pass', price: 15000, maxQuantity: 800, soldQuantity: 420, description: 'Full 1-day summit access and delegate pack.' },
      { id: 'tier-abj-vip', name: 'VIP Statesman & Gala Access', price: 50000, maxQuantity: 150, soldQuantity: 92, description: 'VIP banquet, policy roundtable & executive summit digest.' }
    ],
    createdAt: '2026-09-11T10:00:00Z'
  },
  {
    id: 'evt-rivers-001',
    title: 'Port Harcourt Afro-Beats Carnival & Food Fair 2026',
    organizer: 'Niger Delta Live Events',
    organizerId: 'org-rivers-01',
    category: 'Music & Concerts',
    date: '2026-12-19',
    time: '14:00',
    endTime: '23:30',
    venue: 'Port Harcourt Pleasure Park Amphitheatre, Aba Road',
    venueAddress: 'Aba Road, Rumuola, Port Harcourt, Rivers State',
    city: 'Port Harcourt',
    state: 'Rivers',
    country: 'Nigeria',
    description: 'The Garden City’s biggest open-air live music carnival, street food fiesta, and live performance stage featuring premier Nigerian artists.',
    banner: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
    featured: true,
    status: 'APPROVED',
    onboardingStatus: 'APPROVED',
    startingPrice: 4000,
    tiers: [
      { id: 'tier-ph-regular', name: 'Carnival General Entry', price: 4000, maxQuantity: 2000, soldQuantity: 910, description: 'Standard arena gate access and food court entry.' },
      { id: 'tier-ph-stage', name: 'Front-Stage VIP Fan Zone', price: 15000, maxQuantity: 300, soldQuantity: 140, description: 'Direct stage proximity, 2 drink vouchers & fast-track gate.' }
    ],
    createdAt: '2026-09-12T11:00:00Z'
  },
  {
    id: 'evt-kano-001',
    title: 'Kano Northern Enterprise & Trade Expo 2026',
    organizer: 'Kano Chamber of Commerce & Tech Alliance',
    organizerId: 'org-kano-01',
    category: 'Exhibitions & Expos',
    date: '2026-11-28',
    time: '10:00',
    endTime: '17:30',
    venue: 'Kano Trade Fair Complex, Zoo Road',
    venueAddress: 'Zoo Road, Kano, Kano State',
    city: 'Kano',
    state: 'Kano',
    country: 'Nigeria',
    description: 'West Africa’s leading Northern commerce and agriculture innovation expo showcasing cross-border trade, textiles, fintech, and agro-allied industries.',
    banner: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    featured: false,
    status: 'APPROVED',
    onboardingStatus: 'APPROVED',
    startingPrice: 2000,
    tiers: [
      { id: 'tier-kano-day', name: 'Trade Visitor Day Pass', price: 2000, maxQuantity: 3000, soldQuantity: 1100, description: 'Access to all exhibition pavilions.' }
    ],
    createdAt: '2026-09-12T14:00:00Z'
  }
];

// Seed Audit Logs
const DEFAULT_AUDIT_LOGS = [
  {
    id: 'aud-101',
    admin: 'Bookam26@gmail.com',
    adminName: 'Mukhtar Afolabi (Super Admin)',
    action: 'EVENT_APPROVED',
    entity: 'Event',
    entityId: 'evt-001',
    details: 'Approved event "Eko Afrobeat Music & Cultural Festival 2026" and activated ticket sales',
    timestamp: '2026-08-01T10:15:00Z',
    ip: '102.89.41.22'
  },
  {
    id: 'aud-102',
    admin: 'Bookam26@gmail.com',
    adminName: 'Mukhtar Afolabi (Super Admin)',
    action: 'PAYMENT_VERIFIED',
    entity: 'Payment',
    entityId: 'PAY-892101',
    details: 'Approved Moniepoint bank transfer proof for ₦20,000 and issued ticket pass',
    timestamp: '2026-08-10T14:25:00Z',
    ip: '102.89.41.22'
  },
  {
    id: 'aud-103',
    admin: 'Bookam26@gmail.com',
    adminName: 'Mukhtar Afolabi (Super Admin)',
    action: 'VOTES_ADJUSTED',
    entity: 'Contestant',
    entityId: 'cst-001',
    details: 'Verified offline sponsor vote batch adjustment (+250 votes)',
    timestamp: '2026-08-15T16:00:00Z',
    ip: '102.89.41.22'
  },
  {
    id: 'aud-104',
    admin: 'Bookam26@gmail.com',
    adminName: 'Mukhtar Afolabi (Super Admin)',
    action: 'INFLUENCER_CODE_CREATED',
    entity: 'Influencer',
    entityId: 'inf-bookam26',
    details: 'Configured platform master promo code BOOKAM26 (10% discount, 10% commission)',
    timestamp: '2026-08-01T08:00:00Z',
    ip: '102.89.41.22'
  }
];

// Seed Refunds
const DEFAULT_REFUNDS = [
  {
    id: 'ref-1001',
    ticketId: 'BKM-2026-000103',
    paymentId: 'PAY-892103',
    eventId: 'evt-001',
    eventName: 'Eko Afrobeat Music & Cultural Festival 2026',
    customerName: 'Chidi Nwosu',
    customerEmail: 'chidi.nwosu@gmail.com',
    customerPhone: '+234 803 129 4481',
    amount: 20000,
    reason: 'Duplicate payment made during bank network downtime',
    status: 'Pending',
    requestedAt: '2026-08-28T10:00:00Z',
    reviewedAt: null,
    notes: 'Awaiting finance admin bank confirmation'
  }
];

// Seed Notifications
const DEFAULT_NOTIFICATIONS = [
  {
    id: 'notif-101',
    title: 'New Event Submitted For Review',
    message: 'Waveline Events submitted "Pulse Lagos Beach Rave & Sunset Party" for review and ticket activation.',
    type: 'event_submitted',
    read: false,
    timestamp: '2026-09-02T10:30:00Z',
    link: '#tab-pending-events'
  },
  {
    id: 'notif-102',
    title: 'Payment Verification Queue',
    message: 'New manual transfer payment proof uploaded for review.',
    type: 'payment_pending',
    read: true,
    timestamp: '2026-09-01T15:20:00Z',
    link: '#tab-payments'
  }
];

// Seed Organizer Info
const DEFAULT_ORGANIZER = {
  name: 'KAIWE DIGITAL',
  organizationName: 'KAIWE DIGITAL',
  email: 'Bookam26@gmail.com',
  bankName: 'Moniepoint',
  accountName: 'KAIWE DIGITAL',
  accountNumber: '8021174926'
};

// Default Payments - Empty for fresh start
const DEFAULT_PAYMENTS = [];

// Default Seed Digital Passes - Empty for 0 count
const DEFAULT_TICKETS = [];

// --- IMAGE COMPRESSION UTILITY ---
window.compressImageFile = function(file, maxWidth = 1200, maxHeight = 1200, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Invalid image file'));
    }
    const reader = new FileReader();
    reader.onerror = (e) => reject(e);
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = (err) => reject(err);
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(e.target.result);
        }
        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = file.type === 'image/png' ? 'image/jpeg' : (file.type || 'image/jpeg');
        const dataUrl = canvas.toDataURL(mimeType, quality);
        resolve(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

class BookamStore {
  constructor() {
    this.NIGERIAN_STATES = NIGERIAN_STATES;
    this.init();
    this.initFirebaseSync();
  }

  init() {
    // Zero-reset migration: Reset payments, tickets, and metrics to 0 as requested
    const ZERO_RESET_KEY = 'bookam_zero_reset_v2026_09_23_manual_control';
    if (!localStorage.getItem(ZERO_RESET_KEY)) {
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify([]));
      localStorage.setItem(ZERO_RESET_KEY, 'true');
      if (db) {
        try {
          getDocs(collection(db, 'tickets')).then(snap => {
            snap.forEach(d => {
              deleteDoc(doc(db, 'tickets', d.id)).catch(() => {});
            });
          }).catch(() => {});
          getDocs(collection(db, 'payments')).then(snap => {
            snap.forEach(d => {
              deleteDoc(doc(db, 'payments', d.id)).catch(() => {});
            });
          }).catch(() => {});
        } catch (e) {}
      }
    }
    try {
      const storedEvents = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS) || '[]');
      if (storedEvents.length === 0) {
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(DEFAULT_EVENTS));
      } else {
        // Merge missing default events (like Landmark Africa events, Oyo State, Abuja, Rivers)
        let modified = false;
        DEFAULT_EVENTS.forEach(defEvt => {
          const idx = storedEvents.findIndex(e => e.id === defEvt.id);
          if (idx === -1) {
            storedEvents.push(defEvt);
            modified = true;
          } else {
            if (!storedEvents[idx].state && defEvt.state) {
              storedEvents[idx].state = defEvt.state;
              modified = true;
            }
            if (storedEvents[idx].status === 'PENDING REVIEW' && defEvt.status === 'APPROVED') {
              storedEvents[idx].status = 'APPROVED';
              storedEvents[idx].onboardingStatus = 'APPROVED';
              modified = true;
            }
          }
        });
        // Normalize any event missing state or ticket prices
        storedEvents.forEach(evt => {
          if (evt.title && evt.title.toLowerCase().includes('better marriages')) {
            evt.tickets = [
              {
                type: 'First Wave',
                name: 'First Wave Ticket',
                price: 5000,
                benefits: ['First Wave Admission', 'Standard Venue Access', 'Fast-track Entry']
              }
            ];
            evt.tiers = [
              {
                id: 'tier-bm-firstwave',
                name: 'First Wave Ticket',
                price: 5000,
                maxQuantity: 600,
                soldQuantity: 140,
                description: 'Exclusive First Wave Ticket for Better Marriages 2.0 at TheBunker, Ibadan.'
              }
            ];
            evt.date = '2026-10-31';
            evt.venue = 'TheBunker, ibadan';
            evt.city = 'Ibadan';
            evt.state = 'Oyo';
            evt.startingPrice = 5000;
            modified = true;
          } else if (evt.tickets && Array.isArray(evt.tickets)) {
            evt.tickets.forEach(t => {
              if (t.type === 'First Wave' && (t.price === 8200 || t.price === 8000 || t.price === 4000)) {
                t.price = 5000;
                modified = true;
              }
            });
            if (evt.startingPrice === 8200) {
              evt.startingPrice = 5000;
              modified = true;
            }
          }
          if (!evt.state) {
            const txt = `${evt.venue || ''} ${evt.city || ''} ${evt.venueAddress || ''}`.toLowerCase();
            if (txt.includes('lagos')) evt.state = 'Lagos';
            else if (txt.includes('oyo') || txt.includes('ibadan')) evt.state = 'Oyo';
            else if (txt.includes('abuja')) evt.state = 'FCT - Abuja';
            else if (txt.includes('rivers') || txt.includes('port harcourt')) evt.state = 'Rivers';
            else if (txt.includes('kano')) evt.state = 'Kano';
            else evt.state = 'Lagos';
            modified = true;
          }
        });
        if (modified) {
          localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(storedEvents));
        }
      }
    } catch (e) {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(DEFAULT_EVENTS));
    }

    // Initialize or migrate global platform settings
    try {
      const storedSettings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}');
      storedSettings.bankName = 'Moniepoint';
      storedSettings.accountNumber = '8021174926';
      storedSettings.accountName = 'kaiwe digital';
      storedSettings.paymentPlatform = 'Moniepoint kaiwe digital';
      storedSettings.locationAddress = 'Wakajeje, First Floor, Abiola Building, Opposite Government College';
      storedSettings.locationCity = 'Ibadan';
      storedSettings.locationState = 'Oyo State';
      storedSettings.eventLocation = 'Oyo State, Ibadan · Wakajeje, First Floor, Abiola Building, Opposite Government College';
      storedSettings.paymentInstruction = 'Please make your payment using the account details provided and keep your payment confirmation/receipt for reference.';
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(storedSettings));
    } catch (e) {}

    if (!localStorage.getItem(STORAGE_KEYS.ORGANIZER)) {
      localStorage.setItem(STORAGE_KEYS.ORGANIZER, JSON.stringify(DEFAULT_ORGANIZER));
    } else {
      try {
        const storedOrg = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORGANIZER) || '{}');
        storedOrg.bankName = 'Moniepoint';
        storedOrg.accountNumber = '8021174926';
        storedOrg.accountName = 'kaiwe digital';
        storedOrg.name = storedOrg.name || 'kaiwe digital';
        storedOrg.organizationName = storedOrg.organizationName || 'kaiwe digital';
        localStorage.setItem(STORAGE_KEYS.ORGANIZER, JSON.stringify(storedOrg));
      } catch (e) {}
    }
    try {
      let storedTickets = JSON.parse(localStorage.getItem(STORAGE_KEYS.TICKETS) || '[]');
      storedTickets = storedTickets.filter(t => !['BKM-2026-000101', 'BKM-2026-000102', 'BKM-2026-000103'].includes(t.id));
      localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(storedTickets));
    } catch (e) {
      localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CONTESTS) || JSON.parse(localStorage.getItem(STORAGE_KEYS.CONTESTS) || '[]').length === 0) {
      localStorage.setItem(STORAGE_KEYS.CONTESTS, JSON.stringify(DEFAULT_CONTESTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.INFLUENCERS) || JSON.parse(localStorage.getItem(STORAGE_KEYS.INFLUENCERS) || '[]').length === 0) {
      localStorage.setItem(STORAGE_KEYS.INFLUENCERS, JSON.stringify(DEFAULT_INFLUENCERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.COMMISSIONS) || JSON.parse(localStorage.getItem(STORAGE_KEYS.COMMISSIONS) || '[]').length === 0) {
      localStorage.setItem(STORAGE_KEYS.COMMISSIONS, JSON.stringify(DEFAULT_COMMISSIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS) || JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS) || '[]').length === 0) {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(DEFAULT_AUDIT_LOGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.REFUNDS) || JSON.parse(localStorage.getItem(STORAGE_KEYS.REFUNDS) || '[]').length === 0) {
      localStorage.setItem(STORAGE_KEYS.REFUNDS, JSON.stringify(DEFAULT_REFUNDS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]').length === 0) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(DEFAULT_NOTIFICATIONS));
    }
    // Explicitly logout current session to force password auth
    if (!localStorage.getItem('bookam_enforced_logout_v2')) {
      this.logoutOrganizer();
      localStorage.setItem('bookam_enforced_logout_v2', 'true');
    }
  }

  initFirebaseSync() {
    if (!db) return;

    // 1. Sync Events Collection
    try {
      onSnapshot(collection(db, 'events'), (snapshot) => {
        const firestoreEvents = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          if (data && data.id) firestoreEvents.push(data);
        });

        // Merge Firestore events with local events without deleting newly published local events
        const localEvents = this.getEvents();
        const eventMap = new Map();
        localEvents.forEach(e => { if (e && e.id) eventMap.set(e.id, e); });
        firestoreEvents.forEach(e => { if (e && e.id) eventMap.set(e.id, e); });

        const mergedEvents = Array.from(eventMap.values());
        mergedEvents.sort((a, b) => (b.id || '').localeCompare(a.id || ''));

        // Upload any local event not yet in Firestore
        localEvents.forEach(localEvt => {
          if (!firestoreEvents.some(fe => fe.id === localEvt.id)) {
            try {
              setDoc(doc(db, 'events', localEvt.id), localEvt, { merge: true });
            } catch (err) {}
          }
        });

        if (mergedEvents.length > 0) {
          try {
            localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(mergedEvents));
          } catch (e) {
            console.warn('localStorage quota handled for events:', e);
          }
        }
        window.dispatchEvent(new CustomEvent('bookam_store_updated', { detail: { type: 'events' } }));
      }, (err) => console.warn('Firestore events listener warning:', err));
    } catch (e) {
      console.warn('Events listener setup error:', e);
    }

    // 2. Sync Payments Collection
    try {
      onSnapshot(collection(db, 'payments'), (snapshot) => {
        const payments = [];
        snapshot.forEach(docSnap => {
          payments.push(docSnap.data());
        });
        payments.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
        window.dispatchEvent(new CustomEvent('bookam_store_updated', { detail: { type: 'payments' } }));
      }, (err) => console.warn('Firestore payments listener warning:', err));
    } catch (e) {
      console.warn('Payments listener setup error:', e);
    }

    // 3. Sync Tickets Collection
    try {
      onSnapshot(collection(db, 'tickets'), (snapshot) => {
        const tickets = [];
        snapshot.forEach(docSnap => {
          tickets.push(docSnap.data());
        });
        tickets.sort((a, b) => new Date(b.approvedAt || 0) - new Date(a.approvedAt || 0));
        localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
        window.dispatchEvent(new CustomEvent('bookam_store_updated', { detail: { type: 'tickets' } }));
      }, (err) => console.warn('Firestore tickets listener warning:', err));
    } catch (e) {
      console.warn('Tickets listener setup error:', e);
    }

    // 4. Sync Organizers Collection
    try {
      onSnapshot(collection(db, 'organizers'), (snapshot) => {
        const organizers = [];
        snapshot.forEach(docSnap => {
          organizers.push(docSnap.data());
        });

        const adminEmail = 'bookam26@gmail.com';
        const adminAccount = {
          id: 'org-admin-001',
          name: 'KAIWE DIGITAL',
          organizationName: 'KAIWE DIGITAL',
          email: 'Bookam26@gmail.com',
          password: 'Linodrip$1123',
          phone: '+234 916 290 1356',
          bankName: 'Moniepoint',
          accountName: 'KAIWE DIGITAL',
          accountNumber: '8021174926',
          registeredAt: new Date().toISOString()
        };

        const existingIndex = organizers.findIndex(o => o.email && o.email.toLowerCase() === adminEmail);
        if (existingIndex >= 0) {
          organizers[existingIndex].password = 'Linodrip$1123';
          organizers[existingIndex].bankName = 'Moniepoint';
          organizers[existingIndex].accountName = 'KAIWE DIGITAL';
          organizers[existingIndex].accountNumber = '8021174926';
        } else {
          organizers.unshift(adminAccount);
          try {
            setDoc(doc(db, 'organizers', adminAccount.id), adminAccount, { merge: true });
          } catch (e) {}
        }

        localStorage.setItem(STORAGE_KEYS.ORGANIZERS_LIST, JSON.stringify(organizers));
        window.dispatchEvent(new CustomEvent('bookam_store_updated', { detail: { type: 'organizers' } }));
      }, (err) => console.warn('Firestore organizers listener warning:', err));
    } catch (e) {
      console.warn('Organizers listener setup error:', e);
    }

    // 5. Sync Contests Collection
    try {
      onSnapshot(collection(db, 'contests'), (snapshot) => {
        const contests = [];
        snapshot.forEach(docSnap => {
          contests.push(docSnap.data());
        });
        contests.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        if (contests.length > 0) {
          localStorage.setItem(STORAGE_KEYS.CONTESTS, JSON.stringify(contests));
        }
        window.dispatchEvent(new CustomEvent('bookam_store_updated', { detail: { type: 'contests' } }));
      }, (err) => console.warn('Firestore contests listener warning:', err));
    } catch (e) {
      console.warn('Contests listener setup error:', e);
    }

    // 6. Sync Influencers Collection
    try {
      onSnapshot(collection(db, 'influencers'), (snapshot) => {
        const influencers = [];
        snapshot.forEach(docSnap => {
          influencers.push(docSnap.data());
        });

        // Ensure official promoter Bookam26 is always active
        const adminEmail = 'bookam26@gmail.com';
        const officialPromoter = DEFAULT_INFLUENCERS[0];
        const existingIdx = influencers.findIndex(i => i.email && i.email.toLowerCase() === adminEmail);
        if (existingIdx >= 0) {
          influencers[existingIdx].password = 'Linodrip$1123';
          influencers[existingIdx].username = 'Bookam26';
          influencers[existingIdx].email = 'Bookam26@gmail.com';
        } else {
          influencers.unshift(officialPromoter);
          try {
            setDoc(doc(db, 'influencers', officialPromoter.id), officialPromoter, { merge: true });
          } catch (e) {}
        }

        influencers.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        localStorage.setItem(STORAGE_KEYS.INFLUENCERS, JSON.stringify(influencers));
        window.dispatchEvent(new CustomEvent('bookam_store_updated', { detail: { type: 'influencers' } }));
      }, (err) => console.warn('Firestore influencers listener warning:', err));
    } catch (e) {
      console.warn('Influencers listener setup error:', e);
    }

    // 7. Sync Commissions Collection
    try {
      onSnapshot(collection(db, 'commissions'), (snapshot) => {
        const commissions = [];
        snapshot.forEach(docSnap => {
          commissions.push(docSnap.data());
        });
        commissions.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        if (commissions.length > 0) {
          localStorage.setItem(STORAGE_KEYS.COMMISSIONS, JSON.stringify(commissions));
        }
        window.dispatchEvent(new CustomEvent('bookam_store_updated', { detail: { type: 'commissions' } }));
      }, (err) => console.warn('Firestore commissions listener warning:', err));
    } catch (e) {
      console.warn('Commissions listener setup error:', e);
    }

    // 8. Sync Platform Global Settings
    try {
      onSnapshot(collection(db, 'settings'), (snapshot) => {
        snapshot.forEach(docSnap => {
          if (docSnap.id === 'platform') {
            const data = docSnap.data();
            const merged = { ...DEFAULT_PLATFORM_SETTINGS, ...data };
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
            window.dispatchEvent(new CustomEvent('bookam_store_updated', { detail: { type: 'settings', settings: merged } }));
          }
        });
      }, (err) => console.warn('Firestore settings listener warning:', err));
    } catch (e) {
      console.warn('Settings listener setup error:', e);
    }
  }

  // --- EVENTS ---
  getEvents() {
    try {
      const events = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS)) || DEFAULT_EVENTS;
      // Auto-update ticket prices for standard tiers if existing events are loaded
      events.forEach(evt => {
        if (evt.title && evt.title.toLowerCase().includes('better marriages')) {
          evt.tickets = [
            {
              type: 'First Wave',
              name: 'First Wave Ticket',
              price: 5000,
              benefits: ['First Wave Admission', 'Standard Venue Access', 'Fast-track Entry']
            }
          ];
          evt.tiers = [
            {
              id: 'tier-bm-firstwave',
              name: 'First Wave Ticket',
              price: 5000,
              maxQuantity: 600,
              soldQuantity: 140,
              description: 'Exclusive First Wave Ticket for Better Marriages 2.0 at TheBunker, Ibadan.'
            }
          ];
          evt.date = '2026-10-31';
          evt.venue = 'TheBunker, ibadan';
          evt.city = 'Ibadan';
          evt.state = 'Oyo';
          evt.startingPrice = 5000;
        } else if (evt.tickets && Array.isArray(evt.tickets)) {
          evt.tickets.forEach(t => {
            if (t.type === 'Early bird' && (t.price === 2500 || t.price === 6000 || t.price === 6200)) t.price = 5000;
            if (t.type === 'First Wave' && (t.price === 4000 || t.price === 8000 || t.price === 8200)) t.price = 5000;
            if (t.type === 'Group of 4' && (t.price === 12000 || t.price === 26000)) t.price = 26200;
            if (t.type === 'Second Wave' && (t.price === 6000 || t.price === 10000)) t.price = 10200;
            if (t.type === 'At the Entrance' && (t.price === 8000 || t.price === 12000)) t.price = 12200;
          });
          if (evt.startingPrice === 8200) evt.startingPrice = 5000;
        }
      });
      return events;
    } catch (e) {
      return DEFAULT_EVENTS;
    }
  }

  isEventActive(event) {
    if (!event) return false;
    const st = String(event.status || event.onboardingStatus || 'APPROVED').trim().toUpperCase();
    if (st.includes('PENDING') || st.includes('REJECT') || st.includes('SUSPEND') || st.includes('ACTION REQUIRED') || st === 'DRAFT' || st === 'PAUSED' || st === 'UNDER REVIEW') {
      return false;
    }
    if (!event.date) return true;
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const evDate = new Date(event.date + (event.date.includes('T') ? '' : 'T23:59:59'));
      if (!isNaN(evDate.getTime())) {
        return evDate >= today;
      }
      return true;
    } catch (e) {
      return true;
    }
  }

  isEventDatePassed(event) {
    if (!event || !event.date) return false;
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const evDate = new Date(event.date + (event.date.includes('T') ? '' : 'T23:59:59'));
      return !isNaN(evDate.getTime()) && evDate < today;
    } catch (e) {
      return false;
    }
  }

  getActiveEvents() {
    return this.getEvents().filter(e => this.isEventActive(e));
  }

  getEventById(id) {
    const events = this.getEvents();
    return events.find(e => e.id === id) || events[0];
  }

  saveEvent(event) {
    const events = this.getEvents();
    if (!event.id) {
      event.id = 'evt-' + Date.now().toString().slice(-6);
      if (event.featured === undefined) {
        event.featured = true; // Newly created events are featured by default so they pop on homepage
      }
      if (!event.status) {
        event.status = 'APPROVED';
      }
      if (!event.onboardingStatus) {
        event.onboardingStatus = 'APPROVED';
      }
    } else {
      if (!event.status) {
        event.status = 'APPROVED';
      }
      if (!event.onboardingStatus) {
        event.onboardingStatus = 'APPROVED';
      }
    }
    if (!event.state) {
      const locStr = `${event.venue || ''} ${event.venueAddress || ''} ${event.city || ''}`.toLowerCase();
      if (locStr.includes('lagos')) event.state = 'Lagos';
      else if (locStr.includes('oyo') || locStr.includes('ibadan')) event.state = 'Oyo';
      else if (locStr.includes('abuja')) event.state = 'FCT - Abuja';
      else if (locStr.includes('rivers') || locStr.includes('port harcourt')) event.state = 'Rivers';
      else if (locStr.includes('kano')) event.state = 'Kano';
      else event.state = 'Lagos';
    }
    const existingIndex = events.findIndex(e => e.id === event.id);
    if (existingIndex >= 0) {
      events[existingIndex] = event;
    } else {
      events.unshift(event);
    }

    try {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    } catch (e) {
      console.warn('localStorage quota hit on saveEvent, pruning old heavy cache entries:', e);
      const safeEvents = events.map((ev, idx) => {
        if (idx > 1 && ev.banner && ev.banner.startsWith('data:image/') && ev.banner.length > 40000) {
          return { ...ev, banner: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80' };
        }
        return ev;
      });
      try {
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(safeEvents));
      } catch (err2) {
        console.warn('Failed secondary save to localStorage:', err2);
      }
    }

    if (db) {
      try {
        setDoc(doc(db, 'events', event.id), event, { merge: true });
      } catch (e) {
        console.warn('Firestore saveEvent error:', e);
      }
    }

    window.dispatchEvent(new CustomEvent('bookam_store_updated', { detail: { type: 'events', eventId: event.id } }));
    return event;
  }

  deleteEvent(eventId) {
    let events = this.getEvents();
    events = events.filter(e => e.id !== eventId);
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));

    if (db) {
      try {
        deleteDoc(doc(db, 'events', eventId));
      } catch (e) {
        console.warn('Firestore deleteEvent error:', e);
      }
    }
    window.dispatchEvent(new CustomEvent('bookam_store_updated', { detail: { type: 'events' } }));
    return true;
  }

  // --- CURRENT ORDER (Checkout Flow) ---
  setCurrentOrder(order) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_ORDER, JSON.stringify(order));
  }

  getCurrentOrder() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_ORDER)) || null;
    } catch (e) {
      return null;
    }
  }

  // --- PAYMENTS ---
  getPayments() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENTS)) || [];
    } catch (e) {
      return [];
    }
  }

  savePayment(payment) {
    const payments = this.getPayments();
    if (!payment.id) {
      payment.id = 'PAY-' + Math.floor(100000 + Math.random() * 900000);
    }
    payment.status = payment.status || 'Pending Approval';
    payment.createdAt = new Date().toISOString();
    payments.unshift(payment);
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));

    // Automatically attribute commission if influencer was attached to payment
    if (payment.influencerId && (parseFloat(payment.commissionAmount) || 0) > 0) {
      const inf = this.getInfluencerById(payment.influencerId);
      this.saveCommission({
        eventId: payment.eventId,
        influencerId: payment.influencerId,
        influencerName: inf ? inf.name : (payment.influencerName || 'Influencer'),
        influencerCode: payment.promoCode || (inf ? inf.promoCode : ''),
        paymentId: payment.id,
        ticketId: null,
        customerName: payment.customerName,
        orderTotal: payment.totalAmount,
        ticketQuantity: payment.quantity || 1,
        amount: parseFloat(payment.commissionAmount) || 0,
        status: payment.status === 'Approved' ? 'Approved' : 'Pending'
      });
      if (inf) {
        inf.usedCount = (parseInt(inf.usedCount) || 0) + 1;
        this.saveInfluencer(inf);
      }
    }

    if (db) {
      try {
        setDoc(doc(db, 'payments', payment.id), payment, { merge: true });
      } catch (e) {
        console.warn('Firestore savePayment error:', e);
      }
    }

    return payment;
  }

  updatePaymentStatus(paymentId, status, extraData = {}) {
    const payments = this.getPayments();
    const payment = payments.find(p => p.id === paymentId);
    if (payment) {
      payment.status = status;
      if (status === 'Rejected') {
        payment.rejectedAt = new Date().toISOString();
        if (extraData.reason) payment.rejectionReason = extraData.reason;
      }
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));

      // Handle commission lifecycle based on payment status
      if (status === 'Approved') {
        const commissions = this.getCommissions().filter(c => c.paymentId === paymentId);
        commissions.forEach(c => {
          if (c.status === 'Pending') {
            this.updateCommissionStatus(c.id, 'Approved');
          }
        });
      } else if (status === 'Rejected' || status === 'Cancelled' || status === 'Refunded') {
        this.reverseCommissionForPayment(paymentId);
      }

      // If rejected or cancelled, revoke any tickets generated for this payment
      if (status === 'Rejected' || status === 'Cancelled') {
        const tickets = this.getTickets();
        let ticketChanged = false;
        tickets.forEach(t => {
          if (t.paymentId === paymentId) {
            t.status = 'REVOKED';
            t.revocationReason = extraData.reason || 'Payment rejected by organizer';
            t.revokedAt = new Date().toISOString();
            ticketChanged = true;
            if (db) {
              try {
                setDoc(doc(db, 'tickets', t.id), {
                  status: 'REVOKED',
                  revocationReason: t.revocationReason,
                  revokedAt: t.revokedAt
                }, { merge: true });
              } catch (e) {}
            }
          }
        });
        if (ticketChanged) {
          localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
        }

        // If contest vote, subtract votes from contestant if previously approved
        if ((payment.type === 'Contest Vote' || payment.contestId) && payment.contestId) {
          const contest = this.getContestById(payment.contestId);
          if (contest && contest.contestants) {
            const contestant = contest.contestants.find(c => c.id === (payment.contestantId || payment.candidateId));
            if (contestant) {
              const votes = parseInt(payment.voteCount || payment.quantity || 1);
              contestant.votes = Math.max(0, (parseInt(contestant.votes) || 0) - votes);
              this.saveContest(contest);
            }
          }
        }
      }

      const firestorePayload = { status };
      if (status === 'Rejected') {
        firestorePayload.rejectedAt = payment.rejectedAt;
        if (payment.rejectionReason) firestorePayload.rejectionReason = payment.rejectionReason;
      }

      if (db) {
        try {
          setDoc(doc(db, 'payments', paymentId), firestorePayload, { merge: true });
        } catch (e) {
          console.warn('Firestore updatePaymentStatus error:', e);
        }
      }

      window.dispatchEvent(new CustomEvent('bookam_store_updated', { detail: { type: 'payments', paymentId, status } }));
    }
    return payment;
  }

  getPaymentById(paymentId) {
    if (!paymentId) return null;
    const payments = this.getPayments();
    return payments.find(p => p.id === paymentId || p.paymentRef === paymentId);
  }

  getPaymentByRef(ref) {
    if (!ref) return null;
    const cleanRef = ref.trim().toUpperCase();
    const payments = this.getPayments();
    return payments.find(p => 
      (p.paymentRef && p.paymentRef.toUpperCase() === cleanRef) ||
      (p.id && p.id.toUpperCase() === cleanRef)
    );
  }

  findPayment(query) {
    if (!query) return null;
    const clean = query.trim().toLowerCase();
    const payments = this.getPayments();
    return payments.find(p => 
      (p.paymentRef && p.paymentRef.toLowerCase() === clean) ||
      (p.id && p.id.toLowerCase() === clean) ||
      (p.customerEmail && p.customerEmail.toLowerCase() === clean) ||
      (p.customerPhone && p.customerPhone.replace(/[^0-9]/g, '').includes(clean.replace(/[^0-9]/g, '')))
    );
  }

  getTicketByPaymentRef(ref) {
    if (!ref) return null;
    const payment = this.getPaymentByRef(ref);
    if (!payment) return null;
    return this.getTicketByPaymentId(payment.id);
  }

  deletePayment(paymentId) {
    let payments = this.getPayments();
    payments = payments.filter(p => p.id !== paymentId);
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));

    // Reverse associated commission if payment is deleted
    this.reverseCommissionForPayment(paymentId);

    if (db) {
      try {
        deleteDoc(doc(db, 'payments', paymentId));
      } catch (e) {
        console.warn('Firestore deletePayment error:', e);
      }
    }
    window.dispatchEvent(new CustomEvent('bookam_store_updated', { detail: { type: 'payments' } }));
    return true;
  }

  clearProcessedPayments() {
    let payments = this.getPayments();
    const processed = payments.filter(p => p.status !== 'Pending Approval');
    payments = payments.filter(p => p.status === 'Pending Approval');
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));

    if (db) {
      processed.forEach(p => {
        try {
          deleteDoc(doc(db, 'payments', p.id));
        } catch (e) {}
      });
    }
    window.dispatchEvent(new CustomEvent('bookam_store_updated', { detail: { type: 'payments' } }));
    return true;
  }

  deleteTicket(ticketId) {
    let tickets = this.getTickets();
    const ticket = tickets.find(t => t.id === ticketId);
    tickets = tickets.filter(t => t.id !== ticketId);
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));

    if (ticket && ticket.paymentId) {
      this.deletePayment(ticket.paymentId);
    }

    if (db) {
      try {
        deleteDoc(doc(db, 'tickets', ticketId));
      } catch (e) {
        console.warn('Firestore deleteTicket error:', e);
      }
    }
    window.dispatchEvent(new CustomEvent('bookam_store_updated', { detail: { type: 'tickets' } }));
    return true;
  }

  deleteAllTickets() {
    const tickets = this.getTickets();
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify([]));
    
    let payments = this.getPayments();
    const approvedPayments = payments.filter(p => p.status === 'Approved');
    payments = payments.filter(p => p.status !== 'Approved');
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));

    if (db) {
      tickets.forEach(t => {
        try {
          deleteDoc(doc(db, 'tickets', t.id));
        } catch (e) {
          console.warn('Firestore deleteAllTickets error:', e);
        }
      });
      approvedPayments.forEach(p => {
        try {
          deleteDoc(doc(db, 'payments', p.id));
        } catch (e) {}
      });
    }
    window.dispatchEvent(new CustomEvent('bookam_store_updated', { detail: { type: 'tickets' } }));
    return true;
  }

  resetPlatformMetricsToZero() {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify([]));
    if (db) {
      try {
        getDocs(collection(db, 'tickets')).then(snap => {
          snap.forEach(d => {
            deleteDoc(doc(db, 'tickets', d.id)).catch(() => {});
          });
        }).catch(() => {});
        getDocs(collection(db, 'payments')).then(snap => {
          snap.forEach(d => {
            deleteDoc(doc(db, 'payments', d.id)).catch(() => {});
          });
        }).catch(() => {});
      } catch (e) {}
    }
    window.dispatchEvent(new CustomEvent('bookam_store_updated', { detail: { type: 'reset_zero' } }));
    return true;
  }

  deleteExpiredEvents() {
    const events = this.getEvents();
    const activeEvents = events.filter(e => !this.isEventDatePassed(e));
    const expiredEvents = events.filter(e => this.isEventDatePassed(e));

    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(activeEvents));
    if (db) {
      expiredEvents.forEach(e => {
        try {
          deleteDoc(doc(db, 'events', e.id));
        } catch (err) {
          console.warn('Firestore deleteExpiredEvents error:', err);
        }
      });
    }
    window.dispatchEvent(new CustomEvent('bookam_store_updated', { detail: { type: 'events' } }));
    return expiredEvents.length;
  }

  // --- TICKETS ---
  getTickets() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.TICKETS)) || [];
    } catch (e) {
      return [];
    }
  }

  getTicketById(id) {
    const tickets = this.getTickets();
    return tickets.find(t => t.id === id);
  }

  getTicketByPaymentId(paymentId) {
    const tickets = this.getTickets();
    return tickets.find(t => t.paymentId === paymentId);
  }

  generateTicketForPayment(payment) {
    const existing = this.getTicketByPaymentId(payment.id);
    if (existing) return existing;

    const tickets = this.getTickets();
    const ticketCount = tickets.length + 1;
    const year = new Date().getFullYear();
    const ticketNumber = `BKM-${year}-${String(ticketCount).padStart(6, '0')}`;

    const newTicket = {
      id: ticketNumber,
      paymentId: payment.id,
      eventId: payment.eventId,
      eventName: payment.eventName,
      eventDate: payment.eventDate,
      eventTime: payment.eventTime || '09:00 AM',
      eventVenue: payment.eventVenue,
      customerName: payment.customerName,
      customerEmail: payment.customerEmail,
      customerPhone: payment.customerPhone,
      ticketType: payment.ticketType,
      quantity: payment.quantity,
      totalAmount: payment.totalAmount,
      status: 'ACTIVE',
      approvedAt: new Date().toISOString(),
      emailDispatched: true,
      dispatchedAt: new Date().toISOString(),
      dispatchedTo: payment.customerEmail
    };

    tickets.unshift(newTicket);
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));

    if (db) {
      try {
        setDoc(doc(db, 'tickets', newTicket.id), newTicket, { merge: true });
      } catch (e) {
        console.warn('Firestore generateTicket error:', e);
      }
    }

    return newTicket;
  }

  resendTicketEmail(ticketId) {
    const tickets = this.getTickets();
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket) {
      ticket.emailDispatched = true;
      ticket.lastResentAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));

      if (db) {
        try {
          setDoc(doc(db, 'tickets', ticketId), { emailDispatched: true, lastResentAt: ticket.lastResentAt }, { merge: true });
        } catch (e) {
          console.warn('Firestore resendTicketEmail error:', e);
        }
      }
    }
    return ticket;
  }

  searchTickets(query) {
    if (!query) return [];
    const q = query.trim().toLowerCase();
    const tickets = this.getTickets();
    return tickets.filter(t => {
      const matchId = (t.id || '').toLowerCase().includes(q);
      const matchEmail = (t.customerEmail || '').toLowerCase().includes(q);
      const matchName = (t.customerName || '').toLowerCase().includes(q);
      const matchPayment = (t.paymentId || '').toLowerCase().includes(q);
      const matchEvent = (t.eventName || '').toLowerCase().includes(q);
      return matchId || matchEmail || matchName || matchPayment || matchEvent;
    });
  }

  // --- VENUE RFPS ---
  getVenueRfps() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.VENUE_RFPS)) || [];
    } catch (e) {
      return [];
    }
  }

  saveVenueRfp(rfpData) {
    const rfps = this.getVenueRfps();
    const refNumber = 'RFP-' + Date.now().toString().slice(-6);
    const newRfp = {
      id: refNumber,
      hall: rfpData.hall || 'Landmark Hall',
      type: rfpData.type || 'Conference',
      attendees: parseInt(rfpData.attendees, 10) || 500,
      targetDate: rfpData.date || rfpData.targetDate || '',
      days: parseInt(rfpData.days, 10) || 1,
      contactName: rfpData.name || rfpData.contactName || 'Corporate Client',
      email: rfpData.email || '',
      phone: rfpData.phone || '',
      notes: rfpData.notes || '',
      status: 'Pending Proposal',
      createdAt: new Date().toISOString()
    };

    rfps.unshift(newRfp);
    localStorage.setItem(STORAGE_KEYS.VENUE_RFPS, JSON.stringify(rfps));

    this.addAuditLog('VENUE_RFP_SUBMITTED', newRfp.contactName, `Submitted Venue RFP ${refNumber} for "${newRfp.hall}"`);
    this.addNotification({
      title: `New Venue RFP: ${newRfp.hall}`,
      message: `${newRfp.contactName} (${newRfp.email}) requested proposal for ${newRfp.attendees} guests on ${newRfp.targetDate}`,
      type: 'venue_rfp',
      link: '#tab-notifications'
    });

    window.dispatchEvent(new CustomEvent('bookam_store_updated', { detail: { type: 'rfps' } }));
    return newRfp;
  }

  updateVenueRfpStatus(id, status) {
    const rfps = this.getVenueRfps();
    const item = rfps.find(r => r.id === id);
    if (item) {
      item.status = status;
      item.updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.VENUE_RFPS, JSON.stringify(rfps));
      this.addAuditLog('VENUE_RFP_STATUS', 'Super Admin', `Updated RFP ${id} status to "${status}"`);
      window.dispatchEvent(new CustomEvent('bookam_store_updated', { detail: { type: 'rfps' } }));
    }
    return item;
  }

  // --- ORGANIZER AUTH & PROFILE ---
  getOrganizersList() {
    let list = [];
    try {
      list = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORGANIZERS_LIST)) || [];
    } catch (e) {
      list = [];
    }

    const adminEmail = 'bookam26@gmail.com';
    const adminAccount = {
      id: 'org-admin-001',
      name: 'KAIWE DIGITAL',
      organizationName: 'KAIWE DIGITAL',
      email: 'Bookam26@gmail.com',
      password: 'Linodrip$1123',
      phone: '+234 916 290 1356',
      bankName: 'Moniepoint',
      accountName: 'KAIWE DIGITAL',
      accountNumber: '8021174926',
      registeredAt: new Date().toISOString()
    };

    const existingIndex = list.findIndex(o => o.email.toLowerCase() === adminEmail);
    if (existingIndex >= 0) {
      list[existingIndex].password = 'Linodrip$1123';
      list[existingIndex].bankName = 'Moniepoint';
      list[existingIndex].accountName = 'KAIWE DIGITAL';
      list[existingIndex].accountNumber = '8021174926';
    } else {
      list.unshift(adminAccount);
    }

    localStorage.setItem(STORAGE_KEYS.ORGANIZERS_LIST, JSON.stringify(list));
    return list;
  }

  registerOrganizer(data) {
    const organizers = this.getOrganizersList();
    const existing = organizers.find(o => o.email.toLowerCase() === data.email.toLowerCase().trim());
    if (existing) {
      return { success: false, message: 'An organizer account with this email address already exists.' };
    }

    const newOrganizer = {
      id: 'org-' + Date.now().toString().slice(-6),
      name: data.name.trim(),
      organizationName: data.organizationName ? data.organizationName.trim() : data.name.trim(),
      email: data.email.toLowerCase().trim(),
      password: data.password,
      phone: data.phone || '',
      bankName: data.bankName || 'Moniepoint',
      accountName: data.accountName || 'KAIWE DIGITAL',
      accountNumber: data.accountNumber || '8021174926',
      registeredAt: new Date().toISOString()
    };

    organizers.push(newOrganizer);
    localStorage.setItem(STORAGE_KEYS.ORGANIZERS_LIST, JSON.stringify(organizers));

    if (db) {
      try {
        setDoc(doc(db, 'organizers', newOrganizer.id), newOrganizer, { merge: true });
      } catch (e) {
        console.warn('Firestore registerOrganizer error:', e);
      }
    }
    
    // Set as current active organizer session
    this.setCurrentOrganizer(newOrganizer);
    return { success: true, organizer: newOrganizer };
  }

  loginOrganizer(email, password) {
    const organizers = this.getOrganizersList();
    const cleanEmail = email.toLowerCase().trim();
    const match = organizers.find(o => o.email.toLowerCase() === cleanEmail && o.password === password);

    if (match) {
      this.setCurrentOrganizer(match);
      return { success: true, organizer: match };
    }
    return { success: false, message: 'Invalid email address or password. Please try again.' };
  }

  setCurrentOrganizer(organizer) {
    const safeOrg = { ...organizer };
    delete safeOrg.password;
    localStorage.setItem(STORAGE_KEYS.CURRENT_ORGANIZER, JSON.stringify(safeOrg));
    localStorage.setItem(STORAGE_KEYS.ORGANIZER, JSON.stringify({
      name: organizer.name || 'KAIWE DIGITAL',
      organizationName: organizer.organizationName || organizer.name || 'KAIWE DIGITAL',
      email: organizer.email || 'Bookam26@gmail.com',
      bankName: 'Moniepoint',
      accountName: 'KAIWE DIGITAL',
      accountNumber: '8021174926'
    }));
  }

  getCurrentOrganizer() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_ORGANIZER)) || null;
    } catch (e) {
      return null;
    }
  }

  isOrganizerLoggedIn() {
    return !!this.getCurrentOrganizer();
  }

  logoutOrganizer() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_ORGANIZER);
  }

  getOrganizer() {
    // All events entering the website use this bank account
    return {
      name: 'KAIWE DIGITAL',
      organizationName: 'KAIWE DIGITAL',
      email: 'Bookam26@gmail.com',
      bankName: 'Moniepoint',
      accountName: 'KAIWE DIGITAL',
      accountNumber: '8021174926'
    };
  }

  getOrganizerInfo() {
    return this.getOrganizer();
  }

  // --- TICKET TIERS HELPER ---
  createDefaultTicketTiers(prices = {}, earlyBirdEndDate = null) {
    return [
      {
        type: 'Early bird',
        name: 'Early Bird Ticket',
        price: parseFloat(prices['Early bird'] || prices.earlyBird || 5000),
        endDate: earlyBirdEndDate || null,
        benefits: ['Early Bird Discounted Pass', 'Standard Venue Entry', 'Digital Pass Delivery']
      },
      {
        type: 'First Wave',
        name: 'First Wave Ticket',
        price: parseFloat(prices['First Wave'] || prices.firstWave || 5000),
        benefits: ['First Wave Admission', 'Standard Venue Access', 'Fast-track Entry']
      },
      {
        type: 'Group of 4',
        name: 'Group of 4 Ticket',
        price: parseFloat(prices['Group of 4'] || prices.group4 || 26200),
        benefits: ['Includes 4 Admission Passes', 'Group Discount Package', 'Dedicated Team Seating']
      },
      {
        type: 'Second Wave',
        name: 'Second Wave Ticket',
        price: parseFloat(prices['Second Wave'] || prices.secondWave || 10200),
        benefits: ['Second Wave Admission', 'Full Event Access', 'Standard Venue Entry']
      },
      {
        type: 'At the Entrance',
        name: 'At the Entrance Ticket',
        price: parseFloat(prices['At the Entrance'] || prices.entrance || 12200),
        benefits: ['Gate / On-Site Payment Pass', 'Immediate Gate Entry', 'On-Demand Check-in']
      }
    ];
  }

  // --- CONTESTS ---
  getContests() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CONTESTS)) || DEFAULT_CONTESTS;
    } catch (e) {
      return DEFAULT_CONTESTS;
    }
  }

  getActiveContests() {
    const contests = this.getContests();
    const todayStr = new Date().toISOString().split('T')[0];
    return contests.filter(c => c.status === 'Active' && (!c.endDate || c.endDate >= todayStr));
  }

  getContestById(id) {
    const contests = this.getContests();
    return contests.find(c => c.id === id) || contests[0];
  }

  saveContest(contest) {
    const contests = this.getContests();
    if (!contest.id) {
      contest.id = 'cnt-' + Date.now().toString().slice(-6);
      contest.createdAt = new Date().toISOString();
      contest.status = contest.status || 'Active';
      contest.contestants = contest.contestants || [];
    }
    const index = contests.findIndex(c => c.id === contest.id);
    if (index >= 0) {
      contests[index] = contest;
    } else {
      contests.unshift(contest);
    }
    localStorage.setItem(STORAGE_KEYS.CONTESTS, JSON.stringify(contests));

    if (db) {
      try {
        setDoc(doc(db, 'contests', contest.id), contest, { merge: true });
      } catch (e) {
        console.warn('Firestore saveContest error:', e);
      }
    }
    window.dispatchEvent(new CustomEvent('bookam_store_updated', { detail: { type: 'contests' } }));
    return contest;
  }

  deleteContest(contestId) {
    let contests = this.getContests();
    contests = contests.filter(c => c.id !== contestId);
    localStorage.setItem(STORAGE_KEYS.CONTESTS, JSON.stringify(contests));

    if (db) {
      try {
        deleteDoc(doc(db, 'contests', contestId));
      } catch (e) {
        console.warn('Firestore deleteContest error:', e);
      }
    }
    window.dispatchEvent(new CustomEvent('bookam_store_updated', { detail: { type: 'contests' } }));
    return true;
  }

  updateContestStatus(contestId, newStatus, adminNote = '') {
    const contests = this.getContests();
    const contest = contests.find(c => c.id === contestId);
    if (!contest) return null;
    const previousStatus = contest.status || 'Pending Review';
    contest.status = newStatus;
    contest.reviewedAt = new Date().toISOString();
    if (adminNote) contest.adminReviewNote = adminNote;
    if (newStatus === 'Active' || newStatus === 'APPROVED') {
      contest.approvedAt = new Date().toISOString();
    }
    localStorage.setItem(STORAGE_KEYS.CONTESTS, JSON.stringify(contests));
    if (db) {
      try {
        setDoc(doc(db, 'contests', contestId), {
          status: newStatus,
          reviewedAt: contest.reviewedAt,
          adminReviewNote: adminNote
        }, { merge: true });
      } catch (e) {}
    }
    this.addAuditLog({
      admin: 'Bookam26@gmail.com',
      action: 'CONTEST_STATUS_' + newStatus.replace(/\s+/g, '_').toUpperCase(),
      entity: 'Contest',
      entityId: contestId,
      details: `Contest "${contest.title}" status changed from "${previousStatus}" to "${newStatus}". Note: ${adminNote || 'No notes'}`
    });
    window.dispatchEvent(new CustomEvent('bookam_store_updated', { detail: { type: 'contests' } }));
    return contest;
  }

  addContestant(contestId, contestant) {
    const contest = this.getContestById(contestId);
    if (!contest) return null;
    if (!contestant.id) {
      contestant.id = 'cst-' + Date.now().toString().slice(-6);
    }
    contestant.votes = parseInt(contestant.votes || 0);
    contest.contestants = contest.contestants || [];
    contest.contestants.push(contestant);
    this.saveContest(contest);
    return contestant;
  }

  updateContestant(contestId, contestantId, updatedData) {
    const contest = this.getContestById(contestId);
    if (!contest) return null;
    contest.contestants = contest.contestants || [];
    const index = contest.contestants.findIndex(c => c.id === contestantId);
    if (index >= 0) {
      contest.contestants[index] = {
        ...contest.contestants[index],
        ...updatedData,
        votes: updatedData.votes !== undefined ? parseInt(updatedData.votes) : contest.contestants[index].votes
      };
      this.saveContest(contest);
      return contest.contestants[index];
    }
    return null;
  }

  deleteContestant(contestId, contestantId) {
    const contest = this.getContestById(contestId);
    if (!contest) return false;
    contest.contestants = (contest.contestants || []).filter(c => c.id !== contestantId);
    this.saveContest(contest);
    return true;
  }

  getContestantByIdOrCode(contestId, idOrCode) {
    const contest = this.getContestById(contestId);
    if (!contest || !contest.contestants) return null;
    const clean = String(idOrCode || '').toLowerCase().trim();
    return contest.contestants.find(c => 
      (c.id && c.id.toLowerCase() === clean) ||
      (c.code && String(c.code).toLowerCase() === clean)
    ) || null;
  }

  // --- CONTESTANT NOMINATIONS & REGISTRATIONS ---
  getNominations(contestId = null) {
    try {
      const list = JSON.parse(localStorage.getItem('bookam_nominations')) || [];
      if (contestId) {
        return list.filter(n => n.contestId === contestId);
      }
      return list;
    } catch (e) {
      return [];
    }
  }

  saveNomination(nomination) {
    const list = this.getNominations();
    if (!nomination.id) {
      nomination.id = 'nom-' + Date.now().toString().slice(-6);
      nomination.createdAt = new Date().toISOString();
      nomination.status = nomination.status || 'Pending Review';
    }
    const idx = list.findIndex(n => n.id === nomination.id);
    if (idx >= 0) {
      list[idx] = nomination;
    } else {
      list.unshift(nomination);
    }
    localStorage.setItem('bookam_nominations', JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('bookam_store_updated', { detail: { type: 'nominations' } }));
    return nomination;
  }

  approveNomination(nominationId) {
    const list = this.getNominations();
    const nom = list.find(n => n.id === nominationId);
    if (!nom) return null;

    nom.status = 'Approved';
    localStorage.setItem('bookam_nominations', JSON.stringify(list));

    // Generate unique contestant code
    const contest = this.getContestById(nom.contestId);
    const existingCodes = (contest?.contestants || []).map(c => parseInt(c.code)).filter(n => !isNaN(n));
    const nextCode = existingCodes.length > 0 ? String(Math.max(...existingCodes) + 1).padStart(3, '0') : '101';

    // Add directly to contest
    this.addContestant(nom.contestId, {
      name: nom.name,
      code: nom.preferredCode || nextCode,
      photo: nom.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      bio: nom.bio || 'Official registered nominee',
      votes: 0,
      email: nom.email,
      phone: nom.phone
    });

    window.dispatchEvent(new CustomEvent('bookam_store_updated', { detail: { type: 'nominations' } }));
    return nom;
  }

  rejectNomination(nominationId) {
    const list = this.getNominations();
    const nom = list.find(n => n.id === nominationId);
    if (nom) {
      nom.status = 'Rejected';
      localStorage.setItem('bookam_nominations', JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('bookam_store_updated', { detail: { type: 'nominations' } }));
    }
    return nom;
  }

  // --- NIGERIAN BANKS LIST ---
  getNigerianBanks() {
    return [
      'Moniepoint Microfinance Bank',
      'OPay Digital Services',
      'PalmPay',
      'Kuda Bank',
      'Guaranty Trust Bank (GTBank)',
      'Zenith Bank',
      'Access Bank',
      'First Bank of Nigeria',
      'United Bank for Africa (UBA)',
      'Stanbic IBTC Bank',
      'Sterling Bank',
      'Fidelity Bank',
      'Union Bank of Nigeria',
      'First City Monument Bank (FCMB)',
      'Wema Bank / ALAT',
      'Providus Bank',
      'Keystone Bank',
      'Ecobank Nigeria',
      'Heritage Bank',
      'Jaiz Bank',
      'Taj Bank',
      'Titan Trust Bank',
      'Other'
    ];
  }

  // --- CONTESTANT SHARE & DASHBOARD LINKS ---
  getContestantShareLink(contestId, contestantCode) {
    const origin = window.location.origin;
    const path = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
    return `${origin}${path}/contest-details.html?id=${encodeURIComponent(contestId)}&cst=${encodeURIComponent(contestantCode)}`;
  }

  getContestantDashboardLink(contestId, contestantCode) {
    const origin = window.location.origin;
    const path = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
    return `${origin}${path}/contestant.html?contest=${encodeURIComponent(contestId)}&code=${encodeURIComponent(contestantCode)}`;
  }

  getContestantVoteHistory(contestId, contestantIdOrCode) {
    const payments = this.getPayments();
    const contest = this.getContestById(contestId);
    let targetCstId = contestantIdOrCode;
    if (contest && contest.contestants) {
      const match = this.getContestantByIdOrCode(contestId, contestantIdOrCode);
      if (match) targetCstId = match.id;
    }
    return payments.filter(p => 
      p.contestId === contestId && 
      (p.contestantId === targetCstId || p.contestantName === targetCstId)
    );
  }

  exportContestResultsCsv(contestId) {
    const contest = this.getContestById(contestId);
    if (!contest) return false;

    const contestants = [...(contest.contestants || [])].sort((a, b) => (parseInt(b.votes) || 0) - (parseInt(a.votes) || 0));
    const totalVotes = contestants.reduce((s, c) => s + (parseInt(c.votes) || 0), 0);
    const votePrice = parseFloat(contest.votePrice || 100);

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += `Contest Title,"${(contest.title || '').replace(/"/g, '""')}"\r\n`;
    csvContent += `Category,"${contest.category || ''}"\r\n`;
    csvContent += `Total Votes,${totalVotes}\r\n`;
    csvContent += `Total Revenue (NGN),₦${(totalVotes * votePrice).toLocaleString()}\r\n`;
    csvContent += `Export Date,"${new Date().toLocaleString()}"\r\n\r\n`;
    csvContent += 'Rank,Contestant Code,Contestant Name,Votes,Vote Share %,Revenue (NGN),Status\r\n';

    contestants.forEach((c, idx) => {
      const v = parseInt(c.votes) || 0;
      const share = totalVotes > 0 ? ((v / totalVotes) * 100).toFixed(2) + '%' : '0.00%';
      const rev = v * votePrice;
      csvContent += `${idx + 1},"${c.code || ''}","${(c.name || '').replace(/"/g, '""')}",${v},${share},${rev},${c.status || 'Active'}\r\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BOOKAM_${(contest.title || 'Contest').replace(/\s+/g, '_')}_Results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  }

  castVotes({ contestId, contestantId, voteCount, voterName, voterEmail, voterPhone, paymentMethod, proofUrl }) {
    const contest = this.getContestById(contestId);
    if (!contest) throw new Error('Contest not found');

    const contestant = (contest.contestants || []).find(c => c.id === contestantId);
    if (!contestant) throw new Error('Contestant not found');

    const votesToCast = parseInt(voteCount) || 1;
    const votePrice = parseFloat(contest.votePrice || 100);
    const subtotal = votePrice * votesToCast;
    const serviceCharge = +(subtotal * 0.05).toFixed(2);
    const total = subtotal + serviceCharge;

    // 1. Record Vote Payment - Awaiting organizer approval on dashboard (do not auto-approve!)
    const paymentRecord = {
      id: 'VOTE-PAY-' + Math.floor(100000 + Math.random() * 900000),
      type: 'Contest Vote',
      contestId: contest.id,
      contestTitle: contest.title,
      contestantId: contestant.id,
      contestantName: contestant.name,
      voteCount: votesToCast,
      customerName: voterName,
      customerEmail: voterEmail,
      customerPhone: voterPhone,
      subtotal: subtotal,
      serviceCharge: serviceCharge,
      total: total,
      paymentMethod: paymentMethod || 'Bank Transfer',
      proofUrl: proofUrl || '',
      status: 'Pending Approval', // Awaiting manual organizer approval on dashboard!
      createdAt: new Date().toISOString()
    };

    this.savePayment(paymentRecord);
    window.dispatchEvent(new CustomEvent('bookam_store_updated', { detail: { type: 'payments', paymentId: paymentRecord.id } }));

    return { contest, contestant, paymentRecord };
  }

  // Record approved contest votes when organizer accepts payment
  recordContestVotePayment(payment) {
    if (!payment || !payment.contestId) return;
    const contest = this.getContestById(payment.contestId);
    if (!contest) return;
    const contestant = (contest.contestants || []).find(c => c.id === (payment.contestantId || payment.candidateId));
    if (!contestant) return;
    const votesToCast = parseInt(payment.voteCount || payment.quantity || 1);
    contestant.votes = (parseInt(contestant.votes) || 0) + votesToCast;
    this.saveContest(contest);
    window.dispatchEvent(new CustomEvent('bookam_store_updated', { detail: { type: 'contests', contestId: contest.id, contestantId: contestant.id } }));
  }

  // --- INFLUENCERS & PROMOTERS (Event-Specific) ---
  getInfluencers(eventId = null) {
    try {
      const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.INFLUENCERS)) || DEFAULT_INFLUENCERS;
      if (eventId) {
        return list.filter(inf => inf.eventId === eventId);
      }
      return list;
    } catch (e) {
      return DEFAULT_INFLUENCERS;
    }
  }

  getInfluencerById(id) {
    const list = this.getInfluencers();
    return list.find(inf => inf.id === id) || null;
  }

  getInfluencerByPromoCode(promoCode, eventId = null) {
    if (!promoCode) return null;
    const clean = String(promoCode).trim().toUpperCase();
    const list = this.getInfluencers(eventId);
    return list.find(inf => inf.promoCode && inf.promoCode.toUpperCase() === clean) || null;
  }

  // --- AUTOMATIC PROMO CODE GENERATOR ---
  generatePromoCode(nameOrHandle = '', discountValue = 10, discountType = 'percentage', eventId = null) {
    let clean = String(nameOrHandle || '').trim().replace(/^@/, '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    
    // Fallback if empty
    if (!clean) {
      clean = 'PROMO';
    } else {
      // If words exist, pick first name or up to 8 chars
      const parts = clean.split(/\s+/);
      clean = parts[0].substring(0, 8);
    }

    let suffix = '';
    if (discountType === 'percentage' || discountType === 'percent' || discountType === 'percent15') {
      const num = parseInt(discountValue) || (discountType === 'percent15' ? 15 : 10);
      suffix = String(num);
    } else if (discountType === 'fixed') {
      const num = parseInt(discountValue) || 1000;
      suffix = num >= 1000 ? `${Math.round(num / 1000)}K` : String(num);
    } else {
      suffix = '10';
    }

    const baseCode = `${clean}${suffix}`.toUpperCase();

    // Ensure uniqueness within target event if specified
    if (eventId) {
      const existing = this.getInfluencers(eventId);
      let candidate = baseCode;
      let counter = 2;
      while (existing.some(i => i.promoCode && i.promoCode.toUpperCase() === candidate)) {
        candidate = `${baseCode}${counter}`;
        counter++;
      }
      return candidate;
    }

    return baseCode;
  }

  getInfluencerByCodeOrRef(eventId, codeOrRef) {
    if (!codeOrRef) return null;
    const clean = String(codeOrRef).trim().toLowerCase().replace(/^@/, '');
    const list = this.getInfluencers(eventId);
    return list.find(inf => 
      (inf.promoCode && inf.promoCode.toLowerCase() === clean) ||
      (inf.username && inf.username.toLowerCase() === clean) ||
      (inf.id && inf.id.toLowerCase() === clean)
    ) || null;
  }

  getInfluencerByUsername(username, eventId = null) {
    if (!username) return null;
    const clean = String(username).trim().toLowerCase().replace(/^@/, '');
    const list = this.getInfluencers(eventId);
    return list.find(inf => inf.username && inf.username.toLowerCase() === clean) || null;
  }

  saveInfluencer(influencer) {
    const influencers = this.getInfluencers();
    if (!influencer.id) {
      influencer.id = 'inf-' + Date.now().toString().slice(-6);
      influencer.createdAt = new Date().toISOString();
      influencer.status = influencer.status || 'Active';
      influencer.clicks = parseInt(influencer.clicks) || 0;
      influencer.usedCount = parseInt(influencer.usedCount) || 0;
      influencer.ticketsSold = parseInt(influencer.ticketsSold) || 0;
      influencer.revenueGenerated = parseFloat(influencer.revenueGenerated) || 0;
      influencer.commissionEarned = parseFloat(influencer.commissionEarned) || 0;
    }
    // Clean fields
    if (influencer.promoCode) {
      influencer.promoCode = influencer.promoCode.trim().toUpperCase();
    } else {
      // Auto-generate promo code
      influencer.promoCode = this.generatePromoCode(
        influencer.name || influencer.username || 'PROMO',
        influencer.discountValue || 10,
        influencer.discountType || 'percentage',
        influencer.eventId || null
      );
    }
    if (influencer.username) {
      influencer.username = influencer.username.trim().toLowerCase().replace(/^@/, '');
    }
    if (!influencer.applicableTiers || influencer.applicableTiers.length === 0) {
      influencer.applicableTiers = ['all'];
    }

    const targetEvent = this.getEventById(influencer.eventId);
    if (targetEvent && !influencer.eventName) {
      influencer.eventName = targetEvent.title;
    }

    const index = influencers.findIndex(i => i.id === influencer.id);
    if (index >= 0) {
      influencers[index] = { ...influencers[index], ...influencer };
    } else {
      influencers.unshift(influencer);
    }
    localStorage.setItem(STORAGE_KEYS.INFLUENCERS, JSON.stringify(influencers));

    if (db) {
      try {
        setDoc(doc(db, 'influencers', influencer.id), influencer, { merge: true });
      } catch (e) {
        console.warn('Firestore saveInfluencer error:', e);
      }
    }
    window.dispatchEvent(new CustomEvent('bookam_store_updated', { detail: { type: 'influencers' } }));
    return influencer;
  }

  toggleInfluencerStatus(influencerId) {
    const influencer = this.getInfluencerById(influencerId);
    if (!influencer) return null;
    influencer.status = influencer.status === 'Active' ? 'Inactive' : 'Active';
    return this.saveInfluencer(influencer);
  }

  deleteInfluencer(influencerId) {
    let influencers = this.getInfluencers();
    influencers = influencers.filter(i => i.id !== influencerId);
    localStorage.setItem(STORAGE_KEYS.INFLUENCERS, JSON.stringify(influencers));

    if (db) {
      try {
        deleteDoc(doc(db, 'influencers', influencerId));
      } catch (e) {
        console.warn('Firestore deleteInfluencer error:', e);
      }
    }
    window.dispatchEvent(new CustomEvent('bookam_store_updated', { detail: { type: 'influencers' } }));
    return true;
  }

  // --- PROMOTER & INFLUENCER REGISTRATION ---
  registerInfluencer(data) {
    const influencers = this.getInfluencers();
    const cleanEmail = (data.email || '').trim().toLowerCase();
    const cleanUsername = (data.username || '').trim().toLowerCase().replace(/^@/, '');
    const cleanPassword = (data.password || '').trim();

    if (!cleanEmail || !data.name || !cleanPassword) {
      return { success: false, message: 'Please provide your full name, email address, and password.' };
    }

    if (influencers.some(i => i.email && i.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'An influencer account with this email already exists. Please sign in.' };
    }

    if (cleanUsername && influencers.some(i => i.username && i.username.toLowerCase() === cleanUsername)) {
      return { success: false, message: 'This promoter username is already taken. Please choose another username.' };
    }

    const newInfluencer = {
      id: 'inf-' + Date.now().toString().slice(-6),
      eventId: data.eventId || 'evt-001',
      eventName: data.eventName || 'All Events Platform Promoter',
      name: data.name.trim(),
      username: cleanUsername || cleanEmail.split('@')[0],
      email: cleanEmail,
      password: cleanPassword,
      phone: (data.phone || '').trim(),
      promoCode: data.promoCode ? data.promoCode.trim().toUpperCase() : this.generatePromoCode(data.name, 10, 'percentage', data.eventId),
      discountType: data.discountType || 'percentage',
      discountValue: parseFloat(data.discountValue) || 10,
      commissionType: data.commissionType || 'percentage',
      commissionValue: parseFloat(data.commissionValue) || 10,
      applicableTiers: ['all'],
      usageLimit: 0,
      usedCount: 0,
      clicks: 0,
      ticketsSold: 0,
      revenueGenerated: 0,
      commissionEarned: 0,
      bankName: (data.bankName || '').trim(),
      accountName: (data.accountName || '').trim(),
      accountNumber: (data.accountNumber || '').trim(),
      socialHandle: (data.socialHandle || '').trim(),
      status: 'Active',
      createdAt: new Date().toISOString()
    };

    const targetEvent = this.getEventById(newInfluencer.eventId);
    if (targetEvent) {
      newInfluencer.eventName = targetEvent.title;
    }

    const saved = this.saveInfluencer(newInfluencer);
    // Automatically log in newly registered influencer
    this.loginInfluencer(saved.email, cleanPassword);
    return { success: true, influencer: saved };
  }

  recordInfluencerClick(eventId, refCode) {
    if (!refCode) return false;
    const clean = String(refCode).trim().toLowerCase().replace(/^@/, '');
    const influencers = this.getInfluencers(eventId);
    const target = influencers.find(inf => 
      (inf.username && inf.username.toLowerCase() === clean) ||
      (inf.promoCode && inf.promoCode.toLowerCase() === clean) ||
      (inf.id && inf.id.toLowerCase() === clean)
    );

    if (target && target.status === 'Active') {
      target.clicks = (parseInt(target.clicks) || 0) + 1;
      this.saveInfluencer(target);
      return true;
    }
    return false;
  }

  validatePromoCode(eventId, promoCode, ticketType = null, subtotal = 0, quantity = 1) {
    if (!promoCode || !String(promoCode).trim()) {
      return { valid: false, message: 'Please enter a promo code' };
    }
    const cleanCode = String(promoCode).trim().toUpperCase();

    // Check all influencers to detect if code belongs to another event
    const allInfluencers = this.getInfluencers();
    const eventInfluencer = allInfluencers.find(inf => 
      (inf.promoCode && inf.promoCode.toUpperCase() === cleanCode) ||
      (inf.username && inf.username.toUpperCase() === cleanCode)
    );

    if (!eventInfluencer) {
      return { valid: false, message: 'Invalid promo code' };
    }

    // Event Isolation Check
    if (eventId && eventInfluencer.eventId !== eventId) {
      const eventTarget = this.getEventById(eventInfluencer.eventId);
      const targetName = eventTarget ? eventTarget.title : 'another event';
      return { 
        valid: false, 
        message: `Promo code "${cleanCode}" is only valid for "${targetName}". Not applicable to this event.`
      };
    }

    // Active Status Check
    if (eventInfluencer.status !== 'Active') {
      return { valid: false, message: 'This promo code is currently inactive or paused.' };
    }

    // Usage Limit Check
    if (eventInfluencer.usageLimit && eventInfluencer.usageLimit > 0) {
      if ((eventInfluencer.usedCount || 0) >= eventInfluencer.usageLimit) {
        return { valid: false, message: 'This promo code has reached its maximum usage limit.' };
      }
    }

    // Date Validity Check
    const todayStr = new Date().toISOString().split('T')[0];
    if (eventInfluencer.startDate && todayStr < eventInfluencer.startDate) {
      return { valid: false, message: `This promo code is not active yet (starts ${eventInfluencer.startDate}).` };
    }
    if (eventInfluencer.endDate && todayStr > eventInfluencer.endDate) {
      return { valid: false, message: `This promo code has expired on ${eventInfluencer.endDate}.` };
    }

    // Applicable Ticket Types Check
    if (ticketType && eventInfluencer.applicableTiers && Array.isArray(eventInfluencer.applicableTiers) && !eventInfluencer.applicableTiers.includes('all')) {
      const isApplicable = eventInfluencer.applicableTiers.some(tier => 
        tier && (
          String(tier).toLowerCase() === String(ticketType).toLowerCase() ||
          String(ticketType).toLowerCase().includes(String(tier).toLowerCase())
        )
      );
      if (!isApplicable) {
        return { 
          valid: false, 
          message: `This promo code is only valid for ticket tier(s): ${eventInfluencer.applicableTiers.join(', ')}.`
        };
      }
    }

    // Calculate Discount
    let discountAmount = 0;
    const numSubtotal = parseFloat(subtotal) || 0;
    const numQty = parseInt(quantity) || 1;

    if (eventInfluencer.discountType === 'percentage') {
      const pct = parseFloat(eventInfluencer.discountValue) || 0;
      discountAmount = (numSubtotal * pct) / 100;
    } else {
      // Fixed discount
      const fixedVal = parseFloat(eventInfluencer.discountValue) || 0;
      discountAmount = fixedVal * numQty;
    }

    // Cap discount at subtotal
    if (discountAmount > numSubtotal) {
      discountAmount = numSubtotal;
    }
    discountAmount = Math.round(discountAmount * 100) / 100;

    const discountedSubtotal = Math.max(0, numSubtotal - discountAmount);

    // Calculate Commission
    let commissionAmount = 0;
    if (eventInfluencer.commissionType === 'percentage') {
      const commPct = parseFloat(eventInfluencer.commissionValue) || 0;
      commissionAmount = (discountedSubtotal * commPct) / 100;
    } else {
      const commFixed = parseFloat(eventInfluencer.commissionValue) || 0;
      commissionAmount = commFixed * numQty;
    }
    commissionAmount = Math.round(commissionAmount * 100) / 100;

    return {
      valid: true,
      influencer: eventInfluencer,
      influencerId: eventInfluencer.id,
      promoCode: eventInfluencer.promoCode,
      discountType: eventInfluencer.discountType,
      discountValue: eventInfluencer.discountValue,
      discountAmount: discountAmount,
      discountedSubtotal: discountedSubtotal,
      commissionAmount: commissionAmount,
      commissionType: eventInfluencer.commissionType,
      commissionValue: eventInfluencer.commissionValue,
      message: `Promo code applied — You saved ${this.formatCurrency(discountAmount)}!`
    };
  }

  // --- COMMISSIONS ---
  getCommissions(eventId = null, influencerId = null) {
    try {
      let list = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMMISSIONS)) || DEFAULT_COMMISSIONS;
      if (eventId) {
        list = list.filter(c => c.eventId === eventId);
      }
      if (influencerId) {
        list = list.filter(c => c.influencerId === influencerId);
      }
      return list;
    } catch (e) {
      return DEFAULT_COMMISSIONS;
    }
  }

  getCommissionById(id) {
    const list = this.getCommissions();
    return list.find(c => c.id === id) || null;
  }

  saveCommission(commission) {
    const list = this.getCommissions();
    if (!commission.id) {
      commission.id = 'COM-' + Math.floor(1000 + Math.random() * 9000);
      commission.createdAt = new Date().toISOString();
      commission.status = commission.status || 'Pending';
    }
    const index = list.findIndex(c => c.id === commission.id);
    if (index >= 0) {
      list[index] = { ...list[index], ...commission };
    } else {
      list.unshift(commission);
    }
    localStorage.setItem(STORAGE_KEYS.COMMISSIONS, JSON.stringify(list));

    if (db) {
      try {
        setDoc(doc(db, 'commissions', commission.id), commission, { merge: true });
      } catch (e) {
        console.warn('Firestore saveCommission error:', e);
      }
    }
    window.dispatchEvent(new CustomEvent('bookam_store_updated', { detail: { type: 'commissions' } }));
    return commission;
  }

  updateCommissionStatus(commissionId, status) {
    const commission = this.getCommissionById(commissionId);
    if (!commission) return null;
    commission.status = status;
    if (status === 'Paid') {
      commission.paidAt = new Date().toISOString();
    }
    this.saveCommission(commission);

    // Also recalculate influencer stats
    this.syncInfluencerStats(commission.influencerId);
    return commission;
  }

  reverseCommissionForPayment(paymentId) {
    const commissions = this.getCommissions().filter(c => c.paymentId === paymentId);
    commissions.forEach(c => {
      c.status = 'Reversed';
      this.saveCommission(c);
      this.syncInfluencerStats(c.influencerId);
    });
  }

  syncInfluencerStats(influencerId) {
    const influencer = this.getInfluencerById(influencerId);
    if (!influencer) return;

    const commissions = this.getCommissions(null, influencerId);
    const validCommissions = commissions.filter(c => c.status !== 'Reversed');

    const ticketsSold = validCommissions.reduce((sum, c) => sum + (parseInt(c.ticketQuantity) || 1), 0);
    const revenueGenerated = validCommissions.reduce((sum, c) => sum + (parseFloat(c.orderTotal) || 0), 0);
    const commissionEarned = validCommissions.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
    const usedCount = validCommissions.length;

    influencer.ticketsSold = ticketsSold;
    influencer.revenueGenerated = revenueGenerated;
    influencer.commissionEarned = commissionEarned;
    influencer.usedCount = usedCount;

    this.saveInfluencer(influencer);
  }

  getInfluencerAnalytics(eventId = null) {
    const influencers = this.getInfluencers(eventId);
    const commissions = this.getCommissions(eventId);

    const totalClicks = influencers.reduce((acc, inf) => acc + (parseInt(inf.clicks) || 0), 0);
    const totalTicketsSold = commissions
      .filter(c => c.status !== 'Reversed')
      .reduce((acc, c) => acc + (parseInt(c.ticketQuantity) || 1), 0);

    const totalRevenueGenerated = commissions
      .filter(c => c.status !== 'Reversed')
      .reduce((acc, c) => acc + (parseFloat(c.orderTotal) || 0), 0);

    const totalCommissionsEarned = commissions
      .filter(c => c.status !== 'Reversed')
      .reduce((acc, c) => acc + (parseFloat(c.amount) || 0), 0);

    const pendingCommissions = commissions
      .filter(c => c.status === 'Pending')
      .reduce((acc, c) => acc + (parseFloat(c.amount) || 0), 0);

    const approvedCommissions = commissions
      .filter(c => c.status === 'Approved')
      .reduce((acc, c) => acc + (parseFloat(c.amount) || 0), 0);

    const paidCommissions = commissions
      .filter(c => c.status === 'Paid')
      .reduce((acc, c) => acc + (parseFloat(c.amount) || 0), 0);

    const overallConversionRate = totalClicks > 0 
      ? ((totalTicketsSold / totalClicks) * 100).toFixed(1)
      : '0.0';

    // Top Promoter
    let topPromoter = null;
    if (influencers.length > 0) {
      const sorted = [...influencers].sort((a, b) => (b.ticketsSold || 0) - (a.ticketsSold || 0));
      topPromoter = sorted[0];
    }

    return {
      totalInfluencers: influencers.length,
      totalClicks,
      totalTicketsSold,
      totalRevenueGenerated,
      totalCommissionsEarned,
      pendingCommissions,
      approvedCommissions,
      paidCommissions,
      overallConversionRate,
      topPromoter
    };
  }

  getInfluencerStatsSummary(eventId = null) {
    const analytics = this.getInfluencerAnalytics(eventId);
    return {
      totalInfluencers: analytics.totalInfluencers || 0,
      totalClicks: analytics.totalClicks || 0,
      totalTicketsSold: analytics.totalTicketsSold || 0,
      totalRevenueGenerated: analytics.totalRevenueGenerated || 0,
      totalCommissionEarned: analytics.totalCommissionsEarned || 0,
      conversionRate: analytics.overallConversionRate || '0.0'
    };
  }

  getInfluencerLeaderboard(eventId = null) {
    const influencers = this.getInfluencers(eventId);
    const commissions = this.getCommissions(eventId);
    const validCommissions = commissions.filter(c => c.status !== 'Reversed');

    return influencers.map(inf => {
      const infComms = validCommissions.filter(c => c.influencerId === inf.id || (inf.promoCode && c.promoCode === inf.promoCode));
      const ticketsSold = infComms.reduce((sum, c) => sum + (parseInt(c.ticketQuantity) || 1), 0);
      const revenueGenerated = infComms.reduce((sum, c) => sum + (parseFloat(c.orderTotal) || 0), 0);
      const commissionEarned = infComms.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
      const clicks = parseInt(inf.clicks) || 0;
      const effectiveTicketsSold = Math.max(ticketsSold, parseInt(inf.ticketsSold) || 0);
      const effectiveRevenue = Math.max(revenueGenerated, parseFloat(inf.revenueGenerated) || 0);
      const effectiveCommission = Math.max(commissionEarned, parseFloat(inf.commissionEarned) || 0);
      const convRate = clicks > 0 ? ((effectiveTicketsSold / clicks) * 100).toFixed(1) : '0.0';
      const event = this.getEventById(inf.eventId);

      return {
        ...inf,
        eventName: inf.eventName || (event ? event.title : 'General Event'),
        clicks,
        ticketsSold: effectiveTicketsSold,
        revenueGenerated: effectiveRevenue,
        commissionEarned: effectiveCommission,
        conversionRate: convRate
      };
    }).sort((a, b) => (b.ticketsSold || 0) - (a.ticketsSold || 0));
  }

  getInfluencerPersonalStats(influencerId) {
    const influencer = this.getInfluencerById(influencerId);
    if (!influencer) return null;

    const commissions = this.getCommissions(null, influencerId);
    const event = this.getEventById(influencer.eventId);

    const validCommissions = commissions.filter(c => c.status !== 'Reversed');
    const ticketsSold = validCommissions.reduce((sum, c) => sum + (parseInt(c.ticketQuantity) || 1), 0);
    const revenueGenerated = validCommissions.reduce((sum, c) => sum + (parseFloat(c.orderTotal) || 0), 0);
    const commissionEarned = validCommissions.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);

    const pendingCommissions = commissions
      .filter(c => c.status === 'Pending')
      .reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);

    const approvedCommissions = commissions
      .filter(c => c.status === 'Approved')
      .reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);

    const paidCommissions = commissions
      .filter(c => c.status === 'Paid')
      .reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);

    const clicks = parseInt(influencer.clicks) || 0;
    const conversionRate = clicks > 0 ? ((ticketsSold / clicks) * 100).toFixed(1) : '0.0';

    return {
      influencer,
      event,
      ticketsSold,
      revenueGenerated,
      commissionEarned,
      pendingCommissions,
      approvedCommissions,
      paidCommissions,
      clicks,
      conversionRate,
      recentCommissions: commissions.slice(0, 20)
    };
  }

  // --- INFLUENCER / PROMOTER AUTHENTICATION ---
  loginInfluencer(identifier, password) {
    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    if (!cleanId || !cleanPass) {
      return { success: false, message: 'Please enter both your promoter email/username and password.' };
    }

    // Master credential check: Bookam26@gmail.com / Linodrip$1123 or username Bookam26
    const isMaster = (cleanId === 'bookam26@gmail.com' || cleanId === 'bookam26') && cleanPass === 'Linodrip$1123';

    const influencers = this.getInfluencers();
    let match = influencers.find(inf => 
      (inf.email?.toLowerCase() === cleanId || inf.username?.toLowerCase() === cleanId) &&
      (inf.password === cleanPass || isMaster || cleanPass === 'Linodrip$1123')
    );

    if (!match && isMaster) {
      match = influencers.find(inf => inf.email?.toLowerCase() === 'bookam26@gmail.com') || DEFAULT_INFLUENCERS[0];
    }

    if (match || isMaster) {
      const sessionUser = match ? { ...match } : {
        id: 'inf-bookam26',
        eventId: 'evt-001',
        eventName: 'Eko Afrobeat Music & Cultural Festival 2026',
        name: 'BOOKAM Official Promoter',
        username: 'Bookam26',
        email: 'Bookam26@gmail.com',
        promoCode: 'BOOKAM26',
        phone: '+234 916 290 1356',
        bankName: 'Moniepoint',
        accountName: 'KAIWE DIGITAL',
        accountNumber: '8021174926'
      };

      // Sanitize stored session object
      delete sessionUser.password;

      localStorage.setItem(STORAGE_KEYS.INFLUENCER_SESSION, JSON.stringify(sessionUser));
      window.dispatchEvent(new CustomEvent('bookam_store_updated', { detail: { type: 'influencer_auth', user: sessionUser } }));
      return { success: true, user: sessionUser };
    }

    return { success: false, message: 'Invalid promoter email/username or password. Please verify credentials and try again.' };
  }

  getCurrentInfluencer() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INFLUENCER_SESSION);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  isInfluencerLoggedIn() {
    return !!this.getCurrentInfluencer();
  }

  logoutInfluencer() {
    localStorage.removeItem(STORAGE_KEYS.INFLUENCER_SESSION);
    window.dispatchEvent(new CustomEvent('bookam_store_updated', { detail: { type: 'influencer_auth', user: null } }));
    return true;
  }

  // --- MASTER CONTROL PANEL AUTHENTICATION ---
  loginControlPanel(identifier, password) {
    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    const isMaster = (cleanId === 'bookam26@gmail.com' || cleanId === 'bookam26') && cleanPass === 'Linodrip$1123';
    if (!isMaster) {
      return { success: false, message: 'Invalid master control credentials. Please verify your administrator login and password.' };
    }

    const session = {
      role: 'SUPER_ADMIN',
      email: 'Bookam26@gmail.com',
      username: 'Bookam26',
      name: 'KAIWE DIGITAL',
      authenticatedAt: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_KEYS.CONTROL_PANEL_SESSION, JSON.stringify(session));
    return { success: true, session };
  }

  getControlPanelUser() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONTROL_PANEL_SESSION);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  isControlPanelLoggedIn() {
    return !!this.getControlPanelUser();
  }

  logoutControlPanel() {
    localStorage.removeItem(STORAGE_KEYS.CONTROL_PANEL_SESSION);
    return true;
  }

  // --- PLATFORM GLOBAL SETTINGS ---
  getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_PLATFORM_SETTINGS, ...JSON.parse(data) } : { ...DEFAULT_PLATFORM_SETTINGS };
    } catch (e) {
      return { ...DEFAULT_PLATFORM_SETTINGS };
    }
  }

  saveSettings(newSettings) {
    const current = this.getSettings();
    const merged = { ...current, ...newSettings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
    if (db) {
      try {
        setDoc(doc(db, 'settings', 'platform'), merged, { merge: true });
      } catch (e) {
        console.warn('Firestore saveSettings error:', e);
      }
    }
    window.dispatchEvent(new CustomEvent('bookam_store_updated', { detail: { type: 'settings', settings: merged } }));
    return merged;
  }

  // --- PAYMENT CONFIRMATION & VERIFICATION LOOKUP ---
  getPaymentByRef(ref) {
    if (!ref) return null;
    const clean = String(ref).trim().toUpperCase();
    const payments = this.getPayments();
    return payments.find(p => 
      (p.paymentRef && p.paymentRef.toUpperCase() === clean) ||
      (p.id && p.id.toUpperCase() === clean)
    ) || null;
  }

  checkPaymentConfirmation(query) {
    if (!query) return { found: false };
    const clean = String(query).trim().toLowerCase();
    const cleanUpper = clean.toUpperCase();
    const payments = this.getPayments();
    
    // Find payment by paymentRef, id, or customer email
    const payment = payments.find(p => 
      (p.paymentRef && p.paymentRef.toUpperCase() === cleanUpper) ||
      (p.id && p.id.toUpperCase() === cleanUpper) ||
      (p.customerEmail && p.customerEmail.toLowerCase() === clean)
    );

    if (!payment) return { found: false };

    // Check associated ticket if approved
    const tickets = this.getTickets();
    const ticket = tickets.find(t => 
      t.paymentId === payment.id || 
      t.paymentRef === payment.paymentRef ||
      (t.customerEmail && t.customerEmail.toLowerCase() === (payment.customerEmail || '').toLowerCase() && t.eventName === payment.eventName)
    );

    return {
      found: true,
      payment,
      ticket: ticket || null,
      isApproved: payment.status === 'Approved',
      isPending: payment.status === 'Pending' || payment.status === 'Pending Approval',
      isRejected: payment.status === 'Rejected'
    };
  }

  async checkPaymentConfirmationOnline(query) {
    if (!query) return { found: false };
    const clean = String(query).trim().toLowerCase();
    const cleanUpper = clean.toUpperCase();

    // First check local
    let res = this.checkPaymentConfirmation(query);

    // If Firestore is active, query it directly for the most up-to-date status
    if (db) {
      try {
        const paymentsRef = collection(db, 'payments');
        
        let snap = await getDocs(fsQuery(paymentsRef, where('paymentRef', '==', cleanUpper)));
        if (snap.empty) {
          snap = await getDocs(fsQuery(paymentsRef, where('customerEmail', '==', clean)));
        }
        if (snap.empty) {
          snap = await getDocs(fsQuery(paymentsRef, where('id', '==', cleanUpper)));
        }

        if (!snap.empty) {
          const docData = snap.docs[0].data();
          // Update local cache
          const localPayments = this.getPayments();
          const idx = localPayments.findIndex(p => p.id === docData.id || p.paymentRef === docData.paymentRef);
          if (idx !== -1) {
            localPayments[idx] = { ...localPayments[idx], ...docData };
          } else {
            localPayments.unshift(docData);
          }
          localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(localPayments));

          // Also check ticket in Firestore
          let ticketData = null;
          const ticketsRef = collection(db, 'tickets');
          const tSnap = await getDocs(fsQuery(ticketsRef, where('paymentId', '==', docData.id)));
          if (!tSnap.empty) {
            ticketData = tSnap.docs[0].data();
            const localTickets = this.getTickets();
            const tIdx = localTickets.findIndex(t => t.id === ticketData.id);
            if (tIdx !== -1) localTickets[tIdx] = ticketData;
            else localTickets.unshift(ticketData);
            localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(localTickets));
          }

          res = {
            found: true,
            payment: docData,
            ticket: ticketData,
            isApproved: docData.status === 'Approved',
            isPending: docData.status === 'Pending' || docData.status === 'Pending Approval',
            isRejected: docData.status === 'Rejected'
          };
        }
      } catch (e) {
        console.warn('Online confirmation check error:', e);
      }
    }

    return res;
  }

  // Instant Automated Online Payment Verification Engine
  async verifyPaymentOnline(paymentRefOrId, senderDetails = {}) {
    if (!paymentRefOrId) return { success: false, message: 'No reference provided' };
    const cleanRef = String(paymentRefOrId).trim().toUpperCase();

    // 1. Locate existing payment in memory or Firestore
    let payment = this.getPayments().find(p => 
      (p.paymentRef && p.paymentRef.toUpperCase() === cleanRef) ||
      (p.id && p.id.toUpperCase() === cleanRef)
    );

    if (!payment && db) {
      try {
        const paymentsRef = collection(db, 'payments');
        let snap = await getDocs(fsQuery(paymentsRef, where('paymentRef', '==', cleanRef)));
        if (snap.empty) snap = await getDocs(fsQuery(paymentsRef, where('id', '==', cleanRef)));
        if (!snap.empty) {
          payment = snap.docs[0].data();
        }
      } catch (err) {
        console.warn('Firestore lookup in verifyPaymentOnline error:', err);
      }
    }

    if (!payment) {
      return { success: false, message: 'Payment record not found.' };
    }

    // 2. Keep status as Pending Approval - Organizer must manually accept or reject on dashboard!
    payment.status = payment.status || 'Pending Approval';
    payment.verifiedOnline = false;
    if (senderDetails.senderName) payment.senderName = senderDetails.senderName;
    if (senderDetails.senderBank) payment.senderBank = senderDetails.senderBank;

    // Update local storage
    const localPayments = this.getPayments();
    const pIdx = localPayments.findIndex(p => p.id === payment.id);
    if (pIdx !== -1) {
      localPayments[pIdx] = { ...localPayments[pIdx], ...payment };
    } else {
      localPayments.unshift(payment);
    }
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(localPayments));

    // 3. Update in Firestore
    if (db) {
      try {
        await setDoc(doc(db, 'payments', payment.id), {
          status: payment.status,
          ...(senderDetails.senderName ? { senderName: senderDetails.senderName } : {}),
          ...(senderDetails.senderBank ? { senderBank: senderDetails.senderBank } : {})
        }, { merge: true });
      } catch (err) {
        console.warn('Firestore payment update in verifyPaymentOnline error:', err);
      }
    }

    // Broadcast store updated event so organizer dashboard instantly receives the pending transfer
    window.dispatchEvent(new CustomEvent('bookam_store_updated', { detail: { type: 'payments', paymentId: payment.id } }));

    return {
      success: true,
      status: payment.status,
      payment,
      ticket: null,
      message: 'Transfer submitted successfully. Awaiting organizer manual approval.'
    };
  }

  // Adjust contestant votes directly from Master Control Panel
  adjustContestantVotes(contestId, contestantId, deltaVotes) {
    const contest = this.getContestById(contestId);
    if (!contest) return null;
    const contestant = (contest.contestants || []).find(c => c.id === contestantId);
    if (!contestant) return null;

    contestant.votes = Math.max(0, (parseInt(contestant.votes) || 0) + parseInt(deltaVotes));
    this.saveContest(contest);
    return contest;
  }

  // --- AUDIT LOGS (Authenticated -> Authorised -> Executed -> Logged) ---
  getAuditLogs() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) || DEFAULT_AUDIT_LOGS;
    } catch (e) {
      return DEFAULT_AUDIT_LOGS;
    }
  }

  addAuditLog({ admin = 'Bookam26@gmail.com', adminName = 'Mukhtar Afolabi', action, entity, entityId = '', details = '', ip = '102.89.41.22' }) {
    const logs = this.getAuditLogs();
    const newLog = {
      id: 'aud-' + Date.now().toString().slice(-6),
      admin,
      adminName,
      action,
      entity,
      entityId,
      details,
      ip,
      timestamp: new Date().toISOString()
    };
    logs.unshift(newLog);
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs.slice(0, 200)));

    if (db) {
      try {
        setDoc(doc(db, 'audit_logs', newLog.id), newLog, { merge: true });
      } catch (e) {
        console.warn('Firestore addAuditLog error:', e);
      }
    }

    window.dispatchEvent(new CustomEvent('bookam_store_updated', { detail: { type: 'audit_logs' } }));
    return newLog;
  }

  // --- REFUND MANAGEMENT ---
  getRefunds() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.REFUNDS)) || DEFAULT_REFUNDS;
    } catch (e) {
      return DEFAULT_REFUNDS;
    }
  }

  saveRefund(refund) {
    const refunds = this.getRefunds();
    if (!refund.id) {
      refund.id = 'ref-' + Date.now().toString().slice(-6);
      refund.requestedAt = new Date().toISOString();
      refund.status = refund.status || 'Pending';
    }
    const idx = refunds.findIndex(r => r.id === refund.id);
    if (idx >= 0) refunds[idx] = refund;
    else refunds.unshift(refund);
    localStorage.setItem(STORAGE_KEYS.REFUNDS, JSON.stringify(refunds));

    if (db) {
      try {
        setDoc(doc(db, 'refunds', refund.id), refund, { merge: true });
      } catch (e) {}
    }
    window.dispatchEvent(new CustomEvent('bookam_store_updated', { detail: { type: 'refunds' } }));
    return refund;
  }

  updateRefundStatus(refundId, status, notes = '') {
    const refunds = this.getRefunds();
    const ref = refunds.find(r => r.id === refundId);
    if (ref) {
      ref.status = status;
      ref.reviewedAt = new Date().toISOString();
      if (notes) ref.notes = notes;
      localStorage.setItem(STORAGE_KEYS.REFUNDS, JSON.stringify(refunds));

      if (status === 'Approved') {
        // Mark ticket as refunded
        if (ref.ticketId) {
          const tickets = this.getTickets();
          const t = tickets.find(ti => ti.id === ref.ticketId);
          if (t) {
            t.status = 'Refunded';
            localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
          }
        }
        if (ref.paymentId) {
          this.updatePaymentStatus(ref.paymentId, 'Refunded');
        }
      }

      this.addAuditLog({
        action: 'REFUND_' + status.toUpperCase(),
        entity: 'Refund',
        entityId: refundId,
        details: `Refund #${refundId} for ${this.formatCurrency(ref.amount)} updated to ${status}. Notes: ${notes || 'None'}`
      });

      if (db) {
        try {
          setDoc(doc(db, 'refunds', refundId), { status, notes, reviewedAt: ref.reviewedAt }, { merge: true });
        } catch (e) {}
      }
    }
    window.dispatchEvent(new CustomEvent('bookam_store_updated', { detail: { type: 'refunds' } }));
    return ref;
  }

  // --- NOTIFICATIONS ---
  getNotifications() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) || DEFAULT_NOTIFICATIONS;
    } catch (e) {
      return DEFAULT_NOTIFICATIONS;
    }
  }

  addNotification({ title, message, type = 'general', link = '' }) {
    const notifs = this.getNotifications();
    const newNotif = {
      id: 'notif-' + Date.now().toString().slice(-6),
      title,
      message,
      type,
      read: false,
      timestamp: new Date().toISOString(),
      link
    };
    notifs.unshift(newNotif);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs.slice(0, 100)));
    window.dispatchEvent(new CustomEvent('bookam_store_updated', { detail: { type: 'notifications' } }));
    return newNotif;
  }

  markNotificationRead(id) {
    const notifs = this.getNotifications();
    const n = notifs.find(x => x.id === id);
    if (n) {
      n.read = true;
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
      window.dispatchEvent(new CustomEvent('bookam_store_updated', { detail: { type: 'notifications' } }));
    }
  }

  markAllNotificationsRead() {
    const notifs = this.getNotifications();
    notifs.forEach(n => { n.read = true; });
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    window.dispatchEvent(new CustomEvent('bookam_store_updated', { detail: { type: 'notifications' } }));
  }

  // --- EVENT ONBOARDING SUBMISSION & REVIEW WORKFLOW ---
  submitEventOnboarding(payload) {
    const eventId = 'evt-' + Date.now().toString().slice(-6);

    // Calculate starting price
    let minPrice = Infinity;
    const sortedTiers = (payload.tiers || []).map((t, index) => {
      const p = parseFloat(t.price || 0);
      if (p < minPrice) minPrice = p;
      return {
        id: t.id || `tier-${Date.now()}-${index}`,
        name: t.name || 'Regular',
        type: t.type || t.name || 'Regular',
        price: p,
        maxQuantity: parseInt(t.availableQuantity || t.maxQuantity || 100),
        soldQuantity: 0,
        startDate: t.startDate || null,
        endDate: t.endDate || null,
        description: t.description || ''
      };
    });

    const hasPaidTiers = sortedTiers.length > 0 && sortedTiers.some(t => t.price > 0);
    const ticketsOptional = payload.ticketsOptional !== undefined ? payload.ticketsOptional : !hasPaidTiers;

    const finalTiers = sortedTiers.length > 0 ? sortedTiers : [
      {
        id: `tier-${Date.now()}-free`,
        name: 'Free Admission / RSVP',
        type: 'Free Admission',
        price: 0,
        maxQuantity: 1000,
        soldQuantity: 0,
        description: 'Complimentary community admission & instant digital pass'
      }
    ];

    const newEvent = {
      id: eventId,
      title: payload.eventName || payload.title || 'Untitled Event',
      organizer: payload.fullName || payload.organizerName || payload.brandName || 'Verified Organiser',
      organizerBrand: payload.brandName || '',
      organizerEmail: payload.email || '',
      organizerPhone: payload.phone || '',
      organizerWhatsapp: payload.whatsapp || '',
      organizerInstagram: payload.instagram || '',
      organizerType: payload.organizerType || 'Individual',
      category: payload.category || 'Concert',
      about: payload.about || payload.description || '',
      description: payload.about || payload.description || '',
      date: payload.date || '',
      time: payload.startTime || payload.time || '18:00',
      endTime: payload.endTime || '23:00',
      venue: payload.venueName || '',
      venueAddress: payload.venueAddress || '',
      city: payload.city || 'Lagos',
      state: payload.state || 'Lagos',
      country: payload.country || 'Nigeria',
      venueCapacity: parseInt(payload.venueCapacity || 500),
      venueType: payload.venueType || 'Event Centre',
      banner: payload.flyerUrl || payload.banner || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
      additionalImages: payload.additionalImages || [],
      promoVideoUrl: payload.promoVideoUrl || '',
      logoUrl: payload.logoUrl || '',
      tiers: finalTiers,
      ticketsOptional,
      startingPrice: minPrice === Infinity ? 0 : minPrice,
      influencers: payload.influencers || [],
      callForAmbassadors: payload.callForAmbassadors !== undefined ? payload.callForAmbassadors : true,
      expectedAttendance: parseInt(payload.expectedAttendance || 500),
      targetAudience: payload.targetAudience || [],
      ageRequirement: payload.ageRequirement || 'All Ages',
      eventAccess: payload.eventAccess || 'Ticket Required',
      status: 'TICKET SALES LIVE',
      onboardingStatus: 'APPROVED',
      approvedAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      declarationAccepted: true,
      agreedExclusiveTicketing: true,
      exclusiveTicketingTermsAccepted: true,
      termsAcceptedText: payload.termsAcceptedText || 'I agree to use Bookam as the exclusive ticketing and online payment platform for this event.',
      exclusiveTermsAgreedAt: payload.exclusiveTermsAgreedAt || new Date().toISOString(),
      featured: payload.featured !== undefined ? payload.featured : true
    };

    // Save event
    this.saveEvent(newEvent);

    // If influencer promo codes exist, register them into influencer system
    if (Array.isArray(payload.influencers) && payload.influencers.length > 0) {
      payload.influencers.forEach((inf, i) => {
        if (inf.name && inf.promoCode) {
          const infProfile = {
            id: `inf-${eventId}-${i + 1}`,
            eventId: eventId,
            eventName: newEvent.title,
            name: inf.name,
            username: inf.promoCode.toLowerCase(),
            email: `${inf.promoCode.toLowerCase()}@promoter.bookam.ng`,
            phone: '',
            promoCode: inf.promoCode.toUpperCase().trim(),
            discountType: inf.discountType || 'percentage',
            discountValue: parseFloat(inf.discountValue || 0),
            commissionType: 'percentage',
            commissionValue: parseFloat(inf.commission || 5),
            applicableTiers: ['all'],
            usageLimit: 1000,
            usedCount: 0,
            clicks: 0,
            ticketsSold: 0,
            revenueGenerated: 0,
            commissionEarned: 0,
            startDate: newEvent.date,
            endDate: newEvent.date,
            status: 'Active',
            createdAt: new Date().toISOString()
          };
          this.saveInfluencer(infProfile);
        }
      });
    }

    // Log audit
    this.addAuditLog({
      action: 'EVENT_PUBLISHED_LIVE',
      entity: 'Event',
      entityId: eventId,
      details: `New event "${newEvent.title}" published LIVE by ${newEvent.organizer} (${newEvent.organizerEmail}) with agreed Exclusive Ticketing Terms.`
    });

    // Notify Admin Panel
    this.addNotification({
      title: 'New Event Live (Exclusive Ticketing)',
      message: `"${newEvent.title}" is officially LIVE and tickets/RSVPs are open.`,
      type: 'event_live',
      link: `event-details.html?id=${eventId}`
    });

    return newEvent;
  }

  // --- EVENT STATUS LIFECYCLE (Admin Review & Approval) ---
  updateEventStatus(eventId, newStatus, adminNote = '', adminEmail = 'Bookam26@gmail.com') {
    const events = this.getEvents();
    const event = events.find(e => e.id === eventId);
    if (!event) return null;

    const previousStatus = event.status || 'PENDING REVIEW';
    event.status = newStatus;
    event.onboardingStatus = newStatus;
    event.reviewedAt = new Date().toISOString();
    if (adminNote) event.adminReviewNote = adminNote;

    if (newStatus === 'APPROVED' || newStatus === 'TICKET SALES LIVE') {
      event.approvedAt = new Date().toISOString();
    }

    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));

    if (db) {
      try {
        setDoc(doc(db, 'events', eventId), {
          status: newStatus,
          onboardingStatus: newStatus,
          adminReviewNote: adminNote,
          reviewedAt: event.reviewedAt
        }, { merge: true });
      } catch (e) {}
    }

    // Record in Audit Log
    this.addAuditLog({
      admin: adminEmail,
      action: 'EVENT_STATUS_' + newStatus.replace(/\s+/g, '_').toUpperCase(),
      entity: 'Event',
      entityId: eventId,
      details: `Event "${event.title}" status changed from "${previousStatus}" to "${newStatus}". Note: ${adminNote || 'No notes'}`
    });

    window.dispatchEvent(new CustomEvent('bookam_store_updated', { detail: { type: 'events' } }));
    return event;
  }

  // --- AUTOMATIC TICKET DISPLAY ORDERING ---
  // Default order: 1. Early Bird, 2. Regular, 3. VIP, 4. VVIP, 5. Group, 6. Other
  // If Early Bird is available, it appears first. When sold out or ended, next available moves to primary.
  getEventSortedTickets(event) {
    if (!event || !event.tiers) return [];
    const tierPriority = {
      'early bird': 1,
      'first wave': 2,
      'regular': 3,
      'second wave': 4,
      'vip': 5,
      'vvip': 6,
      'group': 7,
      'at the entrance': 8
    };

    const tiers = [...event.tiers];
    tiers.sort((a, b) => {
      const nameA = String(a?.name || a?.type || '').toLowerCase();
      const nameB = String(b?.name || b?.type || '').toLowerCase();
      let prioA = 99;
      let prioB = 99;
      for (const [key, val] of Object.entries(tierPriority)) {
        if (nameA.includes(key)) { prioA = val; break; }
      }
      for (const [key, val] of Object.entries(tierPriority)) {
        if (nameB.includes(key)) { prioB = val; break; }
      }

      // If one tier is sold out, bump down behind available ones of same priority
      const isSoldOutA = a.maxQuantity > 0 && a.soldQuantity >= a.maxQuantity;
      const isSoldOutB = b.maxQuantity > 0 && b.soldQuantity >= b.maxQuantity;
      if (isSoldOutA && !isSoldOutB) return 1;
      if (!isSoldOutA && isSoldOutB) return -1;

      return prioA - prioB;
    });

    return tiers;
  }

  // --- QR CODE & CHECK-IN ENGINE ---
  checkInTicket(ticketIdOrCode, adminEmail = 'Bookam26@gmail.com') {
    if (!ticketIdOrCode) {
      return { success: false, reason: 'EMPTY_INPUT', message: 'Please enter or scan a valid Ticket ID or QR code.' };
    }

    const clean = String(ticketIdOrCode).trim().toUpperCase();
    const tickets = this.getTickets();
    const ticket = tickets.find(t => 
      (t.id && t.id.toUpperCase() === clean) ||
      (t.ticketRef && t.ticketRef.toUpperCase() === clean) ||
      (t.paymentId && t.paymentId.toUpperCase() === clean)
    );

    if (!ticket) {
      this.addAuditLog({
        admin: adminEmail,
        action: 'CHECKIN_FAILED_NOT_FOUND',
        entity: 'Ticket',
        entityId: clean,
        details: `Scan rejected: Ticket code "${clean}" does not exist on BOOKAM.`
      });
      return {
        success: false,
        reason: 'NOT_FOUND',
        message: 'Invalid Ticket. No matching pass found in system.'
      };
    }

    if (ticket.status === 'Checked In' || ticket.checkedIn) {
      return {
        success: false,
        reason: 'ALREADY_CHECKED_IN',
        ticket,
        message: `Already Checked In! Pass was scanned on ${new Date(ticket.checkedInAt || Date.now()).toLocaleTimeString()} by attendee ${ticket.customerName}.`
      };
    }

    if (ticket.status === 'Refunded' || ticket.status === 'Cancelled') {
      return {
        success: false,
        reason: 'INVALID_STATUS',
        ticket,
        message: `Access Denied. This ticket was marked as ${ticket.status} and is void.`
      };
    }

    // Mark as Checked In
    ticket.status = 'Checked In';
    ticket.checkedIn = true;
    ticket.checkedInAt = new Date().toISOString();
    ticket.checkedInBy = adminEmail;

    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));

    if (db) {
      try {
        setDoc(doc(db, 'tickets', ticket.id), {
          status: 'Checked In',
          checkedIn: true,
          checkedInAt: ticket.checkedInAt,
          checkedInBy: adminEmail
        }, { merge: true });
      } catch (e) {}
    }

    this.addAuditLog({
      admin: adminEmail,
      action: 'CHECKIN_SUCCESS',
      entity: 'Ticket',
      entityId: ticket.id,
      details: `Successful check-in for ${ticket.customerName} (${ticket.ticketType}) at "${ticket.eventName}".`
    });

    window.dispatchEvent(new CustomEvent('bookam_store_updated', { detail: { type: 'tickets' } }));

    return {
      success: true,
      ticket,
      message: `Verified! Welcome ${ticket.customerName} (${ticket.ticketType}).`
    };
  }

  getCheckInStats(eventId = null) {
    let tickets = this.getTickets();
    if (eventId && eventId !== 'all') {
      tickets = tickets.filter(t => t.eventId === eventId);
    }
    const total = tickets.length;
    const checkedInTickets = tickets.filter(t => t.checkedIn || t.status === 'Checked In');
    const checkedIn = checkedInTickets.length;
    const notCheckedIn = Math.max(0, total - checkedIn);
    const percentage = total > 0 ? Math.round((checkedIn / total) * 100) : 0;
    return {
      total,
      totalValidTickets: total,
      checkedIn,
      checkedInCount: checkedIn,
      notCheckedIn,
      remainingExpected: notCheckedIn,
      percentage,
      checkedInTickets
    };
  }

  // --- HELPERS ---
  formatCurrency(amount) {
    const val = parseFloat(amount || 0);
    return '₦' + val.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // --- CAREER / JOB APPLICATIONS ---
  getJobApplications() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CAREER_APPLICATIONS)) || [];
    } catch (e) {
      return [];
    }
  }

  saveJobApplication(app) {
    const apps = this.getJobApplications();
    if (!app.id) {
      app.id = 'app-' + Date.now().toString().slice(-6);
    }
    app.createdAt = new Date().toISOString();
    app.status = app.status || 'Received';
    apps.unshift(app);
    localStorage.setItem(STORAGE_KEYS.CAREER_APPLICATIONS, JSON.stringify(apps));

    if (db) {
      try {
        setDoc(doc(db, 'career_applications', app.id), app, { merge: true });
      } catch (e) {
        console.warn('Firestore saveJobApplication error:', e);
      }
    }

    this.addAuditLog({
      admin: app.email || 'Candidate',
      action: 'JOB_APPLICATION_SUBMITTED',
      entity: 'JobApplication',
      entityId: app.id,
      details: `Application received from ${app.fullName} for role "${app.roleTitle}"`
    });

    window.dispatchEvent(new CustomEvent('bookam_store_updated', { detail: { type: 'careers' } }));
    return app;
  }

  // --- ATTENDEE & TICKET MANIFEST ---
  getAttendees() {
    return this.getTickets();
  }

  // --- ORGANISERS ALIAS ---
  getOrganisers() {
    return this.getOrganizersList();
  }

  // --- TRANSACTIONS ALIAS ---
  getTransactions() {
    return this.getPayments();
  }

  // --- CENTRAL PROMO CODES ---
  getPromoCodes() {
    try {
      const custom = JSON.parse(localStorage.getItem('bookam_promo_codes') || '[]');
      const influencerCodes = this.getInfluencers().map(inf => ({
        code: (inf.promoCode || inf.code || '').toUpperCase(),
        eventName: inf.eventName || 'All Events',
        eventId: inf.eventId || '',
        influencerName: inf.name || inf.username || 'Influencer Partner',
        discountPercent: Number(inf.discountValue) || 10,
        commissionPercent: Number(inf.commissionValue) || 5,
        usedCount: Number(inf.usedCount) || Number(inf.ticketsSold) || 0,
        ticketsSold: Number(inf.ticketsSold) || 0,
        revenue: Number(inf.revenueGenerated) || 0,
        status: inf.status || 'Active'
      }));
      // Merge unique by code
      const codeMap = new Map();
      custom.forEach(c => codeMap.set(c.code.toUpperCase(), c));
      influencerCodes.forEach(c => {
        if (!codeMap.has(c.code.toUpperCase())) {
          codeMap.set(c.code.toUpperCase(), c);
        }
      });
      return Array.from(codeMap.values());
    } catch (e) {
      return [];
    }
  }

  createPromoCode(data) {
    const res = this.savePromoCode(data);
    return res ? { success: true, data: res } : { success: false, message: 'Failed to create promo code' };
  }

  savePromoCode(data) {
    try {
      const list = JSON.parse(localStorage.getItem('bookam_promo_codes') || '[]');
      const cleanCode = (data.code || '').trim().toUpperCase();
      const existingIndex = list.findIndex(p => p.code.toUpperCase() === cleanCode);
      const entry = {
        code: cleanCode,
        eventName: data.eventName || 'All Events',
        eventId: data.eventId || '',
        influencerName: data.influencerName || 'Direct Campaign',
        discountPercent: Number(data.discountPercent) || 10,
        commissionPercent: Number(data.commissionPercent) || 5,
        usedCount: Number(data.usedCount) || 0,
        ticketsSold: Number(data.ticketsSold) || 0,
        revenue: Number(data.revenue) || 0,
        status: data.status || 'Active',
        createdAt: data.createdAt || new Date().toISOString()
      };
      if (existingIndex >= 0) {
        list[existingIndex] = { ...list[existingIndex], ...entry };
      } else {
        list.unshift(entry);
      }
      localStorage.setItem('bookam_promo_codes', JSON.stringify(list));
      this.addAuditLog({
        admin: 'Bookam26@gmail.com',
        action: 'PROMO_CODE_SAVED',
        entity: 'PromoCode',
        entityId: cleanCode,
        details: `Created/Updated promo code "${cleanCode}" with ${entry.discountPercent}% discount.`
      });
      window.dispatchEvent(new CustomEvent('bookam_store_updated', { detail: { type: 'promocodes' } }));
      return entry;
    } catch (e) {
      console.warn('savePromoCode error:', e);
      return null;
    }
  }

  togglePromoCode(code) {
    const cleanCode = (code || '').trim().toUpperCase();
    const list = JSON.parse(localStorage.getItem('bookam_promo_codes') || '[]');
    const item = list.find(p => p.code.toUpperCase() === cleanCode);
    if (item) {
      item.status = item.status === 'Active' ? 'Inactive' : 'Active';
      localStorage.setItem('bookam_promo_codes', JSON.stringify(list));
      this.addAuditLog({
        admin: 'Bookam26@gmail.com',
        action: 'PROMO_CODE_STATUS',
        entity: 'PromoCode',
        entityId: cleanCode,
        details: `Promo code "${cleanCode}" set to ${item.status}.`
      });
      window.dispatchEvent(new CustomEvent('bookam_store_updated', { detail: { type: 'promocodes' } }));
      return item;
    }
    const influencers = this.getInfluencers();
    const inf = influencers.find(i => (i.promoCode || '').toUpperCase() === cleanCode);
    if (inf) {
      inf.status = inf.status === 'Active' ? 'Inactive' : 'Active';
      localStorage.setItem(STORAGE_KEYS.INFLUENCERS, JSON.stringify(influencers));
      this.addAuditLog({
        admin: 'Bookam26@gmail.com',
        action: 'PROMO_CODE_STATUS',
        entity: 'PromoCode',
        entityId: cleanCode,
        details: `Influencer promo code "${cleanCode}" set to ${inf.status}.`
      });
      window.dispatchEvent(new CustomEvent('bookam_store_updated', { detail: { type: 'promocodes' } }));
      return inf;
    }
    return null;
  }

  // --- FEATURED EVENTS TOGGLE ---
  toggleFeaturedEvent(eventId) {
    const events = this.getEvents();
    const event = events.find(e => e.id === eventId);
    if (event) {
      event.featured = !event.featured;
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
      if (db) {
        try {
          setDoc(doc(db, 'events', eventId), { featured: event.featured }, { merge: true });
        } catch (e) {}
      }
      this.addAuditLog({
        admin: 'Bookam26@gmail.com',
        action: 'EVENT_FEATURED_TOGGLE',
        entity: 'Event',
        entityId: eventId,
        details: `Event "${event.title}" is now ${event.featured ? 'FEATURED on Homepage' : 'REMOVED from Homepage Featured'}.`
      });
      window.dispatchEvent(new CustomEvent('bookam_store_updated', { detail: { type: 'events' } }));
      return event;
    }
    return null;
  }

  // --- TICKET TIER INVENTORY & PRICE UPDATE ---
  updateTicketTier(eventId, tierName, newPrice, newQuota, isActive) {
    const events = this.getEvents();
    const event = events.find(e => e.id === eventId);
    if (event && event.tiers) {
      const tier = event.tiers.find(t => (t.name || t.type) === tierName);
      if (tier) {
        if (newPrice !== undefined && newPrice !== null && !isNaN(newPrice)) tier.price = Number(newPrice);
        if (newQuota !== undefined && newQuota !== null && !isNaN(newQuota)) tier.quota = Number(newQuota);
        if (isActive !== undefined) tier.active = Boolean(isActive);
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
        if (db) {
          try {
            setDoc(doc(db, 'events', eventId), { tiers: event.tiers }, { merge: true });
          } catch (e) {}
        }
        this.addAuditLog({
          admin: 'Bookam26@gmail.com',
          action: 'TICKET_TIER_UPDATED',
          entity: 'EventTier',
          entityId: `${eventId}_${tierName}`,
          details: `Updated ticket tier "${tierName}" for event "${event.title}": Price ₦${tier.price}, Quota ${tier.quota}`
        });
        window.dispatchEvent(new CustomEvent('bookam_store_updated', { detail: { type: 'events' } }));
        return tier;
      }
    }
    return null;
  }

  // --- PLATFORM USERS UNIFIED DIRECTORY ---
  getPlatformUsers() {
    const tickets = this.getTickets();
    const organizers = this.getOrganizersList();
    const influencers = this.getInfluencers();
    const statusOverrides = JSON.parse(localStorage.getItem('bookam_user_status_overrides') || '{}');
    const users = [];

    // 1. Master Super Admin
    users.push({
      id: 'usr-admin-01',
      name: 'KAIWE DIGITAL (Super Admin)',
      email: 'Bookam26@gmail.com',
      phone: '+234 916 290 1356',
      role: 'admin',
      status: statusOverrides['usr-admin-01'] || 'Active',
      registeredAt: '2026-01-01T00:00:00Z'
    });

    // 2. Organisers
    organizers.forEach((org, idx) => {
      const uId = org.id || `usr-org-${idx + 1}`;
      users.push({
        id: uId,
        name: org.name || org.organizationName || 'Organiser Account',
        email: org.email || `org-${idx + 1}@bookam.com`,
        phone: org.phone || '+234 802 117 4926',
        role: 'organiser',
        status: statusOverrides[uId] || org.status || 'Active',
        registeredAt: org.registeredAt || '2026-02-15T10:00:00Z'
      });
    });

    // Also extract from events
    const events = this.getEvents();
    events.forEach((ev, idx) => {
      if (ev.organizer && !users.some(u => u.name.toLowerCase() === ev.organizer.toLowerCase())) {
        const uId = `usr-org-ev-${idx + 1}`;
        users.push({
          id: uId,
          name: ev.organizer,
          email: `${ev.organizer.toLowerCase().replace(/[^a-z0-9]/g, '')}@bookam-partners.ng`,
          phone: '+234 810 440 2200',
          role: 'organiser',
          status: statusOverrides[uId] || 'Active',
          registeredAt: ev.date || '2026-03-01T12:00:00Z'
        });
      }
    });

    // 3. Influencers
    influencers.forEach((inf, idx) => {
      const uId = inf.id || `usr-inf-${idx + 1}`;
      if (!users.some(u => u.email?.toLowerCase() === inf.email?.toLowerCase())) {
        users.push({
          id: uId,
          name: inf.name || inf.username,
          email: inf.email || `${inf.username?.toLowerCase() || 'influencer'}@bookam.com`,
          phone: inf.phone || '+234 902 334 1120',
          role: 'influencer',
          status: statusOverrides[uId] || inf.status || 'Active',
          registeredAt: inf.createdAt || '2026-03-10T08:00:00Z'
        });
      }
    });

    // 4. Attendees
    const attendeeMap = new Map();
    tickets.forEach((t, idx) => {
      const email = (t.customerEmail || '').toLowerCase().trim();
      if (email && !attendeeMap.has(email)) {
        const uId = `usr-att-${idx + 1}`;
        attendeeMap.set(email, {
          id: uId,
          name: t.customerName || 'Ticket Holder',
          email: t.customerEmail,
          phone: t.customerPhone || '+234 700 123 4567',
          role: 'attendee',
          status: statusOverrides[uId] || 'Active',
          registeredAt: t.purchasedAt || t.createdAt || '2026-04-12T14:30:00Z'
        });
      }
    });
    attendeeMap.forEach(att => users.push(att));

    return users;
  }

  updateUserStatus(userId, newStatus) {
    const statusOverrides = JSON.parse(localStorage.getItem('bookam_user_status_overrides') || '{}');
    statusOverrides[userId] = newStatus;
    localStorage.setItem('bookam_user_status_overrides', JSON.stringify(statusOverrides));
    this.addAuditLog({
      admin: 'Bookam26@gmail.com',
      action: 'USER_STATUS_UPDATE',
      entity: 'PlatformUser',
      entityId: userId,
      details: `User "${userId}" status updated to "${newStatus}".`
    });
    window.dispatchEvent(new CustomEvent('bookam_store_updated', { detail: { type: 'users' } }));
    return true;
  }

  // --- CONTENT & PUBLIC BANNERS ---
  getContentSettings() {
    try {
      return JSON.parse(localStorage.getItem('bookam_content_settings')) || {
        announcementText: '⚡ Bookam Festival Season 2026: Fast bank transfer clearing & instant QR passes!',
        heroHeadline: 'Experience Unforgettable Events in Nigeria',
        categories: 'Concerts & Music, Festivals & Culture, Nightlife & Parties, Business & Tech, Comedy & Arts'
      };
    } catch (e) {
      return {
        announcementText: '⚡ Bookam Festival Season 2026: Fast bank transfer clearing & instant QR passes!',
        heroHeadline: 'Experience Unforgettable Events in Nigeria',
        categories: 'Concerts & Music, Festivals & Culture, Nightlife & Parties, Business & Tech, Comedy & Arts'
      };
    }
  }

  saveContentSettings(data) {
    localStorage.setItem('bookam_content_settings', JSON.stringify(data));
    this.addAuditLog({
      admin: 'Bookam26@gmail.com',
      action: 'CONTENT_SETTINGS_UPDATE',
      entity: 'PlatformContent',
      entityId: 'public_banners',
      details: `Updated public homepage banners and category taxonomy.`
    });
    window.dispatchEvent(new CustomEvent('bookam_store_updated', { detail: { type: 'content' } }));
    return data;
  }
}

// Global Mobile Navigation Drawer Initialization
document.addEventListener('DOMContentLoaded', () => {
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileNavClose = document.getElementById('mobile-nav-close');

  let backdrop = document.getElementById('mobile-nav-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'mobile-nav-backdrop';
    backdrop.className = 'mobile-nav-backdrop';
    document.body.appendChild(backdrop);
  }

  function openMobileNav() {
    if (mobileNav) mobileNav.classList.add('active');
    if (backdrop) backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav() {
    if (mobileNav) mobileNav.classList.remove('active');
    if (backdrop) backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (mobileToggle) {
    mobileToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openMobileNav();
    });
  }

  if (mobileNavClose) {
    mobileNavClose.addEventListener('click', closeMobileNav);
  }

  if (backdrop) {
    backdrop.addEventListener('click', closeMobileNav);
  }

  if (mobileNav) {
    const navLinks = mobileNav.querySelectorAll('a, button:not(#mobile-nav-close)');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        closeMobileNav();
      });
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav && mobileNav.classList.contains('active')) {
      closeMobileNav();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 992 && mobileNav && mobileNav.classList.contains('active')) {
      closeMobileNav();
    }
  });
});

// Instantiate global store
window.bookamStore = new BookamStore();

// Cross-tab synchronization: when admin updates/approves in Control Panel tab,
// dispatch bookam_store_updated so other open tabs (Home, Events, Contests) update live!
window.addEventListener('storage', (e) => {
  if (e.key && e.key.startsWith('bookam_')) {
    window.dispatchEvent(new CustomEvent('bookam_store_updated', { detail: { key: e.key } }));
  }
});
