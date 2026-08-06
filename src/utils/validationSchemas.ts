import { z } from 'zod';

export const passApplicationSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters'),
  rollNumber: z
    .string()
    .min(10, 'Roll number must be 10 characters (e.g. 211FA04001)')
    .max(10, 'Roll number must be 10 characters')
    .regex(/^[0-9]{2}[A-Z]{2,5}[0-9]{3,5}$/i, 'Invalid VFSTR Roll Number format'),
  department: z.string().min(2, 'Department is required'),
  academicYear: z.enum(['1st Year', '2nd Year', '3rd Year', '4th Year', 'PG / Research']),
  routeId: z.string().min(1, 'Please select a bus route'),
  boardingStop: z.string().min(1, 'Please select a boarding stop'),
  emergencyContactName: z.string().min(3, 'Emergency contact name is required'),
  emergencyContactPhone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number'),
  passDurationMonths: z.number().min(1).max(12),
});

export type PassApplicationFormValues = z.infer<typeof passApplicationSchema>;
