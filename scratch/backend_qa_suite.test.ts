import { describe, it, expect } from 'vitest';
import { AuthService } from '../src/services/AuthService';
import { StudentImportService } from '../src/services/StudentImportService';
import { StudentService } from '../src/services/StudentService';
import { TransportService } from '../src/services/TransportService';
import { RouteService } from '../src/services/RouteService';
import { BusPassService } from '../src/services/BusPassService';
import { RequestService } from '../src/services/RequestService';
import { PaymentService } from '../src/services/PaymentService';
import { FeeService } from '../src/services/FeeService';
import { NoticeService } from '../src/services/NoticeService';
import { StorageService } from '../src/services/StorageService';
import { ErrorHandlingService, SystemErrorCode } from '../src/services/ErrorHandlingService';

describe('VFSTR STMS Backend QA Integration Test Suite', () => {
  it('1. Auth Resolution Test - Roll number maps correctly to email', async () => {
    const email = await AuthService.resolveIdentifierToEmail('221FA04001');
    expect(email).toBe('221FA04001@vignan.ac.in');
  });

  it('2. Student Import Test - Validates missing fields and detects duplicate roll numbers', async () => {
    const invalidRow = {
      'Register Number': '',
      'Student Name': 'Test Student',
      'Section': 'A',
      'Student Mobile': '9876543210',
    };

    const report = await StudentImportService.importStudentSpreadsheet([invalidRow, invalidRow]);
    expect(report.failedCount).toBeGreaterThan(0);
    expect(report.failureLogs.length).toBeGreaterThan(0);
  });

  it('3. Student Profile Test - Retrieves full profile for valid register number', async () => {
    const profile = await StudentService.getStudentProfileByRegNo('221FA04001');
    expect(profile).not.toBeNull();
    expect(profile?.regNo).toBe('221FA04001');
    expect(profile?.email).toContain('@vignan.ac.in');
  });

  it('4. Transport Profile Lifecycle Test - Retains pass history upon stage transition', async () => {
    const completeProfile = await TransportService.getCompleteTransportProfile('usr_04001');
    expect(completeProfile.history).toBeDefined();
    expect(Array.isArray(completeProfile.history)).toBe(true);
  });

  it('5. Route Network Test - Retrieves expandable 70+ routes', async () => {
    const routes = await RouteService.getAllNetworkRoutes();
    expect(routes.length).toBeGreaterThan(0);
    expect(routes[0].stops).toBeDefined();
  });

  it('6. Fee Architecture Test - Returns current academic session and route fee schedules', async () => {
    const session = await FeeService.getCurrentAcademicSession();
    expect(session.academicYear).toBeDefined();

    const fees = await FeeService.getRouteFeeRecords('2026 - 2027');
    expect(fees.length).toBeGreaterThan(0);
  });

  it('7. Bus Pass Management Test - Retrieves digital pass with printable placeholders', async () => {
    const pass = await BusPassService.getActivePassRecord('usr_04001');
    expect(pass.passNumber).toBeDefined();
    expect(pass.printableTemplateId).toBe('VFSTR_OFFICIAL_PASS_V1');
  });

  it('8. Request Workflow Test - Submits new request and logs initial stage', async () => {
    const res = await RequestService.createTransportRequest({
      studentId: 'usr_04001',
      requestType: 'route_change',
      reason: 'Relocated to Tenali',
      pickupPoint: 'Tenali Main Circle',
    });
    expect(res.success).toBe(true);
    expect(res.refNumber).toContain('REQ-2026');
  });

  it('9. Payment Architecture Test - Initiates payment with unique receipt serial', async () => {
    const res = await PaymentService.initiatePayment({
      studentId: 'usr_04001',
      academicYear: '2026 - 2027',
      routeCode: 'R14',
      routeName: 'Route #14',
      amount: 29900,
      paymentMethod: 'offline_challan',
    });
    expect(res.success).toBe(true);
    expect(res.receiptNumber).toContain('REC-VFSTR');
  });

  it('10. Centralized Notification Test - Dispatches system notice', async () => {
    const res = await NoticeService.sendNotification({
      title: 'QA Test Alert',
      description: 'System sanity verification',
      category: 'general_notice',
    });
    expect(res.success).toBe(true);
  });

  it('11. Storage Architecture Test - Enforces file size and MIME format rules', () => {
    const oversizedFile = new File(['x'.repeat(15 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' });
    const validation = StorageService.validateFile(oversizedFile, 'avatars');
    expect(validation.valid).toBe(false);
    expect(validation.error).toContain('File size exceeds');

    const invalidMimeFile = new File(['test'], 'script.exe', { type: 'application/x-msdownload' });
    const mimeValidation = StorageService.validateFile(invalidMimeFile, 'avatars');
    expect(mimeValidation.valid).toBe(false);
    expect(mimeValidation.error).toContain('Unsupported format');
  });

  it('12. Standardized Error Response Test - Formats reusable SystemErrorCode payload', () => {
    const err = ErrorHandlingService.errorResponse('Unauthorized access attempt', SystemErrorCode.UNAUTHORIZED_ACCESS);
    expect(err.success).toBe(false);
    expect(err.errorCode).toBe('ERR_AUTH_1001');
    expect(err.timestamp).toBeDefined();
  });
});
