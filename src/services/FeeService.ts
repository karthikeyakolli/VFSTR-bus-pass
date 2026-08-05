import { AcademicSessionWindow, RouteFeeRecord, PaymentGatewayType } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface TransportFeeStructure {
  routeId: string;
  routeName: string;
  annualFee: number;
  termFee: number;
  dueDate: string;
}

const mockFeeSchedule: TransportFeeStructure[] = [
  { routeId: 'R14', routeName: 'Route #14 - Guntur City Express', annualFee: 29900, termFee: 14950, dueDate: '15 Aug 2026' },
  { routeId: 'R08', routeName: 'Route #08 - Vijayawada Express', annualFee: 56400, termFee: 28200, dueDate: '15 Aug 2026' },
  { routeId: 'R04', routeName: 'Route #04 - Tenali Local', annualFee: 22400, termFee: 11200, dueDate: '15 Aug 2026' },
];

const mockCurrentSession: AcademicSessionWindow = {
  id: 'sess_2026',
  academicYear: '2026 - 2027',
  isCurrent: true,
  applicationWindowStart: '01 Jun 2026',
  applicationWindowEnd: '31 Aug 2026',
  renewalWindowStart: '01 Jul 2026',
  renewalWindowEnd: '15 Aug 2026',
  renewalDeadline: '15 Aug 2026',
  lateFeeAmount: 500,
};

export class FeeService {
  /**
   * Retrieve active academic session window & deadlines.
   */
  static async getCurrentAcademicSession(): Promise<AcademicSessionWindow> {
    if (!isSupabaseConfigured) {
      return { ...mockCurrentSession };
    }

    try {
      const { data, error } = await supabase
        .from('academic_sessions')
        .select('*')
        .eq('is_current', true)
        .single();

      if (error || !data) return mockCurrentSession;

      const s = data as any;
      return {
        id: s.id,
        academicYear: s.academic_year,
        isCurrent: s.is_current,
        applicationWindowStart: s.application_window_start,
        applicationWindowEnd: s.application_window_end,
        renewalWindowStart: s.renewal_window_start,
        renewalWindowEnd: s.renewal_window_end,
        renewalDeadline: s.renewal_deadline,
        lateFeeAmount: s.late_fee_amount || 500,
      };
    } catch {
      return mockCurrentSession;
    }
  }

  /**
   * Retrieve multi-year route fee records with revision versioning.
   */
  static async getRouteFeeRecords(academicYear = '2026 - 2027'): Promise<RouteFeeRecord[]> {
    if (!isSupabaseConfigured) {
      return mockFeeSchedule.map((f, i) => ({
        id: `fee_${i}`,
        routeId: f.routeId,
        routeCode: f.routeId,
        routeName: f.routeName,
        academicYear,
        feeCategory: 'Standard Distance Tier',
        annualFee: f.annualFee,
        termFee: f.termFee,
        allowInstallments: true,
        installmentTerms: 2,
        dueDate: f.dueDate,
        isActive: true,
        version: 1,
        supportedGateways: ['offline_challan', 'net_banking', 'upi', 'razorpay'] as PaymentGatewayType[],
      }));
    }

    try {
      const { data, error } = await supabase
        .from('fees')
        .select(`
          id,
          academic_year,
          annual_fee,
          term_fee,
          due_date,
          fee_category,
          allow_installments,
          installment_terms,
          is_active,
          version,
          routes (
            id,
            route_number,
            route_name
          )
        `)
        .eq('academic_year', academicYear)
        .eq('is_active', true);

      if (error || !data) return [];

      return data.map((fee: any) => {
        const r = fee.routes;
        return {
          id: fee.id,
          routeId: r?.id || fee.id,
          routeCode: r?.route_number || 'R01',
          routeName: r?.route_name || 'Guntur',
          academicYear: fee.academic_year,
          feeCategory: fee.fee_category || 'Standard Tier',
          annualFee: fee.annual_fee,
          termFee: fee.term_fee,
          allowInstallments: Boolean(fee.allow_installments),
          installmentTerms: fee.installment_terms || 2,
          dueDate: fee.due_date,
          isActive: fee.is_active,
          version: fee.version || 1,
          supportedGateways: ['offline_challan', 'net_banking', 'upi', 'razorpay'],
        };
      });
    } catch {
      return [];
    }
  }

  /**
   * Legacy backward-compatible fee schedule provider.
   */
  static async getFeeSchedule(): Promise<TransportFeeStructure[]> {
    const records = await this.getRouteFeeRecords('2026 - 2027');
    if (records.length === 0) return [...mockFeeSchedule];

    return records.map((r) => ({
      routeId: r.routeCode,
      routeName: `${r.routeCode} - ${r.routeName}`,
      annualFee: r.annualFee,
      termFee: r.termFee,
      dueDate: r.dueDate,
    }));
  }
}
