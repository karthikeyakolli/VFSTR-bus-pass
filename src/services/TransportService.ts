import { ApplicationRecord } from '@/pages/student/ApplicationStatusPage';
import { CompleteTransportProfile, HistoricalTransportRecord, BusPassLifecycleStage } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface BusPassDetails {
  passNumber: string;
  academicYear: string;
  status: 'active' | 'pending' | 'expired' | 'renewal_required';
  issueDate: string;
  expiryDate: string;
  daysRemaining: number;
  assignedRouteNumber: string;
  assignedRouteName: string;
  assignedStop: string;
  morningPickupTime: string;
  eveningDepartureTime: string;
  assignedBusRegNo: string;
  assignedBusId: string;
  transportOfficeStatus: string;
  feePaid: number;
  paymentStatus: string;
  authorizedBy: string;
}

const mockPassDetails: BusPassDetails = {
  passNumber: 'VFSTR-2026-R14-04001',
  academicYear: '2026 - 2027',
  status: 'active',
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
  paymentStatus: 'Paid',
  authorizedBy: 'Dr. M. R. K. Murthy (Transport In-Charge)',
};

const mockTransportProfile: CompleteTransportProfile = {
  studentId: 'usr_04001',
  regNo: '221FA04001',
  studentName: 'K. S. V. Prasad',
  academicYear: '2026 - 2027',
  transportType: 'annual_bus_pass',
  transportStatus: 'active',
  assignedRouteNumber: 'Route #14',
  assignedRouteName: 'Guntur City Express',
  pickupStop: 'Old Bus Stand, Guntur',
  dropStop: 'VFSTR Vadlamudi Main Campus',
  assignedBusNo: 'AP 07 TJ 4521',
  assignedBusCode: 'VFSTR-B14',
  driverName: 'Mr. K. Venkateswarlu',
  driverPhone: '+91 94401 23456',
  currentPassNumber: 'VFSTR-2026-R14-04001',
  renewalDate: '15 Jul 2027',
  validUntil: '31 May 2027',
  history: [
    {
      id: 'h1',
      academicYear: '2025 - 2026',
      passNumber: 'VFSTR-2025-R14-04001',
      routeNumber: 'Route #14',
      routeName: 'Guntur City Express',
      pickupStop: 'Old Bus Stand, Guntur',
      feeAmount: 18500,
      lifecycleStage: 'archived',
      validFrom: '10 Aug 2025',
      validUntil: '31 May 2026',
      archivedAt: '01 Jun 2026',
    },
    {
      id: 'h2',
      academicYear: '2024 - 2025',
      passNumber: 'VFSTR-2024-R14-04001',
      routeNumber: 'Route #14',
      routeName: 'Guntur City Express',
      pickupStop: 'Old Bus Stand, Guntur',
      feeAmount: 17500,
      lifecycleStage: 'archived',
      validFrom: '10 Aug 2024',
      validUntil: '31 May 2025',
      archivedAt: '01 Jun 2025',
    },
  ],
};

export class TransportService {
  /**
   * Fetch complete transport profile details and historical bus pass records across academic years.
   */
  static async getCompleteTransportProfile(studentIdOrRegNo: string): Promise<CompleteTransportProfile> {
    if (!isSupabaseConfigured) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      return { ...mockTransportProfile };
    }

    try {
      const { data: passData } = await supabase
        .from('bus_passes')
        .select(`
          id,
          pass_number,
          academic_year,
          status,
          lifecycle_stage,
          valid_from,
          valid_until,
          pickup_point,
          drop_point,
          renewal_date,
          fee_amount,
          routes (
            route_number,
            route_name,
            buses (
              registration_no,
              bus_number,
              driver_name,
              driver_phone
            )
          )
        `)
        .eq('student_id', studentIdOrRegNo)
        .eq('status', 'active')
        .single();

      const { data: historyData } = await supabase
        .from('bus_pass_history')
        .select(`
          id,
          academic_year,
          pass_number,
          pickup_point,
          fee_amount,
          lifecycle_stage,
          created_at,
          routes (
            route_number,
            route_name
          )
        `)
        .eq('student_id', studentIdOrRegNo)
        .order('created_at', { ascending: false });

      if (!passData) {
        return mockTransportProfile;
      }

      const p = passData as any;
      const r = p.routes;
      const b = r?.buses;

      const history: HistoricalTransportRecord[] = (historyData || []).map((h: any) => ({
        id: h.id,
        academicYear: h.academic_year,
        passNumber: h.pass_number,
        routeNumber: h.routes?.route_number || 'Route #14',
        routeName: h.routes?.route_name || 'Guntur City Express',
        pickupStop: h.pickup_point,
        feeAmount: h.fee_amount,
        lifecycleStage: h.lifecycle_stage as BusPassLifecycleStage,
        validFrom: '10 Aug',
        validUntil: '31 May',
        archivedAt: h.created_at,
      }));

      return {
        studentId: studentIdOrRegNo,
        regNo: '221FA04001',
        studentName: 'K. S. V. Prasad',
        academicYear: p.academic_year,
        transportType: 'annual_bus_pass',
        transportStatus: (p.lifecycle_stage as BusPassLifecycleStage) || 'active',
        assignedRouteNumber: r?.route_number || 'Route #14',
        assignedRouteName: r?.route_name || 'Guntur City Express',
        pickupStop: p.pickup_point,
        dropStop: p.drop_point || 'VFSTR Vadlamudi Main Campus',
        assignedBusNo: b?.registration_no || 'AP 07 TJ 4521',
        assignedBusCode: b?.bus_number || 'VFSTR-B14',
        driverName: b?.driver_name || 'Mr. K. Venkateswarlu',
        driverPhone: b?.driver_phone || '+91 94401 23456',
        currentPassNumber: p.pass_number,
        renewalDate: p.renewal_date || '15 Jul 2027',
        validUntil: p.valid_until,
        history,
      };
    } catch {
      return mockTransportProfile;
    }
  }

  /**
   * Transition bus pass lifecycle stage without overwriting historical records.
   */
  static async updatePassLifecycleStage(passId: string, newStage: BusPassLifecycleStage): Promise<boolean> {
    if (!isSupabaseConfigured) {
      return true;
    }

    try {
      if (newStage === 'expired' || newStage === 'archived') {
        const { data: activePass } = await supabase
          .from('bus_passes')
          .select('*')
          .eq('id', passId)
          .single();

        if (activePass) {
          // Archive old pass into historical table before stage update
          await supabase.from('bus_pass_history').insert({
            bus_pass_id: activePass.id,
            student_id: activePass.student_id,
            academic_year: activePass.academic_year,
            route_id: activePass.route_id,
            pickup_point: activePass.pickup_point,
            drop_point: activePass.drop_point || 'VFSTR Vadlamudi Main Campus',
            pass_number: activePass.pass_number,
            lifecycle_stage: 'archived',
            fee_amount: activePass.fee_amount,
            payment_status: activePass.payment_status,
            authorized_by: activePass.authorized_by,
            archived_reason: `Pass transitioned to ${newStage}`,
          });
        }
      }

      const { error } = await supabase
        .from('bus_passes')
        .update({
          lifecycle_stage: newStage,
          status: newStage === 'active' ? 'active' : newStage === 'expired' ? 'expired' : 'pending',
        })
        .eq('id', passId);

      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Fetch digital bus pass details.
   */
  static async getDigitalPass(regNo: string): Promise<BusPassDetails> {
    if (!isSupabaseConfigured) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      return { ...mockPassDetails };
    }

    try {
      const { data, error } = await supabase
        .from('bus_passes')
        .select(`
          pass_number,
          academic_year,
          status,
          valid_from,
          valid_until,
          pickup_point,
          fee_amount,
          payment_status,
          authorized_by,
          routes (
            route_number,
            route_name,
            buses (
              registration_no,
              bus_number
            )
          )
        `)
        .eq('student_id', regNo)
        .single();

      if (error || !data) {
        return mockPassDetails;
      }

      const passData = data as any;
      const routeObj = passData.routes;
      const busObj = routeObj?.buses;

      return {
        passNumber: passData.pass_number,
        academicYear: passData.academic_year,
        status: (passData.status as any) || 'active',
        issueDate: passData.valid_from,
        expiryDate: passData.valid_until,
        daysRemaining: Math.max(0, Math.ceil((new Date(passData.valid_until).getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
        assignedRouteNumber: routeObj?.route_number || 'Route #14',
        assignedRouteName: routeObj?.route_name || 'Guntur City Express',
        assignedStop: passData.pickup_point,
        morningPickupTime: '07:10 AM',
        eveningDepartureTime: '05:15 PM',
        assignedBusRegNo: busObj?.registration_no || 'AP 07 TJ 4521',
        assignedBusId: busObj?.bus_number || 'VFSTR-B14',
        transportOfficeStatus: 'Verified & Authorized by Transport Officer',
        feePaid: passData.fee_amount,
        paymentStatus: passData.payment_status,
        authorizedBy: passData.authorized_by || 'Dr. M. R. K. Murthy',
      };
    } catch {
      return mockPassDetails;
    }
  }

  /**
   * Submit new bus pass application.
   */
  static async submitApplication(data: Partial<ApplicationRecord>): Promise<{ success: boolean; refNumber: string }> {
    const refNumber = `APP-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    if (!isSupabaseConfigured) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return { success: true, refNumber };
    }

    try {
      const { error } = await supabase.from('pass_applications').insert({
        ref_number: refNumber,
        student_id: 'usr_04001',
        application_type: 'new_pass',
        route_id: data.route || '',
        pickup_point: data.stop || '',
        status: 'pending',
      });

      return { success: !error, refNumber };
    } catch {
      return { success: true, refNumber };
    }
  }

  /**
   * Renew existing bus pass.
   */
  static async renewPass(_passNumber: string): Promise<{ success: boolean; refNumber: string }> {
    const refNumber = `REN-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    if (!isSupabaseConfigured) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return { success: true, refNumber };
    }

    try {
      const { error } = await supabase.from('pass_applications').insert({
        ref_number: refNumber,
        student_id: 'usr_04001',
        application_type: 'renewal',
        route_id: '',
        pickup_point: '',
        status: 'pending',
      });

      return { success: !error, refNumber };
    } catch {
      return { success: true, refNumber };
    }
  }
}
