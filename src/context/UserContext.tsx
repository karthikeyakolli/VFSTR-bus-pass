import React, { createContext, useState, useCallback } from 'react';
import { StudentProfile } from '@/types';

export interface UserContextType {
  studentProfile: StudentProfile;
  updateStudentProfile: (partial: Partial<StudentProfile>) => void;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

const initialStudentProfile: StudentProfile = {
  id: 'usr_01',
  name: 'K. S. V. Prasad',
  email: '211fa04001@vignan.ac.in',
  role: 'student',
  regNo: '211FA04001',
  department: 'Computer Science & Engineering',
  academicYear: '4th Year (2023 - 2027)',
  phone: '+91 98765 43210',
  emergencyContact: '+91 98765 00000',
  pickupPoint: 'Old Bus Stand, Guntur (Route #14)',
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [studentProfile, setStudentProfile] = useState<StudentProfile>(initialStudentProfile);

  const updateStudentProfile = useCallback((partial: Partial<StudentProfile>) => {
    setStudentProfile((prev) => ({ ...prev, ...partial }));
  }, []);

  return (
    <UserContext.Provider value={{ studentProfile, updateStudentProfile }}>
      {children}
    </UserContext.Provider>
  );
};
