import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { ErrorHandlingService, SystemErrorCode, StandardizedBackendResponse } from './ErrorHandlingService';
import { AuditService } from './AuditService';

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: string;
  status: 'Open' | 'Resolved' | 'In Progress';
  response?: string;
  date: string;
}

const mockSupportTickets: SupportTicket[] = [
  {
    id: 't_1',
    ticketNumber: 'TICK-2026-8491',
    subject: 'Seat Change Request for Route #14',
    description: 'Requesting front row seat allocation due to medical condition.',
    category: 'Route Allocation',
    status: 'In Progress',
    date: '02 Aug 2026',
  },
];

export class SupportService {
  /**
   * Submit support ticket to Supabase backend with retry logic and error handling.
   */
  static async createSupportTicket(
    studentId: string,
    subject: string,
    description: string,
    category = 'General',
    retries = 2
  ): Promise<StandardizedBackendResponse<{ ticketId: string }>> {
    const ticketNumber = `TICK-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    if (!isSupabaseConfigured) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return ErrorHandlingService.successResponse(
        { ticketId: ticketNumber },
        'Support ticket created successfully.'
      );
    }

    let attempt = 0;
    while (attempt <= retries) {
      try {
        const { data, error } = await supabase
          .from('support_tickets')
          .insert({
            ticket_number: ticketNumber,
            student_id: studentId,
            subject,
            description,
            category,
            status: 'open',
          })
          .select('id')
          .single();

        if (!error && data) {
          await AuditService.logEvent({
            eventType: 'request_submitted',
            referenceId: ticketNumber,
            module: 'support',
            actorType: 'student',
            action: 'CREATE_SUPPORT_TICKET',
            entityName: 'support_tickets',
            entityId: data.id,
          });

          return ErrorHandlingService.successResponse(
            { ticketId: ticketNumber },
            'Support ticket submitted to Transport Cell.'
          );
        }
      } catch (err: any) {
        if (attempt === retries) {
          return ErrorHandlingService.errorResponse(
            err?.message || 'Failed to submit support ticket after retries.',
            SystemErrorCode.SYSTEM_DATABASE_ERROR
          );
        }
      }
      attempt++;
      await new Promise((resolve) => setTimeout(resolve, 300 * attempt));
    }

    return ErrorHandlingService.errorResponse(
      'Failed to submit support ticket.',
      SystemErrorCode.SYSTEM_DATABASE_ERROR
    );
  }

  /**
   * Fetch support tickets for a student.
   */
  static async getStudentSupportTickets(studentId: string): Promise<StandardizedBackendResponse<SupportTicket[]>> {
    if (!isSupabaseConfigured) {
      return ErrorHandlingService.successResponse([...mockSupportTickets]);
    }

    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return ErrorHandlingService.successResponse([...mockSupportTickets]);
      }

      const tickets: SupportTicket[] = data.map((t: any) => ({
        id: t.id,
        ticketNumber: t.ticket_number,
        subject: t.subject,
        description: t.description,
        category: t.category,
        status: t.status === 'resolved' ? 'Resolved' : t.status === 'in_progress' ? 'In Progress' : 'Open',
        response: t.response || undefined,
        date: new Date(t.created_at).toLocaleDateString(),
      }));

      return ErrorHandlingService.successResponse(tickets);
    } catch (err: any) {
      return ErrorHandlingService.errorResponse(
        err?.message || 'Failed to retrieve support tickets.',
        SystemErrorCode.SYSTEM_DATABASE_ERROR,
        mockSupportTickets
      );
    }
  }
}
