import React, { createContext, useState, useCallback, useEffect } from 'react';
import { StudentProfile } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { StudentService } from '@/services/StudentService';

export interface UserContextType {
  studentProfile: StudentProfile;
  updateStudentProfile: (partial: Partial<StudentProfile>) => void;
  refreshStudentProfile: () => Promise<void>;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

const initialStudentProfile: StudentProfile = {
  id: 'usr_251fa04001',
  name: 'AARADHYULA LALITHA LAKSHMI SAMHITHA',
  email: '251fa04001@gmail.com',
  role: 'student',
  regNo: '251FA04001',
  department: 'Computer Science & Engineering',
  program: 'B.Tech',
  academicYear: '2026 - 2027',
  semester: 'II Year - I Sem',
  section: 'Section 1',
  phone: '+91 98765 43210',
  emergencyContact: '+91 98765 00000',
  counsellor: 'Dr.Md. Oqail Ahmed',
  eligibility: 'transport_user',
  transportStatus: 'active',
  pickupPoint: 'Old Bus Stand, Guntur (Route #14)',
  isTransportUser: true,
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [studentProfile, setStudentProfile] = useState<StudentProfile>(initialStudentProfile);

  const loadProfile = useCallback(async () => {
    if (user) {
      if (user.role === 'student') {
        try {
          const profile = await StudentService.getProfile(user.id || user.email);
          setStudentProfile(profile);
        } catch (err) {
          console.error('Failed to load profile for user', err);
        }
      } else {
        setStudentProfile({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          regNo: user.email ? user.email.split('@')[0].toUpperCase() : user.id,
          department:
            user.role === 'faculty'
              ? 'Computer Science & Engineering'
              : user.role === 'driver'
              ? 'Fleet Operations'
              : 'Transport Administration',
          program:
            user.role === 'faculty'
              ? 'Faculty Staff'
              : user.role === 'driver'
              ? 'Commercial Crew'
              : 'University Administration',
          academicYear: '2026 - 2027',
          semester: 'N/A',
          section: 'Staff',
          phone: '+91 98765 43210',
          emergencyContact: '+91 98765 00000',
          counsellor: 'Dean Transport Operations',
          eligibility: 'transport_user',
          transportStatus: 'active',
          pickupPoint: 'VFSTR Campus Terminal',
          isTransportUser: true,
        });
      }
    }
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const updateStudentProfile = useCallback((partial: Partial<StudentProfile>) => {
    setStudentProfile((prev) => {
      const updated = { ...prev, ...partial };
      if (updated.regNo) {
        localStorage.setItem(`vfstr_profile_${updated.regNo}`, JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  return (
    <UserContext.Provider value={{ studentProfile, updateStudentProfile, refreshStudentProfile: loadProfile }}>
      {children}
    </UserContext.Provider>
  );
};

