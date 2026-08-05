import { StudentProfile, TransportEligibility, TransportEnrollmentStatus } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { VFSTR_STUDENT_SEED } from '@/constants/studentSeedData';

export interface StudentServiceResponse {
  success: boolean;
  data?: StudentProfile;
  error?: string;
}

export class StudentService {
  /**
   * Helper to extract Roll Number from string or user ID.
   * e.g., 'usr_251fa04001' -> '251FA04001'
   */
  private static extractRegNo(regNoOrUserId: string): string {
    const trimmed = regNoOrUserId.trim();
    if (trimmed.startsWith('usr_')) {
      return trimmed.replace('usr_', '').toUpperCase();
    }
    return trimmed.toUpperCase();
  }

  /**
   * Build default initial profile for any student record in the seed dataset
   */
  private static buildSeedProfile(regNo: string): StudentProfile {
    const seed = VFSTR_STUDENT_SEED.find((s) => s.regNo.toUpperCase() === regNo.toUpperCase());
    const studentName = seed?.fullName || `Student (${regNo})`;
    const sectionNum = seed?.section || '1';

    return {
      id: `usr_${regNo.toLowerCase()}`,
      name: studentName,
      email: `${regNo.toLowerCase()}@gmail.com`,
      role: 'student',
      regNo: regNo.toUpperCase(),
      department: 'Computer Science & Engineering (CSE)',
      program: 'B.Tech',
      academicYear: '2026 - 2027',
      semester: 'II Year - I Sem',
      section: `Section ${sectionNum}`,
      phone: '+91 98765 43210',
      emergencyContact: '+91 98765 00000',
      counsellor: 'Department Office',
      eligibility: 'non_transport_user',
      transportStatus: 'not_enrolled',
      pickupPoint: 'Not Selected',
      isTransportUser: false,
      address: 'VFSTR Vadlamudi Campus, Guntur, AP - 522213',
      passStatus: undefined,
    };
  }

  /**
   * Fetch complete student profile details by Register Number or User ID.
   */
  static async getProfile(regNoOrUserId: string): Promise<StudentProfile> {
    const regNo = this.extractRegNo(regNoOrUserId);

    // 1. Check local storage for modified student profile
    const savedLocal = localStorage.getItem(`vfstr_profile_${regNo}`);
    if (savedLocal) {
      try {
        return JSON.parse(savedLocal);
      } catch {}
    }

    if (!isSupabaseConfigured) {
      const defaultProfile = this.buildSeedProfile(regNo);
      return defaultProfile;
    }

    // 2. Supabase Query path
    try {
      const isUuid = regNoOrUserId.includes('-');
      const queryField = isUuid ? 'user_id' : 'reg_no';

      const { data, error } = await supabase
        .from('students')
        .select(`
          id,
          user_id,
          reg_no,
          full_name,
          email,
          academic_year,
          section,
          program,
          semester,
          avatar_url,
          departments (
            name
          ),
          transport_profiles (
            phone,
            emergency_contact,
            emergency_contact_name,
            counsellor,
            address,
            preferred_pickup_point,
            is_transport_user,
            eligibility,
            status
          )
        `)
        .eq(queryField, regNo)
        .single();

      if (error || !data) {
        return this.buildSeedProfile(regNo);
      }

      const s = data as any;
      const deptObj = s.departments;
      const tpObj = Array.isArray(s.transport_profiles) ? s.transport_profiles[0] : s.transport_profiles;

      const eligibility: TransportEligibility = tpObj?.eligibility || (tpObj?.is_transport_user ? 'transport_user' : 'non_transport_user');
      const transportStatus: TransportEnrollmentStatus = tpObj?.status || (tpObj?.is_transport_user ? 'active' : 'not_enrolled');

      return {
        id: s.id,
        name: s.full_name || 'Student',
        email: s.email || `${s.reg_no.toLowerCase()}@gmail.com`,
        role: 'student',
        regNo: s.reg_no,
        department: deptObj?.name || 'Computer Science & Engineering',
        program: s.program || 'B.Tech',
        academicYear: s.academic_year || '2026 - 2027',
        semester: s.semester || 'II Year - I Sem',
        section: s.section ? (s.section.startsWith('Section') ? s.section : `Section ${s.section}`) : 'Section 1',
        phone: tpObj?.phone || '+91 98765 43210',
        emergencyContact: tpObj?.emergency_contact || '+91 98765 00000',
        counsellor: tpObj?.counsellor || 'Department Office',
        eligibility,
        transportStatus,
        pickupPoint: tpObj?.preferred_pickup_point || 'Not Selected',
        isTransportUser: Boolean(tpObj?.is_transport_user),
        address: tpObj?.address || undefined,
        emergencyContactName: tpObj?.emergency_contact_name || undefined,
        avatarUrl: s.avatar_url || undefined,
        passStatus: transportStatus === 'active' ? 'active' : undefined,
      };
    } catch {
      return this.buildSeedProfile(regNo);
    }
  }

  /**
   * Update student academic profile or contact preferences
   */
  static async updateProfile(regNo: string, updates: Partial<StudentProfile>): Promise<boolean> {
    const cleanRegNo = this.extractRegNo(regNo);
    const current = await this.getProfile(cleanRegNo);
    const updated = { ...current, ...updates };

    // Persist to local storage for local offline session
    localStorage.setItem(`vfstr_profile_${cleanRegNo}`, JSON.stringify(updated));

    if (!isSupabaseConfigured) {
      return true;
    }

    try {
      if (updates.avatarUrl !== undefined) {
        await supabase
          .from('students')
          .update({ avatar_url: updates.avatarUrl })
          .eq('reg_no', cleanRegNo);
      }

      const { data: studentRecord } = await supabase
        .from('students')
        .select('id')
        .eq('reg_no', cleanRegNo)
        .single();

      if (!studentRecord) return true;

      await supabase
        .from('transport_profiles')
        .update({
          phone: updates.phone,
          emergency_contact: updates.emergencyContact,
          emergency_contact_name: updates.emergencyContactName,
          address: updates.address,
          preferred_pickup_point: updates.pickupPoint,
          counsellor: updates.counsellor,
          eligibility: updates.eligibility,
          status: updates.transportStatus,
          is_transport_user: updates.isTransportUser,
        })
        .eq('student_id', studentRecord.id);

      return true;
    } catch {
      return true;
    }
  }

  /**
   * Upload profile avatar image to Supabase Storage bucket 'avatars'
   */
  static async uploadAvatar(file: File, studentId: string): Promise<string | null> {
    if (!isSupabaseConfigured) {
      return `https://storage.placeholder.com/avatars/${studentId}.jpg`;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${studentId}.${fileExt}`;

      const { error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (error) return null;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      return data.publicUrl;
    } catch {
      return null;
    }
  }
}
