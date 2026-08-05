export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'student' | 'admin' | 'superadmin';
export type PassStatus = 'pending' | 'approved' | 'rejected' | 'expired' | 'active';
export type RequestType = 'new_pass' | 'renewal' | 'route_change' | 'cancellation';
export type PaymentStatus = 'paid' | 'unpaid' | 'pending_verification' | 'failed' | 'refunded';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type NotificationType = 'pass' | 'route' | 'payment' | 'announcement' | 'system';

export interface Database {
  public: {
    Tables: {
      departments: {
        Row: {
          id: string;
          code: string;
          name: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      students: {
        Row: {
          id: string;
          user_id: string;
          reg_no: string;
          full_name: string;
          email: string;
          department_id: string | null;
          academic_year: string;
          section: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          reg_no: string;
          full_name: string;
          email: string;
          department_id?: string | null;
          academic_year: string;
          section?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          reg_no?: string;
          full_name?: string;
          email?: string;
          department_id?: string | null;
          academic_year?: string;
          section?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      transport_profiles: {
        Row: {
          id: string;
          student_id: string;
          phone: string;
          emergency_contact: string;
          emergency_contact_name: string | null;
          address: string | null;
          preferred_pickup_point: string | null;
          is_transport_user: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          student_id: string;
          phone: string;
          emergency_contact: string;
          emergency_contact_name?: string | null;
          address?: string | null;
          preferred_pickup_point?: string | null;
          is_transport_user?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          student_id?: string;
          phone?: string;
          emergency_contact?: string;
          emergency_contact_name?: string | null;
          address?: string | null;
          preferred_pickup_point?: string | null;
          is_transport_user?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      routes: {
        Row: {
          id: string;
          route_number: string;
          route_name: string;
          assigned_bus_id: string | null;
          total_seats: number;
          occupied_seats: number;
          status: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          route_number: string;
          route_name: string;
          assigned_bus_id?: string | null;
          total_seats?: number;
          occupied_seats?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          route_number?: string;
          route_name?: string;
          assigned_bus_id?: string | null;
          total_seats?: number;
          occupied_seats?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      route_stops: {
        Row: {
          id: string;
          route_id: string;
          stop_name: string;
          pickup_time: string | null;
          drop_time: string | null;
          stop_order: number;
          distance_km: number;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          route_id: string;
          stop_name: string;
          pickup_time?: string | null;
          drop_time?: string | null;
          stop_order: number;
          distance_km?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          route_id?: string;
          stop_name?: string;
          pickup_time?: string | null;
          drop_time?: string | null;
          stop_order?: number;
          distance_km?: number;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      fees: {
        Row: {
          id: string;
          route_id: string | null;
          academic_year: string;
          annual_fee: number;
          term_fee: number;
          due_date: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          route_id?: string | null;
          academic_year: string;
          annual_fee: number;
          term_fee: number;
          due_date: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          route_id?: string | null;
          academic_year?: string;
          annual_fee?: number;
          term_fee?: number;
          due_date?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      bus_passes: {
        Row: {
          id: string;
          pass_number: string;
          student_id: string;
          route_id: string;
          stop_id: string | null;
          pickup_point: string;
          academic_year: string;
          valid_from: string;
          valid_until: string;
          status: PassStatus;
          fee_amount: number;
          payment_status: PaymentStatus;
          authorized_by: string | null;
          qr_code_hash: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          pass_number: string;
          student_id: string;
          route_id: string;
          stop_id?: string | null;
          pickup_point: string;
          academic_year: string;
          valid_from: string;
          valid_until: string;
          status?: PassStatus;
          fee_amount: number;
          payment_status?: PaymentStatus;
          authorized_by?: string | null;
          qr_code_hash?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          pass_number?: string;
          student_id?: string;
          route_id?: string;
          stop_id?: string | null;
          pickup_point?: string;
          academic_year?: string;
          valid_from?: string;
          valid_until?: string;
          status?: PassStatus;
          fee_amount?: number;
          payment_status?: PaymentStatus;
          authorized_by?: string | null;
          qr_code_hash?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      transport_requests: {
        Row: {
          id: string;
          ref_number: string;
          student_id: string;
          request_type: RequestType;
          route_id: string | null;
          stop_id: string | null;
          pickup_point: string;
          status: PassStatus;
          remarks: string | null;
          submitted_at: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          ref_number: string;
          student_id: string;
          request_type: RequestType;
          route_id?: string | null;
          stop_id?: string | null;
          pickup_point: string;
          status?: PassStatus;
          remarks?: string | null;
          submitted_at?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          ref_number?: string;
          student_id?: string;
          request_type?: RequestType;
          route_id?: string | null;
          stop_id?: string | null;
          pickup_point?: string;
          status?: PassStatus;
          remarks?: string | null;
          submitted_at?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      payments: {
        Row: {
          id: string;
          transaction_id: string;
          student_id: string;
          pass_id: string | null;
          request_id: string | null;
          amount: number;
          payment_mode: string;
          receipt_url: string | null;
          status: PaymentStatus;
          bank_reference_no: string | null;
          paid_at: string;
          verified_at: string | null;
          verified_by: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          transaction_id: string;
          student_id: string;
          pass_id?: string | null;
          request_id?: string | null;
          amount: number;
          payment_mode: string;
          receipt_url?: string | null;
          status?: PaymentStatus;
          bank_reference_no?: string | null;
          paid_at?: string;
          verified_at?: string | null;
          verified_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          transaction_id?: string;
          student_id?: string;
          pass_id?: string | null;
          request_id?: string | null;
          amount?: number;
          payment_mode?: string;
          receipt_url?: string | null;
          status?: PaymentStatus;
          bank_reference_no?: string | null;
          paid_at?: string;
          verified_at?: string | null;
          verified_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      notifications: {
        Row: {
          id: string;
          student_id: string | null;
          title: string;
          message: string;
          full_message: string | null;
          notification_type: NotificationType;
          category: string;
          action_url: string | null;
          is_read: boolean;
          is_important: boolean;
          published_at: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          student_id?: string | null;
          title: string;
          message: string;
          full_message?: string | null;
          notification_type?: NotificationType;
          category?: string;
          action_url?: string | null;
          is_read?: boolean;
          is_important?: boolean;
          published_at?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          student_id?: string | null;
          title?: string;
          message?: string;
          full_message?: string | null;
          notification_type?: NotificationType;
          category?: string;
          action_url?: string | null;
          is_read?: boolean;
          is_important?: boolean;
          published_at?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      support_tickets: {
        Row: {
          id: string;
          ticket_number: string;
          student_id: string;
          subject: string;
          description: string;
          category: string;
          status: TicketStatus;
          response: string | null;
          resolved_at: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          ticket_number: string;
          student_id: string;
          subject: string;
          description: string;
          category: string;
          status?: TicketStatus;
          response?: string | null;
          resolved_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          ticket_number?: string;
          student_id?: string;
          subject?: string;
          description?: string;
          category?: string;
          status?: TicketStatus;
          response?: string | null;
          resolved_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          entity_name: string;
          entity_id: string | null;
          old_values: Json | null;
          new_values: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          entity_name: string;
          entity_id?: string | null;
          old_values?: Json | null;
          new_values?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          entity_name?: string;
          entity_id?: string | null;
          old_values?: Json | null;
          new_values?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
    };
  };
}
