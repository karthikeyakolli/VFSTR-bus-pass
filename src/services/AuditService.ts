import { SystemAuditEventType, AuditActorType, SystemAuditRecord } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export class AuditService {
  /**
   * Log critical system event to public.audit_logs database table.
   */
  static async logEvent(params: {
    eventType: SystemAuditEventType;
    referenceId: string;
    module: string;
    actorType: AuditActorType;
    action: string;
    entityName: string;
    entityId?: string;
    userId?: string;
    adminId?: string;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    ipAddress?: string;
  }): Promise<boolean> {
    if (!isSupabaseConfigured) {
      return true;
    }

    try {
      const { error } = await supabase.from('audit_logs').insert({
        event_type: params.eventType,
        reference_id: params.referenceId,
        module: params.module,
        actor_type: params.actorType,
        user_id: params.userId || null,
        admin_id: params.adminId || null,
        action: params.action,
        entity_name: params.entityName,
        entity_id: params.entityId || null,
        old_values: params.oldValues || null,
        new_values: params.newValues || null,
        ip_address: params.ipAddress || null,
        created_at: new Date().toISOString(),
      });

      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Retrieve audit logs for administrative traceability.
   */
  static async getAuditLogs(moduleFilter?: string): Promise<SystemAuditRecord[]> {
    if (!isSupabaseConfigured) {
      return [
        {
          id: 'audit_1',
          timestamp: new Date().toLocaleDateString(),
          eventType: 'student_imported',
          referenceId: 'IMP-2026-CSE',
          module: 'student_import',
          actorType: 'service_role',
          action: 'BULK_IMPORT_STUDENTS',
          entityName: 'students',
        },
      ];
    }

    try {
      let query = supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
      if (moduleFilter) {
        query = query.eq('module', moduleFilter);
      }

      const { data, error } = await query;
      if (error || !data) return [];

      return data.map((log: any) => ({
        id: log.id,
        timestamp: new Date(log.created_at).toLocaleString(),
        eventType: log.event_type as SystemAuditEventType,
        referenceId: log.reference_id || log.id,
        module: log.module || 'system',
        actorType: log.actor_type as AuditActorType,
        userId: log.user_id || undefined,
        adminId: log.admin_id || undefined,
        action: log.action,
        entityName: log.entity_name,
        entityId: log.entity_id || undefined,
        oldValues: log.old_values || undefined,
        newValues: log.new_values || undefined,
        ipAddress: log.ip_address || undefined,
      }));
    } catch {
      return [];
    }
  }
}
