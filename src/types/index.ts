import React from 'react';

export type UserRole = 'student' | 'admin' | 'superadmin';

export type TransportEligibility = 'transport_user' | 'non_transport_user';

export type BusPassLifecycleStage =
  | 'not_enrolled'
  | 'applied'
  | 'verification'
  | 'approved'
  | 'pass_generated'
  | 'active'
  | 'expired'
  | 'renewal'
  | 'archived';

export type PassVerificationState =
  | 'unverified'
  | 'accounts_verified'
  | 'officer_authorized'
  | 'revoked';

export type TransportType = 'annual_bus_pass' | 'term_bus_pass' | 'faculty_staff_pass' | 'special_exam_pass';

export type TransportEnrollmentStatus = 
  | 'not_enrolled'
  | 'application_submitted'
  | 'under_verification'
  | 'approved'
  | 'active'
  | 'renewal_required'
  | 'inactive';

export type RouteStatus = 'active' | 'inactive' | 'maintenance' | 'suspended';

export type PaymentGatewayType = 'offline_challan' | 'offline_cash' | 'net_banking' | 'upi' | 'razorpay';

export type PaymentLifecycleStage =
  | 'fee_generated'
  | 'pending'
  | 'payment_initiated'
  | 'payment_successful'
  | 'receipt_generated'
  | 'completed'
  | 'failed'
  | 'refunded';

export type PaymentVerificationStatus = 'Pending' | 'Verified' | 'Failed' | 'Refunded';

export type NotificationCategory =
  | 'general_notice'
  | 'payment_reminder'
  | 'renewal_reminder'
  | 'request_update'
  | 'transport_announcement'
  | 'emergency_notice';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export type NotificationState = 'unread' | 'read' | 'archived';

export type NotificationDeliveryChannel = 'in_app' | 'email' | 'sms' | 'push_notification';

export type StorageBucketId =
  | 'avatars'
  | 'bus_passes'
  | 'receipts'
  | 'request_documents'
  | 'route_documents'
  | 'notices';

export type SystemAuditEventType =
  | 'student_imported'
  | 'transport_assigned'
  | 'bus_pass_generated'
  | 'payment_recorded'
  | 'request_submitted'
  | 'request_updated'
  | 'profile_updated'
  | 'security_event';

export type AuditActorType = 'student' | 'admin' | 'system' | 'service_role';

export interface SystemAuditRecord {
  id: string;
  timestamp: string;
  eventType: SystemAuditEventType;
  referenceId: string;
  module: string;
  actorType: AuditActorType;
  userId?: string;
  adminId?: string;
  action: string;
  entityName: string;
  entityId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
}

export interface StorageUploadRecord {
  id: string;
  bucketId: StorageBucketId;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  uploadedBy?: string;
  version: number;
  storagePath: string;
  publicOrSignedUrl: string;
  createdAt: string;
}

export interface SystemNotificationRecord {
  id: string;
  studentId?: string;
  title: string;
  description: string;
  fullMessage?: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  state: NotificationState;
  deliveryChannel: NotificationDeliveryChannel;
  createdDate: string;
  expiryDate?: string;
  relatedModule: string;
  targetAudience: string;
  actionUrl?: string;
}

export interface TransportPaymentRecord {
  id: string;
  transactionId: string;
  studentId: string;
  studentRegNo?: string;
  academicYear: string;
  routeCode: string;
  routeName: string;
  amount: number;
  paymentMethod: PaymentGatewayType;
  paymentDate: string;
  receiptNumber: string;
  receiptUrl?: string;
  verificationStatus: PaymentVerificationStatus;
  lifecycleStage: PaymentLifecycleStage;
  isInstallment: boolean;
  installmentNumber: number;
  totalInstallments: number;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  bankReferenceNo?: string;
}

export type TransportRequestType =
  | 'new_enrollment'
  | 'route_change'
  | 'pickup_stop_change'
  | 'drop_stop_change'
  | 'transport_cancellation'
  | 'bus_pass_renewal'
  | 'general_transport_query';

export type RequestWorkflowStage =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'archived';

export interface TransportRequestRecord {
  id: string;
  refNumber: string;
  studentId: string;
  studentRegNo?: string;
  studentName?: string;
  requestType: TransportRequestType;
  currentStatus: RequestWorkflowStage;
  reason: string;
  routeId?: string;
  routeName?: string;
  stopId?: string;
  pickupPoint: string;
  dropPoint?: string;
  submittedDate: string;
  updatedDate: string;
  remarks?: string;
  supportingDocumentsUrl?: string;
  history: RequestStatusHistoryRecord[];
}

export interface RequestStatusHistoryRecord {
  id: string;
  requestId: string;
  previousStage?: RequestWorkflowStage;
  newStage: RequestWorkflowStage;
  remarks?: string;
  changedBy: string;
  changedAt: string;
}

export interface AcademicSessionWindow {
  id: string;
  academicYear: string;
  isCurrent: boolean;
  applicationWindowStart: string;
  applicationWindowEnd: string;
  renewalWindowStart: string;
  renewalWindowEnd: string;
  renewalDeadline: string;
  lateFeeAmount: number;
}

export interface RouteFeeRecord {
  id: string;
  routeId: string;
  routeCode: string;
  routeName: string;
  academicYear: string;
  feeCategory: string;
  annualFee: number;
  termFee: number;
  allowInstallments: boolean;
  installmentTerms: number;
  dueDate: string;
  isActive: boolean;
  version: number;
  supportedGateways: PaymentGatewayType[];
}

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
  program: string;
  academicYear: string;
  semester: string;
  section: string;
  phone: string;
  emergencyContact: string;
  counsellor: string;
  eligibility: TransportEligibility;
  transportStatus: TransportEnrollmentStatus;
  pickupPoint: string;
  isTransportUser: boolean;
  address?: string;
  emergencyContactName?: string;
  passStatus?: BusPassStatus;
}

export type BusPassStatus = 'pending' | 'approved' | 'rejected' | 'expired' | 'active';

export interface CompleteTransportProfile {
  studentId: string;
  regNo: string;
  studentName: string;
  academicYear: string;
  transportType: TransportType;
  transportStatus: BusPassLifecycleStage;
  assignedRouteNumber: string;
  assignedRouteName: string;
  pickupStop: string;
  dropStop: string;
  assignedBusNo: string;
  assignedBusCode: string;
  driverName: string;
  driverPhone: string;
  currentPassNumber?: string;
  renewalDate?: string;
  validUntil?: string;
  history: HistoricalTransportRecord[];
}

export interface HistoricalTransportRecord {
  id: string;
  academicYear: string;
  passNumber: string;
  routeNumber: string;
  routeName: string;
  pickupStop: string;
  feeAmount: number;
  lifecycleStage: BusPassLifecycleStage;
  validFrom: string;
  validUntil: string;
  archivedAt: string;
}

export interface BusPassRecord {
  id: string;
  passNumber: string;
  studentId: string;
  studentRegNo: string;
  studentName: string;
  academicYear: string;
  assignedRouteNumber: string;
  assignedRouteName: string;
  pickupStop: string;
  issueDate: string;
  expiryDate: string;
  status: BusPassStatus;
  lifecycleStage: BusPassLifecycleStage;
  verificationState: PassVerificationState;
  qrPayloadUrl?: string;
  pdfPassUrl?: string;
  printableTemplateId: string;
  feeAmount: number;
  paymentStatus: 'paid' | 'unpaid' | 'pending_verification';
  authorizedBy?: string;
}

export interface BusPass {
  id: string;
  passNumber: string;
  studentId: string;
  routeId: string;
  pickupPoint: string;
  validFrom: string;
  validUntil: string;
  status: BusPassStatus;
  lifecycleStage?: BusPassLifecycleStage;
  feeAmount: number;
  paymentStatus: 'paid' | 'unpaid' | 'pending_verification';
}

export interface NetworkRouteStop {
  id: string;
  routeId: string;
  stopName: string;
  stopOrder: number;
  latitude?: number;
  longitude?: number;
  morningPickupTime?: string;
  eveningDropTime?: string;
  landmark?: string;
  fareAmount?: number;
  isAssigned?: boolean;
}

export interface NetworkRoute {
  id: string;
  routeCode: string;
  routeName: string;
  startingPoint: string;
  endingPoint: string;
  distanceKm: number;
  feeCategory: string;
  annualFee: number;
  status: RouteStatus;
  totalSeats: number;
  occupiedSeats: number;
  assignedBusRegNo?: string;
  stops: NetworkRouteStop[];
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
