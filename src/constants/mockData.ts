/**
 * VFSTR Transport Portal — Centralized Mock Data
 *
 * Single source of truth for all prototype/demo data used across the
 * Student Module. When backend APIs are wired in, replace each exported
 * constant with the corresponding API response shape.
 *
 * Naming convention:
 *   MOCK_<DOMAIN>_<ENTITY>  →  e.g. MOCK_PASS_DETAILS, MOCK_ROUTE_STOPS
 */

import type {
  BusPass,
  Route,
  NotificationItem,
} from '@/types';

// ─────────────────────────────────────────────
// Student / Pass
// ─────────────────────────────────────────────

export const MOCK_PASS_DETAILS = {
  passNumber: 'VFSTR-2026-R14-04001',
  academicYear: '2026 - 2027',
  status: 'active' as const,
  issueDate: '10 Aug 2026',
  expiryDate: '31 May 2027',
  daysRemaining: 245,
  assignedRouteNumber: 'Route #14',
  assignedRouteName: 'Guntur City Express',
  assignedStop: 'Old Bus Stand, Guntur',
  morningPickupTime: '07:10 AM',
  eveningDepartureTime: '05:15 PM',
  assignedBusRegNo: 'AP 07 TJ 4521',
  assignedBusId: 'VFSTR-B14',
  transportOfficeStatus: 'Verified & Authorized by Transport Officer',
  feePaid: 18500,
  paymentStatus: 'paid' as const,
  authorizedBy: 'Dr. M. R. K. Murthy (Transport In-Charge)',
} satisfies Partial<BusPass> & Record<string, unknown>;

// ─────────────────────────────────────────────
// Route
// ─────────────────────────────────────────────

export const MOCK_ROUTE_DETAILS = {
  routeId: 'R14',
  routeNumber: 'Route #14',
  routeName: 'Guntur City Express',
  assignedBusRegNo: 'AP 07 TJ 4521',
  busCode: 'VFSTR-B14',
  capacity: '55 Seats (48 Allocated)',
  morningStart: '07:00 AM',
  pickupTime: '07:10 AM',
  campusArrival: '07:50 AM',
  eveningDeparture: '05:15 PM',
  driverName: 'Mr. K. Venkateswarlu',
  driverExperience: '12 Years VFSTR Service',
  driverPhone: '+91 94401 23456',
  transportOfficer: 'Mr. P. Raghava Rao',
  officeContact: '+91 863-2344700 Ext 104',
  officeLocation: 'Admin Block, Room 104',
} satisfies Partial<Route> & Record<string, unknown>;

export const MOCK_ROUTE_STOPS = [
  { id: '1', seq: 1, name: 'Guntur Bus Station Depot',       morningTime: '07:00 AM', eveningDropTime: '05:55 PM', landmark: 'Platform 1 Departure Gate',        isAssigned: false },
  { id: '2', seq: 2, name: 'Old Bus Stand, Guntur',          morningTime: '07:10 AM', eveningDropTime: '05:45 PM', landmark: 'Near Municipal High School',         isAssigned: true  },
  { id: '3', seq: 3, name: 'Collectorate Junction',          morningTime: '07:18 AM', eveningDropTime: '05:38 PM', landmark: 'Opposite State Bank Branch',         isAssigned: false },
  { id: '4', seq: 4, name: 'Market Yard Center',             morningTime: '07:25 AM', eveningDropTime: '05:30 PM', landmark: 'Beside HP Petrol Pump',              isAssigned: false },
  { id: '5', seq: 5, name: 'Auto Nagar Arch',                morningTime: '07:32 AM', eveningDropTime: '05:22 PM', landmark: 'Near Fire Station Signal',           isAssigned: false },
  { id: '6', seq: 6, name: 'VFSTR Vadlamudi Main Campus',   morningTime: '07:50 AM', eveningDropTime: '05:15 PM', landmark: 'Transport Bay 3',                    isAssigned: false },
];

export const MOCK_ROUTE_NOTICES = [
  {
    id: '1',
    title: 'Road Works Detour near Collectorate Junction',
    date: '02 Aug 2026',
    desc: 'Due to flyover maintenance, Stop #3 will temporarily shift 100 meters ahead near HDFC Bank ATM.',
    type: 'warning' as const,
  },
  {
    id: '2',
    title: 'Mid-Term Exam Shift Departure Schedule',
    date: '10 Aug 2026',
    desc: 'Buses will make an additional afternoon return trip departing Vadlamudi Campus at 01:30 PM.',
    type: 'info' as const,
  },
];

// ─────────────────────────────────────────────
// Payment Transactions
// ─────────────────────────────────────────────

export interface PaymentTransaction {
  id: string;
  receiptNo: string;
  academicYear: string;
  amount: number;
  paymentMode: string;
  paymentDate: string;
  status: 'Verified' | 'Pending' | 'Failed';
  bankRef: string;
  routeAssigned: string;
}

export const MOCK_TRANSACTIONS: PaymentTransaction[] = [
  {
    id: '1',
    receiptNo: 'REC-2026-8941',
    academicYear: '2026 - 2027',
    amount: 18500,
    paymentMode: 'SBI NetBanking',
    paymentDate: '01 Aug 2026',
    status: 'Verified',
    bankRef: 'SBI-TXN-984102941',
    routeAssigned: 'Route #14 - Guntur City Express',
  },
  {
    id: '2',
    receiptNo: 'REC-2026-9104',
    academicYear: '2026 - 2027',
    amount: 18500,
    paymentMode: 'UPI (PhonePe)',
    paymentDate: '31 Jul 2026',
    status: 'Pending',
    bankRef: 'UPI-REF-884210492',
    routeAssigned: 'Route #08 - Vijayawada Express',
  },
  {
    id: '3',
    receiptNo: 'REC-2025-4102',
    academicYear: '2025 - 2026',
    amount: 18500,
    paymentMode: 'HDFC Bank Challan',
    paymentDate: '10 Aug 2025',
    status: 'Verified',
    bankRef: 'HDFC-CH-441029010',
    routeAssigned: 'Route #14 - Guntur City Express',
  },
  {
    id: '4',
    receiptNo: 'REC-2025-3941',
    academicYear: '2025 - 2026',
    amount: 18500,
    paymentMode: 'UPI (Google Pay)',
    paymentDate: '05 Aug 2025',
    status: 'Failed',
    bankRef: 'GPY-TXN-FAIL-20250805',
    routeAssigned: 'Route #14 - Guntur City Express',
  },
  {
    id: '5',
    receiptNo: 'REC-2024-2210',
    academicYear: '2024 - 2025',
    amount: 17500,
    paymentMode: 'HDFC Bank Challan',
    paymentDate: '08 Aug 2024',
    status: 'Verified',
    bankRef: 'HDFC-CH-301028510',
    routeAssigned: 'Route #14 - Guntur City Express',
  },
  {
    id: '6',
    receiptNo: 'REC-2023-1190',
    academicYear: '2023 - 2024',
    amount: 17500,
    paymentMode: 'SBI NetBanking',
    paymentDate: '12 Aug 2023',
    status: 'Verified',
    bankRef: 'SBI-TXN-782019341',
    routeAssigned: 'Route #14 - Guntur City Express',
  },
];

// ─────────────────────────────────────────────
// Applications
// ─────────────────────────────────────────────

export type ApplicationState =
  | 'Draft'
  | 'Submitted'
  | 'Under Review'
  | 'Approved'
  | 'Rejected'
  | 'Expired'
  | 'Cancelled';

export interface ApplicationRecord {
  id: string;
  refNumber: string;
  academicYear: string;
  route: string;
  stop: string;
  date: string;
  state: ApplicationState;
  description: string;
  timeline: {
    step: string;
    status: 'completed' | 'current' | 'pending' | 'failed';
    time?: string;
  }[];
  actionLabel: string;
  actionUrl: string;
  feeAmount: number;
}

export const MOCK_APPLICATIONS: ApplicationRecord[] = [
  {
    id: '1',
    refNumber: 'APP-2026-8942',
    academicYear: '2026 - 2027',
    route: 'Route #14 - Guntur City Express',
    stop: 'Old Bus Stand, Guntur',
    date: '02 Aug 2026',
    state: 'Approved',
    description: 'Application approved by Transport Cell. Digital pass credential generated.',
    feeAmount: 18500,
    actionLabel: 'View Digital Pass',
    actionUrl: '/student/pass',
    timeline: [
      { step: 'Online Application Submitted',         status: 'completed', time: '01 Aug 2026, 10:00 AM' },
      { step: 'Accounts Cell Fee Verified (₹18,500)', status: 'completed', time: '01 Aug 2026, 04:30 PM' },
      { step: 'Transport Officer Approval',           status: 'completed', time: '02 Aug 2026, 11:15 AM' },
      { step: 'Digital QR Pass Generated',            status: 'completed', time: '02 Aug 2026, 11:16 AM' },
    ],
  },
  {
    id: '2',
    refNumber: 'APP-2026-9104',
    academicYear: '2026 - 2027',
    route: 'Route #08 - Vijayawada Express',
    stop: 'NTR Bus Station, Vijayawada',
    date: '31 Jul 2026',
    state: 'Under Review',
    description: 'Under capacity verification by Transport In-Charge for Vijayawada route allocation.',
    feeAmount: 18500,
    actionLabel: 'Check Status Details',
    actionUrl: '',
    timeline: [
      { step: 'Online Application Submitted',                   status: 'completed', time: '31 Jul 2026, 02:15 PM' },
      { step: 'Accounts Cell Fee Verified',                     status: 'completed', time: '01 Aug 2026, 09:30 AM' },
      { step: 'Transport Officer Reviewing Seat Capacity',      status: 'current',   time: 'In Progress' },
      { step: 'Pass Credential Issuance',                       status: 'pending' },
    ],
  },
  {
    id: '3',
    refNumber: 'APP-2026-7812',
    academicYear: '2026 - 2027',
    route: 'Route #04 - Tenali Local',
    stop: 'Tenali Railway Station Stop',
    date: '28 Jul 2026',
    state: 'Submitted',
    description: 'Submitted online. Pending Accounts Cell transaction verification.',
    feeAmount: 18500,
    actionLabel: 'View Application Summary',
    actionUrl: '',
    timeline: [
      { step: 'Online Application Submitted',   status: 'completed', time: '28 Jul 2026, 11:00 AM' },
      { step: 'Accounts Cell Fee Clearance',    status: 'current',   time: 'Awaiting Receipt' },
      { step: 'Transport Officer Review',       status: 'pending' },
      { step: 'Pass Credential Issuance',       status: 'pending' },
    ],
  },
  {
    id: '4',
    refNumber: 'APP-2026-6901',
    academicYear: '2025 - 2026',
    route: 'Route #14 - Guntur City Express',
    stop: 'Old Bus Stand, Guntur',
    date: '09 Aug 2025',
    state: 'Expired',
    description: 'Pass expired at the end of Academic Year 2025-2026. Renewal required.',
    feeAmount: 18500,
    actionLabel: 'Renew Pass',
    actionUrl: '/student/renew',
    timeline: [
      { step: 'Online Application Submitted',         status: 'completed', time: '09 Aug 2025' },
      { step: 'Accounts Cell Fee Verified (₹18,500)', status: 'completed', time: '10 Aug 2025' },
      { step: 'Transport Officer Approval',           status: 'completed', time: '10 Aug 2025' },
      { step: 'Pass Expired — May 2026',              status: 'failed',    time: '31 May 2026' },
    ],
  },
  {
    id: '5',
    refNumber: 'APP-2026-5511',
    academicYear: '2026 - 2027',
    route: 'Route #02 - Narasaraopet Local',
    stop: 'Narasaraopet Bus Stand',
    date: '20 Jul 2026',
    state: 'Rejected',
    description: 'Route capacity full. Please choose an alternative route or boarding stop.',
    feeAmount: 18500,
    actionLabel: 'Apply Again',
    actionUrl: '/student/apply',
    timeline: [
      { step: 'Online Application Submitted',    status: 'completed', time: '20 Jul 2026' },
      { step: 'Accounts Cell Fee Verified',      status: 'completed', time: '21 Jul 2026' },
      { step: 'Route Capacity Check — FAILED',   status: 'failed',    time: '22 Jul 2026' },
      { step: 'Pass Credential Issuance',        status: 'failed' },
    ],
  },
  {
    id: '6',
    refNumber: 'DRAFT-2026-0042',
    academicYear: '2026 - 2027',
    route: 'Route #06 - Mangalagiri Express',
    stop: 'Mangalagiri Bus Stop',
    date: '30 Jul 2026',
    state: 'Draft',
    description: 'Saved draft — application not yet submitted. Complete and submit to proceed.',
    feeAmount: 18500,
    actionLabel: 'Continue Application',
    actionUrl: '/student/apply',
    timeline: [
      { step: 'Draft Saved',                   status: 'completed', time: '30 Jul 2026' },
      { step: 'Submission Pending',            status: 'current' },
      { step: 'Fee Verification',              status: 'pending' },
      { step: 'Pass Credential Issuance',      status: 'pending' },
    ],
  },
];

// ─────────────────────────────────────────────
// Notifications (extended type for Notifications page)
// ─────────────────────────────────────────────

export interface DetailedNotification extends NotificationItem {
  category: 'Renewals' | 'Announcements' | 'Payment Updates' | 'Application Updates' | 'Transport Notices';
  fullMessage: string;
  actionUrl?: string;
  sender: string;
}

export const MOCK_NOTIFICATIONS: DetailedNotification[] = [
  {
    id: '1',
    title: 'Digital Bus Pass Issued for Route #14',
    message: 'Your annual bus pass for Route #14 (Guntur City Express) has been approved by the Transport Cell.',
    fullMessage: 'Your annual bus pass for Route #14 (Guntur City Express) has been approved by Dr. M. R. K. Murthy. You can now present your digital pass or QR code directly on your smartphone to the bus conductor upon boarding.',
    time: '10 mins ago',
    read: false,
    type: 'pass',
    category: 'Application Updates',
    sender: 'VFSTR Transport Cell',
    actionUrl: '/student/pass',
  },
  {
    id: '2',
    title: 'Morning Pickup Schedule Adjustment',
    message: 'Morning pickup time for Guntur City Route #8 moved 5 mins earlier starting next Monday.',
    fullMessage: 'Due to road widening work on Guntur-Vadlamudi Highway, the morning pickup time for Route #8 (Collectorate Stop) has been shifted 5 minutes earlier to 07:05 AM starting Monday.',
    time: '1 hour ago',
    read: false,
    type: 'route',
    category: 'Transport Notices',
    sender: 'Traffic Operations Office',
  },
  {
    id: '3',
    title: 'Annual Fee Payment Verified (₹18,500)',
    message: 'Online transaction ₹18,500 successfully verified by VFSTR Accounts Desk.',
    fullMessage: 'Payment transaction ₹18,500 for Academic Year 2026-2027 has been verified by the VFSTR Cash Desk. Receipt PDF is available for download in your Payments section.',
    time: 'Yesterday, 04:30 PM',
    read: true,
    type: 'pass',
    category: 'Payment Updates',
    sender: 'VFSTR Accounts Cell',
    actionUrl: '/student/payments',
  },
  {
    id: '4',
    title: 'Early Bird Renewal Window Open for AY 2027-2028',
    message: 'Annual transport renewal window is now open for all senior students.',
    fullMessage: 'Beat the rush! The early bird renewal window for Academic Year 2027-2028 is now open. Submit your renewal request early to ensure guaranteed seat reservation on your preferred route.',
    time: '2 days ago',
    read: true,
    type: 'alert',
    category: 'Renewals',
    sender: 'Transport Cell Admin',
    actionUrl: '/student/renew',
  },
  {
    id: '5',
    title: 'Mid-Term Exam Special Bus Timings',
    message: 'Special afternoon buses will depart campus at 01:30 PM & 05:00 PM during exam week.',
    fullMessage: 'In view of mid-term examinations, special afternoon return buses will depart Vadlamudi campus at 01:30 PM in addition to the regular 05:00 PM evening schedule.',
    time: '3 days ago',
    read: true,
    type: 'alert',
    category: 'Announcements',
    sender: 'University Transport Committee',
  },
];

// ─────────────────────────────────────────────
// Dashboard Announcements
// ─────────────────────────────────────────────

export const MOCK_ANNOUNCEMENTS = [
  {
    id: '1',
    title: 'Mid-Term Exam Bus Schedule Adjustment',
    date: '02 Aug 2026',
    body: 'Special afternoon buses will depart campus at 01:30 PM & 05:00 PM during exam week.',
    type: 'info' as const,
  },
  {
    id: '2',
    title: 'Independence Day Rehearsal Travel Notice',
    date: '12 Aug 2026',
    body: 'Buses will operate on normal morning timings with extra noon trips.',
    type: 'alert' as const,
  },
];
