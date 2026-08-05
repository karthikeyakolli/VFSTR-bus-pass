import { StudentProfile } from '@/types';
import { StudentService } from './StudentService';

const defaultProfile: StudentProfile = {
  id: 'STUDENT-151FA23010',
  name: 'A. SAI ADITYA',
  regNo: '151FA23010',
  email: 'sai.aditya@vignan.ac.in',
  role: 'student',
  department: 'Computer Science & Engineering',
  program: 'B.Tech',
  academicYear: '2026 - 2027',
  semester: 'II Year - I Sem',
  section: 'Section 1',
  phone: '+91 98480 12345',
  emergencyContact: '+91 98480 54321',
  counsellor: 'Dr.Md. Oqail Ahmed',
  eligibility: 'transport_user',
  transportStatus: 'active',
  isTransportUser: true,
  pickupPoint: 'Old Bus Stand, Guntur',
  passStatus: 'active',
};

export class ProfileService {
  /**
   * Fetch current student profile via StudentService
   */
  static async getStudentProfile(regNo: string): Promise<StudentProfile> {
    return StudentService.getProfile(regNo);
  }

  /**
   * Update student profile.
   */
  static async updateStudentProfile(regNo: string, updates: Partial<StudentProfile>): Promise<StudentProfile> {
    await StudentService.updateProfile(regNo, updates);
    return { ...defaultProfile, ...updates, regNo };
  }
}
