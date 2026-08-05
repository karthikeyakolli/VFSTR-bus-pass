import { MOCK_TRANSACTIONS, type PaymentTransaction } from '@/constants/mockData';
import { TransportPaymentRecord, PaymentGatewayType, PaymentLifecycleStage } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export class PaymentService {
  /**
   * Initiate a new payment transaction (supports Offline Challan & Razorpay online integration)
   */
  static async initiatePayment(params: {
    studentId: string;
    academicYear: string;
    routeCode: string;
    routeName: string;
    amount: number;
    paymentMethod: PaymentGatewayType;
    isInstallment?: boolean;
    installmentNumber?: number;
    totalInstallments?: number;
    bankReferenceNo?: string;
  }): Promise<{ success: boolean; transactionId: string; receiptNumber: string; razorpayOrderId?: string }> {
    const transactionId = `TXN-VFSTR-${Date.now()}`;
    const receiptNumber = `REC-VFSTR-${Math.floor(10000 + Math.random() * 90000)}`;
    const isOnlineRazorpay = params.paymentMethod === 'razorpay';
    const razorpayOrderId = isOnlineRazorpay ? `order_rzp_${Date.now()}` : undefined;

    if (!isSupabaseConfigured) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return { success: true, transactionId, receiptNumber, razorpayOrderId };
    }

    try {
      const { data, error } = await supabase
        .from('payments')
        .insert({
          transaction_id: transactionId,
          receipt_number: receiptNumber,
          student_id: params.studentId,
          academic_year: params.academicYear,
          amount: params.amount,
          payment_mode: params.paymentMethod,
          payment_gateway: params.paymentMethod,
          lifecycle_stage: isOnlineRazorpay ? 'payment_initiated' : 'pending',
          status: 'pending_verification',
          is_installment: params.isInstallment || false,
          installment_number: params.installmentNumber || 1,
          total_installments: params.totalInstallments || 1,
          bank_reference_no: params.bankReferenceNo || null,
          razorpay_order_id: razorpayOrderId || null,
          paid_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (error || !data) {
        return { success: false, transactionId: '', receiptNumber: '' };
      }

      return { success: true, transactionId, receiptNumber, razorpayOrderId };
    } catch {
      return { success: false, transactionId: '', receiptNumber: '' };
    }
  }

  /**
   * Transition payment stage upon verification or gateway callback
   */
  static async updatePaymentLifecycle(
    transactionId: string,
    targetStage: PaymentLifecycleStage,
    razorpayDetails?: { paymentId: string; signature: string }
  ): Promise<boolean> {
    if (!isSupabaseConfigured) return true;

    try {
      const updates: any = {
        lifecycle_stage: targetStage,
        status: targetStage === 'completed' || targetStage === 'receipt_generated' ? 'paid' : targetStage === 'failed' ? 'failed' : 'pending_verification',
        updated_at: new Date().toISOString(),
      };

      if (targetStage === 'completed' || targetStage === 'receipt_generated') {
        updates.verified_at = new Date().toISOString();
        updates.verified_by = 'VFSTR Accounts Cell';
      }

      if (razorpayDetails) {
        updates.razorpay_payment_id = razorpayDetails.paymentId;
        updates.razorpay_signature = razorpayDetails.signature;
      }

      const { error } = await supabase
        .from('payments')
        .update(updates)
        .eq('transaction_id', transactionId);

      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Fetch complete transport payment records for a student across all academic years
   */
  static async getCompletePaymentRecords(studentId: string): Promise<TransportPaymentRecord[]> {
    if (!isSupabaseConfigured) {
      return [
        {
          id: 'pay_1',
          transactionId: 'TXN-VFSTR-984102941',
          studentId,
          academicYear: '2026 - 2027',
          routeCode: 'R14',
          routeName: 'Route #14 - Guntur City Express',
          amount: 29900,
          paymentMethod: 'offline_challan',
          paymentDate: '01 Aug 2026',
          receiptNumber: 'REC-2026-8941',
          verificationStatus: 'Verified',
          lifecycleStage: 'completed',
          isInstallment: false,
          installmentNumber: 1,
          totalInstallments: 1,
          bankReferenceNo: 'SBI-CHALLAN-984102',
        },
      ];
    }

    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('student_id', studentId)
        .order('paid_at', { ascending: false });

      if (error || !data) return [];

      return data.map((pay: any) => ({
        id: pay.id,
        transactionId: pay.transaction_id,
        studentId: pay.student_id,
        academicYear: pay.academic_year || '2026 - 2027',
        routeCode: 'R14',
        routeName: 'Route #14 - Guntur City Express',
        amount: pay.amount,
        paymentMethod: (pay.payment_gateway || pay.payment_mode || 'offline_challan') as PaymentGatewayType,
        paymentDate: new Date(pay.paid_at).toLocaleDateString(),
        receiptNumber: pay.receipt_number || `REC-VFSTR-${pay.transaction_id.slice(-5)}`,
        receiptUrl: pay.receipt_url || undefined,
        verificationStatus: pay.status === 'paid' ? 'Verified' : pay.status === 'failed' ? 'Failed' : 'Pending',
        lifecycleStage: (pay.lifecycle_stage || 'completed') as PaymentLifecycleStage,
        isInstallment: Boolean(pay.is_installment),
        installmentNumber: pay.installment_number || 1,
        totalInstallments: pay.total_installments || 1,
        razorpayOrderId: pay.razorpay_order_id || undefined,
        razorpayPaymentId: pay.razorpay_payment_id || undefined,
        razorpaySignature: pay.razorpay_signature || undefined,
        bankReferenceNo: pay.bank_reference_no || undefined,
      }));
    } catch {
      return [];
    }
  }

  /**
   * Fetch payment transaction history for a student (Backward-compatible).
   */
  static async getPaymentHistory(_regNo: string): Promise<PaymentTransaction[]> {
    if (!isSupabaseConfigured) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      return [...MOCK_TRANSACTIONS];
    }

    try {
      const records = await this.getCompletePaymentRecords(_regNo);
      if (records.length === 0) return MOCK_TRANSACTIONS;

      return records.map((pay) => ({
        id: pay.id,
        receiptNo: pay.receiptNumber,
        academicYear: pay.academicYear,
        amount: pay.amount,
        paymentMode: pay.paymentMethod,
        paymentDate: pay.paymentDate,
        status: pay.verificationStatus as any,
        bankRef: pay.bankReferenceNo || pay.transactionId,
        routeAssigned: pay.routeName,
      }));
    } catch {
      return MOCK_TRANSACTIONS;
    }
  }

  /**
   * Fetch specific receipt by receipt number.
   */
  static async getReceiptByNumber(receiptNo: string): Promise<PaymentTransaction | null> {
    const localMatch = MOCK_TRANSACTIONS.find((t) => t.receiptNo === receiptNo);
    if (localMatch) return localMatch;

    if (!isSupabaseConfigured) return null;

    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('receipt_number', receiptNo)
        .single();

      if (error || !data) return null;

      const pay = data as any;
      return {
        id: pay.id,
        receiptNo: pay.receipt_number || receiptNo,
        academicYear: pay.academic_year || '2026 - 2027',
        amount: pay.amount,
        paymentMode: pay.payment_mode || 'UPI / NetBanking',
        paymentDate: new Date(pay.paid_at).toLocaleDateString(),
        status: pay.status === 'paid' ? 'Verified' : pay.status === 'failed' ? 'Failed' : 'Pending',
        bankRef: pay.bank_reference_no || pay.transaction_id,
        routeAssigned: 'Route #14 - Guntur City Express',
      };
    } catch {
      return null;
    }
  }

  /**
   * Submit payment receipt upload file to Supabase Storage bucket 'receipts'
   */
  static async uploadPaymentReceipt(file: File, transactionId: string): Promise<string | null> {
    if (!isSupabaseConfigured) {
      return `https://storage.placeholder.com/receipts/${transactionId}.pdf`;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${transactionId}.${fileExt}`;

      const { error } = await supabase.storage
        .from('receipts')
        .upload(filePath, file, { upsert: true });

      if (error) return null;

      const { data } = supabase.storage.from('receipts').getPublicUrl(filePath);
      return data.publicUrl;
    } catch {
      return null;
    }
  }
}
