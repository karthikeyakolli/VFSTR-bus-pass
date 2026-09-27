import { FacultyProfile } from '@/types';
import { VFSTR_FACULTY_SEED } from '@/constants/facultySeedData';

const FACULTY_STORAGE_KEY = 'vfstr_faculty_profiles';

export class FacultyService {
  /**
   * Initialize faculty profiles in localStorage if not already present
   */
  private static getStoredFaculty(): FacultyProfile[] {
    const data = localStorage.getItem(FACULTY_STORAGE_KEY);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        // Fallback
      }
    }
    localStorage.setItem(FACULTY_STORAGE_KEY, JSON.stringify(VFSTR_FACULTY_SEED));
    return VFSTR_FACULTY_SEED;
  }

  /**
   * Find faculty by employee ID or email
   */
  public static async getFacultyByIdentifier(identifier: string): Promise<FacultyProfile | null> {
    const list = this.getStoredFaculty();
    const cleanId = identifier.trim().toUpperCase();
    const cleanEmail = identifier.trim().toLowerCase();

    const faculty = list.find(
      (f) => f.employeeId.toUpperCase() === cleanId || f.email.toLowerCase() === cleanEmail
    );

    return faculty || null;
  }

  /**
   * Get faculty profile by ID
   */
  public static async getFacultyById(id: string): Promise<FacultyProfile | null> {
    const list = this.getStoredFaculty();
    return list.find((f) => f.id === id) || null;
  }

  /**
   * Toggle payroll deduction option
   */
  public static async togglePayrollDeduction(facultyId: string, enabled: boolean): Promise<boolean> {
    const list = this.getStoredFaculty();
    const index = list.findIndex((f) => f.id === facultyId);
    if (index === -1) return false;

    list[index].payrollDeductionEnabled = enabled;
    localStorage.setItem(FACULTY_STORAGE_KEY, JSON.stringify(list));
    return true;
  }

  /**
   * Update faculty route assignment
   */
  public static async updateAssignedRoute(facultyId: string, routeId: string, stopId: string): Promise<boolean> {
    const list = this.getStoredFaculty();
    const index = list.findIndex((f) => f.id === facultyId);
    if (index === -1) return false;

    list[index].assignedRouteId = routeId;
    list[index].assignedStopId = stopId;
    list[index].passStatus = 'active';
    localStorage.setItem(FACULTY_STORAGE_KEY, JSON.stringify(list));
    return true;
  }
}
