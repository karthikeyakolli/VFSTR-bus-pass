import { BusPassDetails, TransportService } from './TransportService';
import { BusPassRecord, BusPassLifecycleStage, PassVerificationState } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const mockBusPassRecord: BusPassRecord = {
  id: 'pass_04001',
  passNumber: 'VFSTR-2026-R14-04001',
  studentId: 'usr_04001',
  studentRegNo: '221FA04001',
  studentName: 'K. S. V. Prasad',
  academicYear: '2026 - 2027',
  assignedRouteNumber: 'Route #14',
  assignedRouteName: 'Guntur City Express',
  pickupStop: 'Old Bus Stand, Guntur',
  issueDate: '10 Aug 2026',
  expiryDate: '31 May 2027',
  status: 'active',
  lifecycleStage: 'active',
  verificationState: 'officer_authorized',
  qrPayloadUrl: 'https://storage.placeholder.com/passes/qr_2026_04001.png',
  pdfPassUrl: 'https://storage.placeholder.com/passes/pass_2026_04001.pdf',
  printableTemplateId: 'VFSTR_OFFICIAL_PASS_V1',
  feeAmount: 29900,
  paymentStatus: 'paid',
  authorizedBy: 'Dr. M. R. K. Murthy (Transport In-Charge)',
};

export class BusPassService {
  /**
   * Fetch active bus pass record for a student.
   */
  static async getActivePassRecord(regNoOrStudentId: string): Promise<BusPassRecord> {
    if (!isSupabaseConfigured) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      return { ...mockBusPassRecord };
    }

    try {
      const { data, error } = await supabase
        .from('bus_passes')
        .select(`
          id,
          pass_number,
          student_id,
          academic_year,
          valid_from,
          valid_until,
          status,
          lifecycle_stage,
          verification_state,
          qr_payload_url,
          pdf_pass_url,
          printable_template_id,
          fee_amount,
          payment_status,
          authorized_by,
          pickup_point,
          students (
            reg_no,
            full_name
          ),
          routes (
            route_number,
            route_name
          )
        `)
        .eq('student_id', regNoOrStudentId)
        .eq('status', 'active')
        .single();

      if (error || !data) {
        return mockBusPassRecord;
      }

      const p = data as any;
      const s = p.students;
      const r = p.routes;

      return {
        id: p.id,
        passNumber: p.pass_number,
        studentId: p.student_id,
        studentRegNo: s?.reg_no || '221FA04001',
        studentName: s?.full_name || 'K. S. V. Prasad',
        academicYear: p.academic_year,
        assignedRouteNumber: r?.route_number || 'Route #14',
        assignedRouteName: r?.route_name || 'Guntur City Express',
        pickupStop: p.pickup_point,
        issueDate: p.valid_from,
        expiryDate: p.valid_until,
        status: p.status,
        lifecycleStage: p.lifecycle_stage as BusPassLifecycleStage,
        verificationState: p.verification_state as PassVerificationState,
        qrPayloadUrl: p.qr_payload_url || undefined,
        pdfPassUrl: p.pdf_pass_url || undefined,
        printableTemplateId: p.printable_template_id || 'VFSTR_OFFICIAL_PASS_V1',
        feeAmount: p.fee_amount,
        paymentStatus: p.payment_status,
        authorizedBy: p.authorized_by || 'Dr. M. R. K. Murthy',
      };
    } catch {
      return mockBusPassRecord;
    }
  }

  /**
   * Transition bus pass state through lifecycle stages.
   */
  static async transitionPassState(
    passId: string,
    targetStage: BusPassLifecycleStage,
    verificationState?: PassVerificationState
  ): Promise<boolean> {
    if (!isSupabaseConfigured) return true;

    try {
      const updates: any = {
        lifecycle_stage: targetStage,
        status: targetStage === 'active' ? 'active' : targetStage === 'expired' ? 'expired' : 'pending',
        updated_at: new Date().toISOString(),
      };

      if (verificationState) {
        updates.verification_state = verificationState;
      }

      const { error } = await supabase
        .from('bus_passes')
        .update(updates)
        .eq('id', passId);

      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Legacy backward-compatible helper for BusPassDetails.
   */
  static async getActivePass(regNo: string): Promise<BusPassDetails> {
    return TransportService.getDigitalPass(regNo);
  }
}
