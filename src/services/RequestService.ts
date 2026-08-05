import { ApplicationRecord } from '@/pages/student/ApplicationStatusPage';
import { TransportRequestRecord, TransportRequestType, RequestWorkflowStage } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const mockRequests: ApplicationRecord[] = [
  {
    id: '1',
    refNumber: 'APP-2026-8942',
    academicYear: '2026 - 2027',
    route: 'Route #14 - Guntur City Express',
    stop: 'Old Bus Stand, Guntur',
    date: '02 Aug 2026',
    state: 'Approved',
    description: 'Application approved by Transport Cell. Digital pass credential generated.',
    feeAmount: 29900,
    actionLabel: 'View Digital Pass',
    actionUrl: '/student/pass',
    timeline: [
      { step: 'Online Application Submitted', status: 'completed', time: '01 Aug 2026, 10:00 AM' },
      { step: 'Accounts Cell Fee Verified (₹29,900)', status: 'completed', time: '01 Aug 2026, 04:30 PM' },
      { step: 'Transport Officer Approval', status: 'completed', time: '02 Aug 2026, 11:15 AM' },
      { step: 'Digital QR Pass Generated', status: 'completed', time: '02 Aug 2026, 11:16 AM' },
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
    feeAmount: 56400,
    actionLabel: 'Check Status Details',
    actionUrl: '',
    timeline: [
      { step: 'Online Application Submitted', status: 'completed', time: '31 Jul 2026, 02:15 PM' },
      { step: 'Accounts Cell Fee Verified', status: 'completed', time: '01 Aug 2026, 09:30 AM' },
      { step: 'Transport Officer Reviewing Seat Capacity', status: 'current', time: 'In Progress' },
      { step: 'Pass Credential Issuance', status: 'pending' },
    ],
  },
];

export class RequestService {
  /**
   * Submit a new transport request with type, reason, and optional supporting document attachments.
   */
  static async createTransportRequest(params: {
    studentId: string;
    requestType: TransportRequestType;
    reason: string;
    routeId?: string;
    stopId?: string;
    pickupPoint: string;
    supportingDocumentsUrl?: string;
  }): Promise<{ success: boolean; refNumber: string; requestId?: string }> {
    const refNumber = `REQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    if (!isSupabaseConfigured) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return { success: true, refNumber, requestId: `req_${Date.now()}` };
    }

    try {
      const { data, error } = await supabase
        .from('transport_requests')
        .insert({
          ref_number: refNumber,
          student_id: params.studentId,
          workflow_type: params.requestType,
          workflow_stage: 'submitted',
          reason: params.reason,
          route_id: params.routeId,
          stop_id: params.stopId,
          pickup_point: params.pickupPoint,
          supporting_documents_url: params.supportingDocumentsUrl,
          submitted_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (error || !data) return { success: false, refNumber };

      // Record initial audit stage in request_status_history
      await supabase.from('request_status_history').insert({
        request_id: data.id,
        previous_stage: null,
        new_stage: 'submitted',
        remarks: 'Request submitted online by student',
        changed_by: 'Student',
      });

      return { success: true, refNumber, requestId: data.id };
    } catch {
      return { success: false, refNumber };
    }
  }

  /**
   * Transition request lifecycle stage while building non-destructive audit history trail.
   */
  static async updateRequestStage(
    requestId: string,
    newStage: RequestWorkflowStage,
    remarks?: string,
    changedBy = 'Transport Officer'
  ): Promise<boolean> {
    if (!isSupabaseConfigured) return true;

    try {
      const { data: currentReq } = await supabase
        .from('transport_requests')
        .select('workflow_stage')
        .eq('id', requestId)
        .single();

      const previousStage = currentReq?.workflow_stage || null;

      // 1. Update request stage
      const { error } = await supabase
        .from('transport_requests')
        .update({
          workflow_stage: newStage,
          review_notes: remarks,
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) return false;

      // 2. Insert audit trail into request_status_history
      await supabase.from('request_status_history').insert({
        request_id: requestId,
        previous_stage: previousStage,
        new_stage: newStage,
        remarks: remarks || `Request stage updated to ${newStage}`,
        changed_by: changedBy,
      });

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Retrieve complete transport requests with status audit trail for a student.
   */
  static async getStudentTransportRequests(studentId: string): Promise<TransportRequestRecord[]> {
    if (!isSupabaseConfigured) {
      return [
        {
          id: 'req_1',
          refNumber: 'REQ-2026-8942',
          studentId,
          requestType: 'new_enrollment',
          currentStatus: 'approved',
          reason: 'Annual transport enrollment for AY 2026-27',
          pickupPoint: 'Old Bus Stand, Guntur',
          submittedDate: '01 Aug 2026',
          updatedDate: '02 Aug 2026',
          remarks: 'Approved by Dr. M. R. K. Murthy',
          history: [
            { id: 'h1', requestId: 'req_1', newStage: 'submitted', changedBy: 'Student', changedAt: '01 Aug 2026, 10:00 AM' },
            { id: 'h2', requestId: 'req_1', previousStage: 'submitted', newStage: 'under_review', changedBy: 'Accounts Desk', changedAt: '01 Aug 2026, 04:30 PM' },
            { id: 'h3', requestId: 'req_1', previousStage: 'under_review', newStage: 'approved', changedBy: 'Transport In-Charge', changedAt: '02 Aug 2026, 11:15 AM' },
          ],
        },
      ];
    }

    try {
      const { data, error } = await supabase
        .from('transport_requests')
        .select(`
          id,
          ref_number,
          student_id,
          workflow_type,
          workflow_stage,
          reason,
          pickup_point,
          submitted_at,
          updated_at,
          review_notes,
          supporting_documents_url,
          routes (
            route_number,
            route_name
          ),
          request_status_history (
            id,
            previous_stage,
            new_stage,
            remarks,
            changed_by,
            changed_at
          )
        `)
        .eq('student_id', studentId)
        .order('submitted_at', { ascending: false });

      if (error || !data) return [];

      return data.map((req: any) => ({
        id: req.id,
        refNumber: req.ref_number,
        studentId: req.student_id,
        requestType: req.workflow_type as TransportRequestType,
        currentStatus: req.workflow_stage as RequestWorkflowStage,
        reason: req.reason || 'Transport request submission',
        routeName: req.routes ? `${req.routes.route_number} - ${req.routes.route_name}` : undefined,
        pickupPoint: req.pickup_point,
        submittedDate: new Date(req.submitted_at).toLocaleDateString(),
        updatedDate: new Date(req.updated_at || req.submitted_at).toLocaleDateString(),
        remarks: req.review_notes || undefined,
        supportingDocumentsUrl: req.supporting_documents_url || undefined,
        history: (req.request_status_history || []).map((h: any) => ({
          id: h.id,
          requestId: req.id,
          previousStage: h.previous_stage as RequestWorkflowStage,
          newStage: h.new_stage as RequestWorkflowStage,
          remarks: h.remarks,
          changedBy: h.changed_by,
          changedAt: new Date(h.changed_at).toLocaleString(),
        })),
      }));
    } catch {
      return [];
    }
  }

  /**
   * Backward-compatible helper for legacy ApplicationRecord queries.
   */
  static async getStudentRequests(_regNo: string): Promise<ApplicationRecord[]> {
    if (!isSupabaseConfigured) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      return [...mockRequests];
    }

    try {
      const requests = await this.getStudentTransportRequests(_regNo);
      if (requests.length === 0) return [...mockRequests];

      return requests.map((req) => ({
        id: req.id,
        refNumber: req.refNumber,
        academicYear: '2026 - 2027',
        route: req.routeName || 'Route #14 - Guntur City Express',
        stop: req.pickupPoint,
        date: req.submittedDate,
        state: req.currentStatus === 'approved' ? 'Approved' : req.currentStatus === 'rejected' ? 'Rejected' : 'Under Review',
        description: req.reason,
        feeAmount: 29900,
        actionLabel: req.currentStatus === 'approved' ? 'View Digital Pass' : 'Check Status Details',
        actionUrl: req.currentStatus === 'approved' ? '/student/pass' : '',
        timeline: req.history.map((h) => ({
          step: `Stage: ${h.newStage.toUpperCase()} (${h.remarks || 'Updated'})`,
          status: h.newStage === 'approved' ? 'completed' : 'current',
          time: h.changedAt,
        })),
      }));
    } catch {
      return mockRequests;
    }
  }
}
