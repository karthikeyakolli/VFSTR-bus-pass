import React from 'react';

export type UserRole = 'student' | 'admin' | 'superadmin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface StudentProfile extends User {
  regNo: string;
  department: string;
  academicYear: string;
  phone: string;
  emergencyContact: string;
  pickupPoint: string;
  // Optional fields — populated from API on backend integration
  section?: string;
  address?: string;
  emergencyContactName?: string;
  passStatus?: BusPassStatus;
}

export type BusPassStatus = 'pending' | 'approved' | 'rejected' | 'expired' | 'active';

export interface BusPass {
  id: string;
  passNumber: string;
  studentId: string;
  routeId: string;
  pickupPoint: string;
  validFrom: string;
  validUntil: string;
  status: BusPassStatus;
  feeAmount: number;
  paymentStatus: 'paid' | 'unpaid' | 'pending_verification';
}

export interface Route {
  id: string;
  routeNumber: string;
  routeName: string;
  stops: string[];
  assignedBusId?: string;
  totalSeats: number;
  occupiedSeats: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'pass' | 'route' | 'alert';
}

export interface SidebarSubItem {
  label: string;
  href: string;
  badge?: string;
}

export interface SidebarItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  badge?: string;
  children?: SidebarSubItem[];
}
