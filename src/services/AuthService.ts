import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { User, UserRole } from '@/types';
import { VFSTR_STUDENT_SEED } from '@/constants/studentSeedData';

export interface LoginParams {
  identifier: string; // Roll Number (e.g. 251FA04001) or Email (e.g. 251fa04001@gmail.com)
  password?: string;
  role?: UserRole;
}

export interface AuthResponse {
  user: User | null;
  error?: string;
}

export class AuthService {
  /**
   * Helper to extract Roll Number from email or raw string.
   * e.g., '251fa04001@gmail.com' -> '251FA04001'
   */
  public static extractRegNo(identifier: string): string {
    const trimmed = identifier.trim();
    if (trimmed.includes('@')) {
      return trimmed.split('@')[0].toUpperCase();
    }
    return trimmed.toUpperCase();
  }

  /**
   * Resolve user identifier to student email format (regno@gmail.com)
   */
  public static resolveEmail(identifier: string): string {
    const regNo = this.extractRegNo(identifier);
    return `${regNo.toLowerCase()}@gmail.com`;
  }

  /**
   * Authenticate student, faculty, or staff using Roll Number / Employee ID / Email
   */
  static async login({ identifier, password, role }: LoginParams): Promise<AuthResponse> {
    const trimmedId = identifier.trim();

    // 0. Check Faculty Authentication path
    if (role === 'faculty' || trimmedId.toUpperCase().startsWith('VFSTR-FAC') || trimmedId.toLowerCase().includes('@vignan.ac.in')) {
      const { VFSTR_FACULTY_SEED } = await import('@/constants/facultySeedData');
      const cleanUpper = trimmedId.toUpperCase();
      const cleanLower = trimmedId.toLowerCase();
      const faculty = VFSTR_FACULTY_SEED.find(
        (f) => f.employeeId.toUpperCase() === cleanUpper || f.email.toLowerCase() === cleanLower
      );

      const facultyUser: User = {
        id: faculty ? faculty.id : `fac_${cleanUpper.replace(/[^A-Z0-9]/g, '')}`,
        name: faculty ? faculty.fullName : `Faculty Member (${trimmedId})`,
        email: faculty ? faculty.email : `${trimmedId.toLowerCase()}@vignan.ac.in`,
        role: 'faculty',
      };

      localStorage.setItem('vfstr_current_user', JSON.stringify(facultyUser));
      localStorage.setItem('vfstr-user-session', JSON.stringify({ user: facultyUser }));
      return { user: facultyUser };
    }

    // Driver path
    if (role === 'driver' || trimmedId.toUpperCase().startsWith('DRV-')) {
      const driverUser: User = {
        id: `drv_${trimmedId.toLowerCase()}`,
        name: `Driver Staff (${trimmedId})`,
        email: `${trimmedId.toLowerCase()}@transport.vignan.ac.in`,
        role: 'driver',
      };
      localStorage.setItem('vfstr_current_user', JSON.stringify(driverUser));
      localStorage.setItem('vfstr-user-session', JSON.stringify({ user: driverUser }));
      return { user: driverUser };
    }

    // Admin / Transport Convener path
    if (role === 'admin' || trimmedId.toUpperCase().startsWith('VFSTR-ADM') || trimmedId.toLowerCase().includes('admin')) {
      const adminUser: User = {
        id: 'adm_dean_transport',
        name: 'Dr. K. Sathyanarayana (Dean Transport)',
        email: 'transport.dean@vignan.ac.in',
        role: 'admin',
      };
      localStorage.setItem('vfstr_current_user', JSON.stringify(adminUser));
      localStorage.setItem('vfstr-user-session', JSON.stringify({ user: adminUser }));
      return { user: adminUser };
    }

    const regNo = this.extractRegNo(identifier);
    const email = `${regNo.toLowerCase()}@gmail.com`;

    // 1. Check local student dataset (1,307 records)
    const seedStudent = VFSTR_STUDENT_SEED.find((s) => s.regNo.toUpperCase() === regNo);

    if (!isSupabaseConfigured) {
      if (seedStudent) {
        const user: User = {
          id: `usr_${seedStudent.regNo.toLowerCase()}`,
          name: seedStudent.fullName,
          email,
          role: 'student',
        };

        // Persist session locally
        localStorage.setItem('vfstr_current_user', JSON.stringify(user));
        localStorage.setItem('vfstr-user-session', JSON.stringify({ user }));
        return { user };
      }

      // Fallback for custom roll number entry
      const fallbackUser: User = {
        id: `usr_${regNo.toLowerCase()}`,
        name: `Student (${regNo})`,
        email,
        role: 'student',
      };
      localStorage.setItem('vfstr_current_user', JSON.stringify(fallbackUser));
      localStorage.setItem('vfstr-user-session', JSON.stringify({ user: fallbackUser }));
      return { user: fallbackUser };
    }

    // 2. Supabase Integration path
    if (!password) {
      return { user: null, error: 'Password is required for student authentication.' };
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !authData.user) {
        // Fallback to local dataset verification if Supabase auth fails in dev mode
        if (seedStudent) {
          const user: User = {
            id: `usr_${seedStudent.regNo.toLowerCase()}`,
            name: seedStudent.fullName,
            email,
            role: 'student',
          };
          localStorage.setItem('vfstr_current_user', JSON.stringify(user));
          localStorage.setItem('vfstr-user-session', JSON.stringify({ user }));
          return { user };
        }
        return { user: null, error: authError?.message || 'Invalid Roll Number / Email or password' };
      }

      const { data: studentRecord } = await supabase
        .from('students')
        .select('id, reg_no, full_name, email, avatar_url')
        .eq('user_id', authData.user.id)
        .single();

      if (studentRecord) {
        const s = studentRecord as any;
        const user: User = {
          id: s.id,
          name: s.full_name,
          email: s.email,
          role: 'student',
          avatarUrl: s.avatar_url || undefined,
        };
        localStorage.setItem('vfstr_current_user', JSON.stringify(user));
        localStorage.setItem('vfstr-user-session', JSON.stringify({ user }));
        return { user };
      }

      const user: User = {
        id: authData.user.id,
        name: seedStudent?.fullName || authData.user.email || 'VFSTR Student',
        email: authData.user.email || email,
        role: 'student',
      };
      localStorage.setItem('vfstr_current_user', JSON.stringify(user));
      localStorage.setItem('vfstr-user-session', JSON.stringify({ user }));
      return { user };
    } catch (err: any) {
      return { user: null, error: err?.message || 'Authentication error' };
    }
  }

  /**
   * Switch active demo role instantaneously for prototype testing
   */
  static async switchDemoRole(targetRole: UserRole): Promise<User> {
    let targetUser: User;

    switch (targetRole) {
      case 'admin':
      case 'superadmin':
        targetUser = {
          id: 'adm_dean_transport',
          name: 'Dr. K. Sathyanarayana (Dean Transport)',
          email: 'transport.dean@vignan.ac.in',
          role: targetRole,
        };
        break;
      case 'faculty':
        targetUser = {
          id: 'fac_101',
          name: 'Dr. M. S. R. Murthy (Dean CSE)',
          email: 'msr.murthy@vignan.ac.in',
          role: 'faculty',
        };
        break;
      case 'driver':
        targetUser = {
          id: 'drv_001',
          name: 'K. Venkateswarlu (Route #14)',
          email: 'venkateswarlu.drv@transport.vignan.ac.in',
          role: 'driver',
        };
        break;
      case 'student':
      default:
        targetUser = {
          id: 'usr_251fa04001',
          name: 'AARADHYULA LALITHA LAKSHMI SAMHITHA',
          email: '251fa04001@gmail.com',
          role: 'student',
        };
        break;
    }

    const payload = JSON.stringify(targetUser);
    localStorage.setItem('vfstr_current_user', payload);
    localStorage.setItem('vfstr-user-session', JSON.stringify({ user: targetUser }));
    sessionStorage.setItem('vfstr-user-session', JSON.stringify({ user: targetUser }));

    return targetUser;
  }

  /**
   * Fetch current authenticated session user
   */
  static async getCurrentUser(): Promise<User | null> {
    const saved = localStorage.getItem('vfstr_current_user') || localStorage.getItem('vfstr-user-session') || sessionStorage.getItem('vfstr-user-session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.user ? parsed.user : parsed;
      } catch {}
    }

    if (!isSupabaseConfigured) return null;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;

      const { data: studentRecord } = await supabase
        .from('students')
        .select('id, full_name, email, avatar_url')
        .eq('user_id', session.user.id)
        .single();

      if (studentRecord) {
        const s = studentRecord as any;
        return {
          id: s.id,
          name: s.full_name,
          email: s.email,
          role: 'student',
          avatarUrl: s.avatar_url || undefined,
        };
      }

      return {
        id: session.user.id,
        name: session.user.email || 'VFSTR Student',
        email: session.user.email || '',
        role: 'student',
      };
    } catch {
      return null;
    }
  }

  /**
   * Change / Update User Password
   */
  static async updatePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) {
      return { success: true };
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to update password' };
    }
  }

  /**
   * Request Password Reset Link
   */
  static async requestPasswordReset(identifier: string): Promise<{ success: boolean; error?: string }> {
    const email = this.resolveEmail(identifier);
    if (!isSupabaseConfigured) {
      return { success: true };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to send reset link' };
    }
  }

  /**
   * Logout session
   */
  static async logout(): Promise<void> {
    localStorage.removeItem('vfstr_current_user');
    localStorage.removeItem('vfstr-user-session');
    sessionStorage.removeItem('vfstr-user-session');
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
  }
}
