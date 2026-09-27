import { UserRole } from '@/types';

export type Permission =
  | 'view_student_portal'
  | 'book_bus_seat'
  | 'view_bus_pass'
  | 'make_payments'
  | 'view_faculty_portal'
  | 'view_driver_console'
  | 'scan_qr_pass'
  | 'broadcast_gps'
  | 'view_admin_portal'
  | 'manage_fleet'
  | 'manage_drivers'
  | 'manage_passes'
  | 'manage_fees'
  | 'manage_violations'
  | 'import_students';

export interface RoleMetadata {
  role: UserRole;
  title: string;
  badge: string;
  defaultPath: string;
  description: string;
  demoIdentifier: string;
  demoName: string;
  permissions: Permission[];
}

export const ROLE_METADATA: Record<UserRole, RoleMetadata> = {
  student: {
    role: 'student',
    title: 'Student Portal',
    badge: 'AY 2026-27 Active',
    defaultPath: '/student',
    description: 'Digital Pass, Seat Booking, GPS Tracking & Fee Payment',
    demoIdentifier: '251FA04001',
    demoName: 'Karthikeya Kolli',
    permissions: [
      'view_student_portal',
      'book_bus_seat',
      'view_bus_pass',
      'make_payments',
    ],
  },
  faculty: {
    role: 'faculty',
    title: 'Faculty Portal',
    badge: '100% Subsidized Pass',
    defaultPath: '/faculty',
    description: 'Subsidized Transit Pass, Priority Berths & Duty Travel',
    demoIdentifier: 'VFSTR-FAC-101',
    demoName: 'Dr. M. S. R. Murthy (Dean)',
    permissions: [
      'view_student_portal',
      'view_faculty_portal',
      'book_bus_seat',
      'view_bus_pass',
    ],
  },
  driver: {
    role: 'driver',
    title: 'Driver Console',
    badge: 'Bus AP 07 TJ 4521 • Route #14',
    defaultPath: '/driver/dashboard',
    description: 'Camera QR Pass Scanner & Real-Time Telemetry',
    demoIdentifier: 'DRV-001',
    demoName: 'K. Venkateswarlu',
    permissions: [
      'view_driver_console',
      'scan_qr_pass',
      'broadcast_gps',
    ],
  },
  admin: {
    role: 'admin',
    title: 'Transport Administration',
    badge: 'Transport Office Authority',
    defaultPath: '/admin/fleet',
    description: '71-Route Fleet Operations, Passes, Revenue & Rosters',
    demoIdentifier: 'VFSTR-ADM-001',
    demoName: 'Dr. K. Sathyanarayana (Dean Operations)',
    permissions: [
      'view_student_portal',
      'book_bus_seat',
      'view_bus_pass',
      'make_payments',
      'view_faculty_portal',
      'view_driver_console',
      'scan_qr_pass',
      'broadcast_gps',
      'view_admin_portal',
      'manage_fleet',
      'manage_drivers',
      'manage_passes',
      'manage_fees',
      'manage_violations',
      'import_students',
    ],
  },
  superadmin: {
    role: 'superadmin',
    title: 'Super Administrator',
    badge: 'Full Root Privileges',
    defaultPath: '/admin/fleet',
    description: 'Full unrestricted system administration & override authority',
    demoIdentifier: 'VFSTR-ADM-001',
    demoName: 'Super Admin Authority',
    permissions: [
      'view_student_portal',
      'book_bus_seat',
      'view_bus_pass',
      'make_payments',
      'view_faculty_portal',
      'view_driver_console',
      'scan_qr_pass',
      'broadcast_gps',
      'view_admin_portal',
      'manage_fleet',
      'manage_drivers',
      'manage_passes',
      'manage_fees',
      'manage_violations',
      'import_students',
    ],
  },
};

/**
 * Check if a role possesses a specific permission
 */
export function hasPermission(role: UserRole | null | undefined, permission: Permission): boolean {
  if (!role) return false;
  if (role === 'superadmin' || role === 'admin') return true;
  return ROLE_METADATA[role]?.permissions.includes(permission) ?? false;
}

/**
 * Check if a user's role satisfies the required roles with hierarchy inheritance
 */
export function checkRoleAccess(userRole: UserRole | null | undefined, allowedRoles?: UserRole[]): boolean {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  if (!userRole) return false;
  if (userRole === 'superadmin') return true;
  if (allowedRoles.includes(userRole)) return true;
  // Admin role can inspect / preview driver, faculty, and student portals
  if (userRole === 'admin') return true;
  return false;
}

/**
 * Get default home route for a given user role
 */
export function getDefaultPortalRoute(role: UserRole | null | undefined): string {
  if (!role) return '/login';
  return ROLE_METADATA[role]?.defaultPath ?? '/login';
}
