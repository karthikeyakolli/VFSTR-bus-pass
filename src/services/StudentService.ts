import { StudentProfile, TransportEligibility, TransportEnrollmentStatus } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface StudentServiceResponse {
  success: boolean;
  data?: StudentProfile;
  error?: string;
}

const mockStudentProfile: StudentProfile = {
  id: 'usr_04001',
  name: 'K. S. V. Prasad',
  email: '221fa04001@vignan.ac.in',
  role: 'student',
  regNo: '221FA04001',
  department: 'Computer Science & Engineering (CSE)',
  program: 'B.Tech',
  academicYear: '2026 - 2027',
  semester: 'II Year - I Sem',
  section: 'Section 1',
  phone: '+91 98765 43210',
  emergencyContact: '+91 98765 00000',
  counsellor: 'Dr.Md. Oqail Ahmed',
  eligibility: 'transport_user',
  transportStatus: 'active',
  pickupPoint: 'Old Bus Stand, Guntur',
  isTransportUser: true,
  address: 'D.No 12-4-5, Brodipet 4th Line, Guntur, AP - 522002',
  emergencyContactName: 'K. Ramarao (Father)',
  passStatus: 'active',
  avatarUrl: undefined,
};

export class StudentService {
  /**
   * Fetch complete student profile details by Register Number or User ID.
   */
  static async getProfile(regNoOrUserId: string): Promise<StudentProfile> {
    if (!isSupabaseConfigured) {
      await new Promise((resolve) => setTimeout(resolve, 150));
      return { ...mockStudentProfile };
    }

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
        .eq(queryField, regNoOrUserId)
        .single();

      if (error || !data) {
        return mockStudentProfile;
      }

      const s = data as any;
      const deptObj = s.departments;
      const tpObj = Array.isArray(s.transport_profiles) ? s.transport_profiles[0] : s.transport_profiles;

      const eligibility: TransportEligibility = tpObj?.eligibility || (tpObj?.is_transport_user ? 'transport_user' : 'non_transport_user');
      const transportStatus: TransportEnrollmentStatus = tpObj?.status || (tpObj?.is_transport_user ? 'active' : 'not_enrolled');

      return {
        id: s.id,
        name: s.full_name || 'Student',
        email: s.email || `${s.reg_no.toLowerCase()}@vignan.ac.in`,
        role: 'student',
        regNo: s.reg_no,
        department: deptObj?.name || 'Computer Science & Engineering',
        program: s.program || 'B.Tech',
        academicYear: s.academic_year || '2026 - 2027',
        semester: s.semester || 'II Year - I Sem',
        section: s.section || '1',
        phone: tpObj?.phone || '+91 98765 43210',
        emergencyContact: tpObj?.emergency_contact || '+91 98765 00000',
        counsellor: tpObj?.counsellor || 'Dr.Md. Oqail Ahmed',
        eligibility,
        transportStatus,
        pickupPoint: tpObj?.preferred_pickup_point || '',
        isTransportUser: Boolean(tpObj?.is_transport_user),
        address: tpObj?.address || undefined,
        emergencyContactName: tpObj?.emergency_contact_name || undefined,
        avatarUrl: s.avatar_url || undefined,
        passStatus: transportStatus === 'active' ? 'active' : 'pending',
      };
    } catch {
      return mockStudentProfile;
    }
  }

  /**
   * Update student academic profile or contact preferences without mutating Auth identity records.
   */
  static async updateProfile(regNo: string, updates: Partial<StudentProfile>): Promise<boolean> {
    if (!isSupabaseConfigured) {
      return true;
    }

    try {
      // 1. Update Student entity fields (avatar_url, etc.)
      if (updates.avatarUrl !== undefined) {
        await supabase
          .from('students')
          .update({ avatar_url: updates.avatarUrl })
          .eq('reg_no', regNo);
      }

      // 2. Update Transport Profile details
      const { data: studentRecord } = await supabase
        .from('students')
        .select('id')
        .eq('reg_no', regNo)
        .single();

      if (!studentRecord) return false;

      const { error: tpError } = await supabase
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

      return !tpError;
    } catch {
      return false;
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
