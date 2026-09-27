import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Badge } from '@/components/ui/Badge';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Alert, AlertTitle } from '@/components/ui/Alert';
import { useUser } from '@/hooks/useUser';
import { useToast } from '@/hooks/useToast';
import { RequestService } from '@/services/RequestService';
import { BusSeatMap } from '@/features/booking/components/BusSeatMap';
import {
  User,
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  Bus,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Save,
  Send,
  UploadCloud,
  FileCheck,
  Building,
  Calendar,
  Sparkles,
  Clock,
  Edit2,
  AlertTriangle,
  RotateCcw,
  Check,
  QrCode,
  Armchair,
} from 'lucide-react';
import { UpiPaymentModal } from '@/components/payment/UpiPaymentModal';

const applicationSchema = z.object({
  // Step 1: Personal Details
  name: z.string().min(2, 'Full Name is required'),
  regNo: z.string().min(3, 'Registration Roll Number is required'),
  department: z.string().min(1, 'Department selection is required'),
  academicYear: z.string().min(1, 'Academic Year selection is required'),
  gender: z.string().min(1, 'Gender selection is required'),
  phone: z.string().min(10, 'Valid 10-digit phone number required'),
  email: z.string().email('Valid email address is required'),
  emergencyContact: z.string().min(10, 'Emergency contact is required'),

  // Step 2: Transport Information
  residentialArea: z.string().min(2, 'Residential City/Area is required'),
  boardingPoint: z.string().min(1, 'Preferred Boarding Point selection is required'),
  landmark: z.string().min(2, 'Nearest Landmark is required'),
  preferredShift: z.string().min(1, 'Preferred departure shift is required'),

  // Step 3: Seat Selection
  allocatedSeat: z.string().min(1, 'Please select your bus seat or general transit pass before proceeding'),

  // Step 4: Declaration
  declaration: z.boolean().refine((val) => val === true, {
    message: 'You must accept the transport rules declaration before submitting',
  }),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

export const ApplyPassPage: React.FC = () => {
  const { studentProfile, updateStudentProfile } = useUser();
  const toast = useToast();

  const draftStorageKey = `vfstr-buspass-draft-${studentProfile.regNo}`;

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationRef, setApplicationRef] = useState<string | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);

  // Seat allocation state (1 person = 1 seat)
  const [selectedSeat, setSelectedSeat] = useState<string>('Seat #17');

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      name: studentProfile.name,
      regNo: studentProfile.regNo,
      department: studentProfile.department,
      academicYear: studentProfile.academicYear,
      gender: 'Male',
      phone: studentProfile.phone,
      email: studentProfile.email,
      emergencyContact: studentProfile.emergencyContact,
      residentialArea: 'Guntur City',
      boardingPoint: 'Old Bus Stand, Guntur',
      landmark: 'Near Municipal High School',
      preferredShift: 'Morning 07:10 AM / Return 05:15 PM',
      allocatedSeat: 'Seat #17',
      declaration: false,
    },
  });

  const formValues = watch();

  // Check for saved draft in localStorage
  useEffect(() => {
    const savedDraft = localStorage.getItem(draftStorageKey);
    if (savedDraft) {
      setHasSavedDraft(true);
    }
  }, [draftStorageKey]);

  const handleRestoreDraft = () => {
    const savedDraft = localStorage.getItem(draftStorageKey);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        reset(parsed);
        if (parsed.allocatedSeat) {
          setSelectedSeat(parsed.allocatedSeat);
        }
        toast.success('Draft Restored', 'Your previously saved application progress has been restored.');
      } catch {
        toast.error('Draft Error', 'Could not restore draft data.');
      }
    }
  };

  const handleSaveDraft = () => {
    localStorage.setItem(draftStorageKey, JSON.stringify(formValues));
    setHasSavedDraft(true);
    toast.info('Progress Saved', 'Your application draft has been saved locally. You can resume anytime.');
  };

  const validateCurrentStep = async (step: number): Promise<boolean> => {
    setStepError(null);
    if (step === 1) {
      const isValid = await trigger([
        'name',
        'regNo',
        'department',
        'academicYear',
        'gender',
        'phone',
        'email',
        'emergencyContact',
      ]);
      if (!isValid) {
        setStepError('Please complete all required student personal fields in Step 1.');
        return false;
      }
      return true;
    } else if (step === 2) {
      const isValid = await trigger(['residentialArea', 'boardingPoint', 'landmark', 'preferredShift']);
      if (!isValid) {
        setStepError('Please select your preferred boarding point and route in Step 2.');
        return false;
      }
      return true;
    } else if (step === 3) {
      if (!selectedSeat) {
        setStepError('Please select exactly 1 seat or choose a general transit pass to continue.');
        return false;
      }
      setValue('allocatedSeat', selectedSeat);
      return true;
    }
    return true;
  };

  const handleNextStep = async () => {
    const isValid = await validateCurrentStep(currentStep);
    if (isValid) {
      setCompletedSteps((prev) => Array.from(new Set([...prev, currentStep])));
      if (currentStep < 4) {
        setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3 | 4 | 5);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handlePrevStep = () => {
    setStepError(null);
    if (currentStep > 1 && currentStep <= 4) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3 | 4 | 5);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleJumpToStep = async (targetStep: 1 | 2 | 3 | 4) => {
    if (targetStep === currentStep) return;
    if (targetStep < currentStep || completedSteps.includes(targetStep)) {
      setStepError(null);
      setCurrentStep(targetStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const isValid = await validateCurrentStep(currentStep);
      if (isValid) {
        setCompletedSteps((prev) => Array.from(new Set([...prev, currentStep])));
        setCurrentStep(targetStep);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  // Called when user selects a seat inside BusSeatMap in Step 3
  const handleSeatSelected = (booking: {
    category: 'seat' | 'standing';
    seatNumbers?: number[];
    isGeneralBooking?: boolean;
  }) => {
    if (booking.isGeneralBooking) {
      const label = 'General Transit Pass';
      setSelectedSeat(label);
      setValue('allocatedSeat', label);
      toast.success('Pass Selected', 'General Transit Pass (Standing/Relief Shuttle) selected.');
    } else if (booking.seatNumbers && booking.seatNumbers.length > 0) {
      const singleSeatNum = booking.seatNumbers[0];
      const label = `Seat #${singleSeatNum}`;
      setSelectedSeat(label);
      setValue('allocatedSeat', label);
      toast.success('Seat Selected', `Seat #${singleSeatNum} reserved exclusively for you.`);
    }
  };

  const onSubmit = async (data: ApplicationFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await RequestService.createTransportRequest({
        studentId: studentProfile.regNo,
        requestType: 'new_enrollment',
        reason: `Annual Bus Transport Application AY 2026-27 (${data.allocatedSeat})`,
        pickupPoint: data.boardingPoint,
      });

      const ref = res.refNumber;
      setApplicationRef(ref);
      setCompletedSteps([1, 2, 3, 4, 5]);
      setCurrentStep(5);

      // Cleanly update profile state via context
      updateStudentProfile({
        isTransportUser: true,
        transportStatus: 'active',
        pickupPoint: data.boardingPoint,
        seatNumber: data.allocatedSeat,
      });

      localStorage.removeItem(draftStorageKey);
      toast.success(
        'Application Submitted',
        `Reference ${ref} registered with ${data.allocatedSeat} reserved. Digital pass generated.`
      );
    } catch {
      toast.error('Submission Failed', 'An error occurred while submitting your transport application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: 'Personal Info', subtitle: 'Student profile' },
    { number: 2, title: 'Route & Stop', subtitle: 'Pickup location' },
    { number: 3, title: 'Seat Selection', subtitle: 'Pick your 1 seat' },
    { number: 4, title: 'Review & Verify', subtitle: 'Declaration' },
    { number: 5, title: 'Confirmation', subtitle: 'Pass credential' },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-page">
      {/* Section Header with Save Draft and Restore Actions */}
      <SectionHeader
        title="Bus Pass Application Wizard"
        subtitle="Guided annual transport pass registration for VFSTR Vadlamudi Campus"
        badge={<Badge variant="secondary">AY 2026-2027</Badge>}
        actions={
          currentStep < 5 ? (
            <div className="flex items-center gap-2">
              {hasSavedDraft && (
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
                  onClick={handleRestoreDraft}
                >
                  Restore Draft
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Save className="h-3.5 w-3.5" />}
                onClick={handleSaveDraft}
              >
                Save Draft
              </Button>
            </div>
          ) : undefined
        }
      />

      {/* Stepper Progress Wizard Header (5 Steps) */}
      <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {steps.map((s) => {
            const isCurrent = currentStep === s.number;
            const isCompleted = completedSteps.includes(s.number) || currentStep > s.number;
            const canClick = s.number < currentStep || completedSteps.includes(s.number);

            return (
              <button
                type="button"
                key={s.number}
                disabled={!canClick && currentStep !== s.number}
                onClick={() => canClick && handleJumpToStep(s.number as 1 | 2 | 3 | 4)}
                className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/20'
                    : isCompleted
                    ? 'border-emerald-500/30 bg-emerald-50/10 text-emerald-600 dark:text-emerald-400 hover:border-emerald-500/50'
                    : 'border-border/60 bg-muted/20 text-muted-foreground opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Step 0{s.number}</span>
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : isCurrent ? (
                    <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
                  ) : null}
                </div>

                <div className="mt-2">
                  <span className="text-xs font-bold text-foreground block truncate">{s.title}</span>
                  <span className="text-[10px] text-muted-foreground block truncate">{s.subtitle}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Validation Error Alert */}
      {stepError && (
        <Alert variant="destructive" className="py-2.5">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <AlertTitle className="text-xs font-bold">{stepError}</AlertTitle>
        </Alert>
      )}

      {/* Main Wizard Form Container */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="border-2 border-border shadow-md overflow-hidden bg-card">
          {/* STEP 1: Personal Details */}
          {currentStep === 1 && (
            <CardContent className="p-6 space-y-5">
              <div className="border-b border-border/60 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" /> Step 1: Student Personal Details
                  </h3>
                  <p className="text-xs text-muted-foreground">Verify your official university student record details</p>
                </div>
                <Badge variant="outline">1 of 4 Steps</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name of Student"
                  leftIcon={<User className="h-4 w-4 text-muted-foreground" />}
                  error={errors.name?.message}
                  {...register('name')}
                />

                <Input
                  label="Registration Roll Number"
                  leftIcon={<GraduationCap className="h-4 w-4 text-muted-foreground" />}
                  error={errors.regNo?.message}
                  {...register('regNo')}
                />

                <Select
                  label="Academic Department"
                  options={[
                    { value: 'Computer Science & Engineering', label: 'Computer Science & Engineering (CSE)' },
                    { value: 'Electronics & Communication', label: 'Electronics & Communication (ECE)' },
                    { value: 'Mechanical Engineering', label: 'Mechanical Engineering (ME)' },
                    { value: 'Civil Engineering', label: 'Civil Engineering (CE)' },
                    { value: 'Information Technology', label: 'Information Technology (IT)' },
                  ]}
                  error={errors.department?.message}
                  {...register('department')}
                />

                <Select
                  label="Academic Year of Study"
                  options={[
                    { value: '1st Year (2026 - 2030)', label: '1st Year (2026 - 2030)' },
                    { value: '2nd Year (2025 - 2029)', label: '2nd Year (2025 - 2029)' },
                    { value: '3rd Year (2024 - 2028)', label: '3rd Year (2024 - 2028)' },
                    { value: '4th Year (2023 - 2027)', label: '4th Year (2023 - 2027)' },
                  ]}
                  error={errors.academicYear?.message}
                  {...register('academicYear')}
                />

                <Select
                  label="Gender"
                  options={[
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                    { value: 'Other', label: 'Other' },
                  ]}
                  error={errors.gender?.message}
                  {...register('gender')}
                />

                <Input
                  label="Mobile Phone Number"
                  leftIcon={<Phone className="h-4 w-4 text-muted-foreground" />}
                  error={errors.phone?.message}
                  {...register('phone')}
                />

                <Input
                  label="Institutional Email"
                  leftIcon={<Mail className="h-4 w-4 text-muted-foreground" />}
                  error={errors.email?.message}
                  {...register('email')}
                />

                <Input
                  label="Emergency Contact Phone"
                  leftIcon={<Phone className="h-4 w-4 text-muted-foreground" />}
                  error={errors.emergencyContact?.message}
                  {...register('emergencyContact')}
                />
              </div>
            </CardContent>
          )}

          {/* STEP 2: Transport Information */}
          {currentStep === 2 && (
            <CardContent className="p-6 space-y-5">
              <div className="border-b border-border/60 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Bus className="h-5 w-5 text-primary" /> Step 2: Transport & Pickup Route Selection
                  </h3>
                  <p className="text-xs text-muted-foreground">Select your daily boarding point and preferred route schedule</p>
                </div>
                <Badge variant="outline">2 of 4 Steps</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Residential City / Area"
                  placeholder="e.g. Guntur City, Vijayawada, Tenali"
                  leftIcon={<MapPin className="h-4 w-4 text-muted-foreground" />}
                  error={errors.residentialArea?.message}
                  {...register('residentialArea')}
                />

                <Select
                  label="Preferred Boarding Point"
                  options={[
                    { value: 'Old Bus Stand, Guntur', label: 'Route #14 - Old Bus Stand, Guntur (07:10 AM)' },
                    { value: 'Collectorate Junction, Guntur', label: 'Route #14 - Collectorate Junction (07:18 AM)' },
                    { value: 'NTR Bus Station, Vijayawada', label: 'Route #08 - NTR Bus Station, VJA (06:50 AM)' },
                    { value: 'Tenali Railway Station Stop', label: 'Route #04 - Tenali Station Stop (07:20 AM)' },
                    { value: 'Ponnur Main Road Stop', label: 'Route #02 - Ponnur Main Road (07:25 AM)' },
                  ]}
                  error={errors.boardingPoint?.message}
                  {...register('boardingPoint')}
                />

                <Input
                  label="Nearest Landmark"
                  placeholder="e.g. Near Municipal High School"
                  leftIcon={<Building className="h-4 w-4 text-muted-foreground" />}
                  error={errors.landmark?.message}
                  {...register('landmark')}
                />

                <Select
                  label="Preferred Departure Shift"
                  options={[
                    { value: 'Morning 07:10 AM / Return 05:15 PM', label: 'Standard Shift (Morning 07:10 AM / Evening 05:15 PM)' },
                    { value: 'Extended Shift (Evening 06:30 PM)', label: 'Extended Shift (Lab & Library Scholars - 06:30 PM)' },
                  ]}
                  error={errors.preferredShift?.message}
                  {...register('preferredShift')}
                />

                {/* Information Callout for Next Step */}
                <div className="sm:col-span-2 p-3.5 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                      <Armchair className="h-4 w-4 text-primary" /> Integrated Seat Selection in Next Step
                    </span>
                    <p className="text-[11px] text-muted-foreground">
                      In Step 3, you will choose your dedicated 1 reserved seat on this route's bus for AY 2026-27.
                    </p>
                  </div>
                  <Badge variant="outline" className="text-primary font-mono text-[10px]">
                    1 Seat / Student
                  </Badge>
                </div>
              </div>

              {/* Photo Upload Box */}
              <div className="p-4 border-2 border-dashed border-border rounded-xl bg-muted/20 text-center space-y-2">
                <UploadCloud className="h-8 w-8 text-primary mx-auto" />
                <div>
                  <h4 className="text-xs font-bold text-foreground">Upload Passport Size Photograph</h4>
                  <p className="text-[11px] text-muted-foreground">PNG or JPG max 2MB (Used for printed ID pass credential)</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => toast.info('Photo Selected', 'Sample student photo attached.')}
                >
                  Browse Photo File
                </Button>
              </div>
            </CardContent>
          )}

          {/* STEP 3: Integrated Campus Bus Seat Selection (1 Person = 1 Seat) */}
          {currentStep === 3 && (
            <CardContent className="p-6 space-y-5">
              <div className="border-b border-border/60 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Armchair className="h-5 w-5 text-primary" /> Step 3: Choose Your Bus Seat (1 Person = 1 Seat)
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Select your numbered seat on the physical bus floor, or choose an open General Transit Pass
                  </p>
                </div>
                <Badge variant="outline">3 of 4 Steps</Badge>
              </div>

              {/* Interactive Bus Seat Map Embedded Directly in Application Workflow */}
              <div className="space-y-4">
                <BusSeatMap
                  routeNumber="14"
                  routeName={`${formValues.boardingPoint} Express`}
                  busRegNo="AP 07 TJ 4514"
                  departureTime="07:10 AM"
                  fareAmount={29300}
                  onConfirmBooking={handleSeatSelected}
                  userRole="student"
                />

                <div className="p-3.5 rounded-xl bg-muted/40 border border-border flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>
                      Current Selection: <strong className="text-foreground">{selectedSeat}</strong>
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    Allocated to {formValues.regNo}
                  </span>
                </div>
              </div>
            </CardContent>
          )}

          {/* STEP 4: Review Application & Declaration */}
          {currentStep === 4 && (
            <CardContent className="p-6 space-y-5">
              <div className="border-b border-border/60 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-primary" /> Step 4: Review Bus Pass Application
                  </h3>
                  <p className="text-xs text-muted-foreground">Review your submitted details before final submission to Transport Cell</p>
                </div>
                <Badge variant="outline">4 of 4 Steps</Badge>
              </div>

              <div className="space-y-4 text-xs">
                {/* Personal Details Review Box */}
                <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-3">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2">
                    <h4 className="font-bold text-foreground flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-primary" /> Personal Details Summary
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-primary"
                      leftIcon={<Edit2 className="h-3 w-3" />}
                      onClick={() => handleJumpToStep(1)}
                    >
                      Edit Section
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-muted-foreground">
                    <div>
                      <span>Student Name:</span>
                      <strong className="text-foreground block">{formValues.name}</strong>
                    </div>
                    <div>
                      <span>Roll Number:</span>
                      <strong className="text-foreground block font-mono">{formValues.regNo}</strong>
                    </div>
                    <div>
                      <span>Department:</span>
                      <strong className="text-foreground block">{formValues.department}</strong>
                    </div>
                    <div>
                      <span>Academic Year:</span>
                      <strong className="text-foreground block">{formValues.academicYear}</strong>
                    </div>
                    <div>
                      <span>Mobile Phone:</span>
                      <strong className="text-foreground block">{formValues.phone}</strong>
                    </div>
                    <div>
                      <span>Email:</span>
                      <strong className="text-foreground block font-mono">{formValues.email}</strong>
                    </div>
                  </div>
                </div>

                {/* Transport & Route Details Review Box */}
                <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-3">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2">
                    <h4 className="font-bold text-foreground flex items-center gap-2 text-sm">
                      <Bus className="h-4 w-4 text-primary" /> Transport & Route Selection Summary
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-primary"
                      leftIcon={<Edit2 className="h-3 w-3" />}
                      onClick={() => handleJumpToStep(2)}
                    >
                      Edit Section
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-muted-foreground">
                    <div>
                      <span>Residential Area:</span>
                      <strong className="text-foreground block">{formValues.residentialArea}</strong>
                    </div>
                    <div>
                      <span>Preferred Boarding Stop:</span>
                      <strong className="text-primary block font-bold">{formValues.boardingPoint}</strong>
                    </div>
                    <div>
                      <span>Nearest Landmark:</span>
                      <strong className="text-foreground block">{formValues.landmark}</strong>
                    </div>
                    <div>
                      <span>Departure Shift:</span>
                      <strong className="text-foreground block">{formValues.preferredShift}</strong>
                    </div>
                  </div>
                </div>

                {/* Dedicated Seat Allocation Review Box */}
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/30 space-y-3">
                  <div className="flex items-center justify-between border-b border-primary/20 pb-2">
                    <h4 className="font-bold text-foreground flex items-center gap-2 text-sm">
                      <Armchair className="h-4 w-4 text-primary" /> Reserved Seat Allocation Summary
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-primary"
                      leftIcon={<Edit2 className="h-3 w-3" />}
                      onClick={() => handleJumpToStep(3)}
                    >
                      Change Seat
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-muted-foreground">
                    <div>
                      <span>Allocated Pass:</span>
                      <strong className="text-primary text-sm font-bold block">{selectedSeat}</strong>
                    </div>
                    <div>
                      <span>Bus Assignment:</span>
                      <strong className="text-foreground font-mono block">Bus AP 07 TJ 4514</strong>
                    </div>
                    <div>
                      <span>Allocation Rule:</span>
                      <strong className="text-foreground block">1 Student • 1 Seat</strong>
                    </div>
                  </div>
                </div>

                {/* Declaration Checkbox */}
                <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
                  <Checkbox
                    id="declaration"
                    label="I hereby declare that the details provided are true to the best of my knowledge. I agree to abide by all VFSTR Transport Cell regulations."
                    {...register('declaration')}
                  />
                  {errors.declaration?.message && (
                    <p className="text-[11px] font-semibold text-destructive">{errors.declaration.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          )}

          {/* STEP 5: Submission Success Confirmation */}
          {currentStep === 5 && (
            <CardContent className="p-8 text-center space-y-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-10 w-10" />
              </div>

              <div className="space-y-2">
                <Badge variant="success" className="text-xs font-bold px-3 py-1">
                  Application Submitted
                </Badge>
                <h2 className="text-2xl font-extrabold text-foreground">
                  Bus Pass Application Received!
                </h2>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Your application reference code is{' '}
                  <span className="font-bold font-mono text-foreground text-sm">{applicationRef}</span> with{' '}
                  <strong className="text-primary">{selectedSeat}</strong> reserved for AY 2026-27.
                </p>
              </div>

              {/* Status Roadmap */}
              <div className="max-w-md mx-auto p-4 rounded-xl border border-border bg-muted/30 text-left text-xs space-y-3">
                <h4 className="font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> Application Approval Process:
                </h4>
                <div className="space-y-2 text-muted-foreground">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <Check className="h-4 w-4" /> 1. Application Submitted Online ({selectedSeat})
                  </div>
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <Clock className="h-4 w-4 text-amber-500" /> 2. Transport Cell Verification & Fee Clearance
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" /> 3. Digital Pass Active & Bus QR Enabled
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => setIsUpiModalOpen(true)}
                  leftIcon={<QrCode className="h-4 w-4" />}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 font-bold"
                >
                  Pay ₹29,300 via UPI (Instant Clearance)
                </Button>
                <Link to="/student" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto">
                    Go to Student Dashboard
                  </Button>
                </Link>
                <Link to="/student/pass" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto">
                    View My Pass Status
                  </Button>
                </Link>
              </div>
            </CardContent>
          )}

          {/* Form Footer Navigation Controls */}
          {currentStep < 5 && (
            <CardFooter className="bg-muted/30 p-4 border-t border-border flex items-center justify-between">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  leftIcon={<ArrowLeft className="h-3.5 w-3.5" />}
                  onClick={handlePrevStep}
                >
                  Previous
                </Button>
              ) : (
                <div />
              )}

              {currentStep < 4 ? (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                  onClick={handleNextStep}
                >
                  Continue to Step {currentStep + 1}
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmitting}
                  leftIcon={<Send className="h-3.5 w-3.5" />}
                >
                  Submit Application
                </Button>
              )}
            </CardFooter>
          )}
        </Card>
      </form>

      {/* Instant UPI Payment Gateway Modal */}
      <UpiPaymentModal
        isOpen={isUpiModalOpen}
        onClose={() => setIsUpiModalOpen(false)}
        studentName={studentProfile.name}
        regNo={studentProfile.regNo}
        amount={29300}
        assignedRoute="Route #14 - Guntur City Express"
        purpose={`Annual Bus Pass AY 2026-27 (${selectedSeat})`}
        onSuccess={() => {
          updateStudentProfile({
            isTransportUser: true,
            transportStatus: 'active',
            seatNumber: selectedSeat,
          });
        }}
      />
    </div>
  );
};
