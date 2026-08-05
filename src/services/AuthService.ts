import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { User, UserRole } from '@/types';

export interface LoginParams {
  identifier: string; // Roll Number (e.g. 221FA04001) or Email (e.g. 221fa04001@vignan.ac.in)
  password?: string;
  role?: UserRole;
}

export interface AuthResponse {
  user: User | null;
  error?: string;
}

export class AuthService {
  /**
   * Resolve user identifier to official VFSTR college email.
   * Roll numbers like '221FA04001' map to '221fa04001@vignan.ac.in'.
   */
  private static resolveEmail(identifier: string): string {
    const trimmed = identifier.trim().toLowerCase();
    if (trimmed.includes('@')) {
      return trimmed;
    }
    return `${trimmed}@vignan.ac.in`;
  }

  /**
   * Authenticate student/admin using Roll Number or College Email + Password
   */
  static async login({ identifier, password = 'password123', role = 'student' }: LoginParams): Promise<AuthResponse> {
    const email = this.resolveEmail(identifier);

    if (!isSupabaseConfigured) {
      const mockUser: User = role === 'admin'
        ? { id: 'adm_1042', name: 'Dr. M. R. K. Murthy', email: 'transport.officer@vignan.ac.in', role: 'admin' }
        : { id: 'usr_04001', name: 'K. S. V. Prasad', email, role: 'student' };
      return { user: mockUser };
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !authData.user) {
        return { user: null, error: authError?.message || 'Invalid Roll Number / Email or password' };
      }

      // Query student or profile table
      const { data: studentRecord } = await supabase
        .from('students')
        .select(`
          id,
          reg_no,
          full_name,
          email,
          avatar_url
        `)
        .eq('user_id', authData.user.id)
        .single();

      if (studentRecord) {
        const studentObj = studentRecord as any;
        return {
          user: {
            id: studentObj.id,
            name: studentObj.full_name,
            email: studentObj.email,
            role: 'student',
            avatarUrl: studentObj.avatar_url || undefined,
          },
        };
      }

      // Admin or Profile fallback
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      const profileObj = profile as any;
      const user: User = {
        id: authData.user.id,
        name: profileObj?.full_name || authData.user.email || 'VFSTR User',
        email: authData.user.email || email,
        role: (profileObj?.role as UserRole) || role,
        avatarUrl: profileObj?.avatar_url || undefined,
      };

      return { user };
    } catch (err: any) {
      return { user: null, error: err?.message || 'Authentication error' };
    }
  }

  /**
   * Fetch current authenticated session user
   */
  static async getCurrentUser(): Promise<User | null> {
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
        name: session.user.email || 'VFSTR User',
        email: session.user.email || '',
        role: 'student',
      };
    } catch {
      return null;
    }
  }

  /**
   * Change / Update User Password (First-login or security update)
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
   * Request Password Reset Link (Future Expansion)
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
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
  }
}
