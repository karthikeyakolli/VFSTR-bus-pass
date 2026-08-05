import * as XLSX from 'xlsx';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface RawStudentExcelRow {
  'Register Number'?: string;
  'Reg No'?: string;
  'RegNo'?: string;
  'Roll No'?: string;
  'Student Name'?: string;
  'Name'?: string;
  'Section'?: string;
  'Student Mobile'?: string;
  'Student Phone'?: string;
  'Mobile'?: string;
  'Parent Mobile'?: string;
  'Parent Phone'?: string;
  'Emergency Contact'?: string;
  'Counsellor'?: string;
  'Counselor'?: string;
  'Department'?: string;
  'Academic Year'?: string;
}

export interface ValidatedStudentRow {
  regNo: string;
  fullName: string;
  section: string;
  studentPhone: string;
  parentPhone: string;
  counsellor: string;
  email: string;
  tempPassword: string;
  department: string;
  academicYear: string;
  isValid: boolean;
  errors: string[];
}

export interface ImportReport {
  totalRows: number;
  validRowsCount: number;
  insertedCount: number;
  duplicateCount: number;
  failedCount: number;
  successfulRecords: ValidatedStudentRow[];
  duplicates: ValidatedStudentRow[];
  failures: { row: number; regNo?: string; name?: string; errors: string[] }[];
  importedAt: string;
}

export class StudentImportService {
  /**
   * Parse Excel File Buffer or File into raw JSON rows
   */
  static parseExcelFile(file: File): Promise<RawStudentExcelRow[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const json = XLSX.utils.sheet_to_json<RawStudentExcelRow>(worksheet);
          resolve(json);
        } catch {
          reject(new Error('Failed to parse Excel spreadsheet format'));
        }
      };
      reader.onerror = () => reject(new Error('Error reading Excel file'));
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Validate raw excel row, format phone numbers, generate college email & temporary password
   */
  static validateRow(raw: RawStudentExcelRow): ValidatedStudentRow {
    const errors: string[] = [];

    const regNo = (raw['Register Number'] || raw['Reg No'] || raw['RegNo'] || raw['Roll No'] || '').toString().trim().toUpperCase();
    const fullName = (raw['Student Name'] || raw['Name'] || '').toString().trim();
    const section = (raw['Section'] || 'A').toString().trim();
    const studentPhone = (raw['Student Mobile'] || raw['Student Phone'] || raw['Mobile'] || '').toString().trim();
    const parentPhone = (raw['Parent Mobile'] || raw['Parent Phone'] || raw['Emergency Contact'] || '').toString().trim();
    const counsellor = (raw['Counsellor'] || raw['Counselor'] || 'Not Assigned').toString().trim();
    const department = (raw['Department'] || 'Computer Science & Engineering').toString().trim();
    const academicYear = (raw['Academic Year'] || '2026 - 2027').toString().trim();

    if (!regNo) errors.push('Missing Register Number');
    if (!fullName) errors.push('Missing Student Name');
    if (!studentPhone) errors.push('Missing Student Mobile');

    const email = regNo ? `${regNo.toLowerCase()}@vignan.ac.in` : '';
    // Temporary password format: VFSTR@<last_4_digits_regNo_or_1234>
    const lastFourDigits = regNo.length >= 4 ? regNo.slice(-4) : '1234';
    const tempPassword = `VFSTR@${lastFourDigits}`;

    return {
      regNo,
      fullName,
      section,
      studentPhone,
      parentPhone: parentPhone || studentPhone,
      counsellor,
      email,
      tempPassword,
      department,
      academicYear,
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Process complete Excel file import into Supabase with duplicate detection
   */
  static async importStudents(file: File): Promise<ImportReport> {
    const rawRows = await this.parseExcelFile(file);
    const report: ImportReport = {
      totalRows: rawRows.length,
      validRowsCount: 0,
      insertedCount: 0,
      duplicateCount: 0,
      failedCount: 0,
      successfulRecords: [],
      duplicates: [],
      failures: [],
      importedAt: new Date().toISOString(),
    };

    const validatedRows: ValidatedStudentRow[] = rawRows.map((row) => this.validateRow(row));

    // Filter invalid row data
    validatedRows.forEach((row, idx) => {
      if (!row.isValid) {
        report.failedCount++;
        report.failures.push({
          row: idx + 1,
          regNo: row.regNo,
          name: row.fullName,
          errors: row.errors,
        });
      }
    });

    const validRows = validatedRows.filter((r) => r.isValid);
    report.validRowsCount = validRows.length;

    if (!isSupabaseConfigured) {
      // Mock execution mode
      validRows.forEach((row) => {
        report.insertedCount++;
        report.successfulRecords.push(row);
      });
      return report;
    }

    // Fetch existing register numbers to prevent duplicates
    const { data: existingStudents } = await supabase.from('students').select('reg_no');
    const existingRegNos = new Set((existingStudents || []).map((s: any) => s.reg_no.toUpperCase()));

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];

      if (existingRegNos.has(row.regNo)) {
        report.duplicateCount++;
        report.duplicates.push(row);
        continue;
      }

      try {
        // 1. Create Auth User
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: row.email,
          password: row.tempPassword,
          options: {
            data: {
              full_name: row.fullName,
              reg_no: row.regNo,
            },
          },
        });

        if (authError || !authData.user) {
          report.failedCount++;
          report.failures.push({
            row: i + 1,
            regNo: row.regNo,
            name: row.fullName,
            errors: [authError?.message || 'Auth account creation failed'],
          });
          continue;
        }

        const userId = authData.user.id;

        // 2. Insert Student Record (is_transport_user = false default)
        const { data: studentRecord, error: studentError } = await supabase
          .from('students')
          .insert({
            user_id: userId,
            reg_no: row.regNo,
            full_name: row.fullName,
            email: row.email,
            academic_year: row.academicYear,
            section: row.section,
          })
          .select('id')
          .single();

        if (studentError || !studentRecord) {
          report.failedCount++;
          report.failures.push({
            row: i + 1,
            regNo: row.regNo,
            name: row.fullName,
            errors: [studentError?.message || 'Database record insertion failed'],
          });
          continue;
        }

        // 3. Insert Transport Profile Record
        await supabase.from('transport_profiles').insert({
          student_id: studentRecord.id,
          phone: row.studentPhone,
          emergency_contact: row.parentPhone,
          emergency_contact_name: row.counsellor ? `Counsellor: ${row.counsellor}` : null,
          is_transport_user: false,
        });

        existingRegNos.add(row.regNo);
        report.insertedCount++;
        report.successfulRecords.push(row);
      } catch (err: any) {
        report.failedCount++;
        report.failures.push({
          row: i + 1,
          regNo: row.regNo,
          name: row.fullName,
          errors: [err?.message || 'Unexpected import error'],
        });
      }
    }

    return report;
  }
}
