import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Badge } from '@/components/ui/Badge';
import { StatusChip } from '@/components/ui/StatusChip';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/Alert';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useUser } from '@/hooks/useUser';
import { useToast } from '@/hooks/useToast';
import {
  Bus,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Sparkles,
  ArrowRight,
  FileCheck,
  Check,
} from 'lucide-react';

const renewalSchema = z.object({
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms & conditions before proceeding with pass renewal',
  }),
});

type RenewalFormValues = z.infer<typeof renewalSchema>;

export const RenewPassPage: React.FC = () => {
  const { studentProfile } = useUser();
  const toast = useToast();

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [renewalError, setRenewalError] = useState<string | null>(null);
  const [renewalRef, setRenewalRef] = useState<string | null>(null);

  const currentPass = {
    passNumber: 'VFSTR-2026-R14-04001',
    currentTerm: '2026 - 2027',
    nextTerm: '2027 - 2028',
    expiryDate: '31 May 2027',
    newValidityStart: '01 Jun 2027',
    newValidityEnd: '31 May 2028',
    daysRemaining: 245,
    assignedRoute: 'Route #14 - Guntur City Express',
    assignedStop: 'Old Bus Stand, Guntur',
    assignedBus: 'VFSTR-B14 (AP 07 TJ 4521)',
    eligibilityStatus: 'Eligible for Annual Renewal',
    feeAmount: 18500,
    processingFee: 0,
    totalFee: 18500,
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RenewalFormValues>({
    resolver: zodResolver(renewalSchema),
    defaultValues: {
      acceptTerms: false,
    },
  });

  const handleFormSubmit = (_data: RenewalFormValues) => {
    setRenewalError(null);
    setShowConfirmModal(true);
  };

  const handleConfirmRenewal = () => {
    setShowConfirmModal(false);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const generatedRef = `REN-2027-${Math.floor(1000 + Math.random() * 9000)}`;
      setRenewalRef(generatedRef);
      setIsSuccess(true);
      toast.success('Renewal Request Submitted', `Renewal request ${generatedRef} registered successfully.`);
    }, 1200);
  };

  const triggerMockError = () => {
    setRenewalError('Annual renewal window for Route #14 requires fee clearance verification from Accounts Cell.');
    toast.error('Renewal Error', 'Temporary clearance error simulated.');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-page">
      {/* Section Header */}
      <SectionHeader
        title="Bus Pass Annual Renewal"
        subtitle="Renew your transport pass for Academic Year 2027-2028"
        badge={<Badge variant="success" dot>Eligibility Verified</Badge>}
        actions={
          !isSuccess && import.meta.env.DEV ? (
            <Button variant="outline" size="sm" onClick={triggerMockError}>
              Simulate Error State
            </Button>
          ) : undefined
        }
      />

      {/* Simulated Error Alert */}
      {renewalError && (
        <Alert variant="destructive" className="py-3">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <AlertTitle className="text-xs font-bold">Renewal Processing Notice</AlertTitle>
            <AlertDescription className="text-xs mt-1">{renewalError}</AlertDescription>
          </div>
        </Alert>
      )}

      {/* SUCCESS SCREEN */}
      {isSuccess ? (
        <Card className="border-2 border-emerald-500/30 shadow-xl overflow-hidden bg-card p-8 text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <div className="space-y-2">
            <Badge variant="success" className="text-xs font-bold px-3 py-1">
              Renewal Application Submitted
            </Badge>
            <h2 className="text-2xl font-extrabold text-foreground">
              Pass Renewal Request Received!
            </h2>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Your renewal reference code is <span className="font-bold font-mono text-foreground text-sm">{renewalRef}</span>.
            </p>
          </div>

          {/* Renewal Summary Matrix */}
          <div className="max-w-lg mx-auto p-4 rounded-xl border border-border bg-muted/40 text-left text-xs space-y-3">
            <h4 className="font-bold text-foreground flex items-center gap-2 border-b border-border/60 pb-2">
              <FileCheck className="h-4 w-4 text-primary" /> Renewal Summary Credentials:
            </h4>
            <div className="grid grid-cols-2 gap-2 text-muted-foreground">
              <div>
                <span>Student Name:</span>
                <strong className="text-foreground block">{studentProfile.name}</strong>
              </div>
              <div>
                <span>Roll Number:</span>
                <strong className="text-foreground block font-mono">{studentProfile.regNo}</strong>
              </div>
              <div>
                <span>Target Term:</span>
                <strong className="text-foreground block">AY {currentPass.nextTerm}</strong>
              </div>
              <div>
                <span>New Validity Period:</span>
                <strong className="text-foreground block">{currentPass.newValidityStart} – {currentPass.newValidityEnd}</strong>
              </div>
              <div>
                <span>Assigned Route:</span>
                <strong className="text-primary block">{currentPass.assignedRoute}</strong>
              </div>
              <div>
                <span>Annual Fee:</span>
                <strong className="text-emerald-600 dark:text-emerald-400 block font-bold">₹{currentPass.totalFee.toLocaleString()} (Pending Verification)</strong>
              </div>
            </div>
          </div>

          {/* Next Steps Roadmap */}
          <div className="max-w-md mx-auto p-4 rounded-xl border border-border bg-card text-left text-xs space-y-2">
            <h4 className="font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Next Steps:
            </h4>
            <ul className="space-y-1.5 text-muted-foreground">
              <li className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                <Check className="h-3.5 w-3.5" /> 1. Online Renewal Request Registered
              </li>
              <li className="flex items-center gap-2 text-foreground">
                <Clock className="h-3.5 w-3.5 text-amber-500" /> 2. Transport Cell Accounts Verification & Cash Desk Receipt
              </li>
              <li className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> 3. Automatic Extension of Digital QR Pass
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to="/student" className="w-full sm:w-auto">
              <Button variant="primary" className="w-full sm:w-auto">
                Go to Dashboard
              </Button>
            </Link>
            <Link to="/student/pass" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto">
                View Digital Pass
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        /* RENEWAL FORM & DETAILS */
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Column 1: Current Pass Details & Timeline */}
            <div className="lg:col-span-7 space-y-6">
              {/* Current Pass Information Card */}
              <Card className="p-6 border-2 border-primary/10">
                <SectionHeader
                  title="Current Pass Information"
                  subtitle="Active bus pass credential"
                  badge={<StatusChip status="active" />}
                  className="pb-3 mb-4"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-muted/40 rounded-lg space-y-1">
                    <span className="text-muted-foreground font-medium flex items-center gap-1">
                      <Bus className="h-3.5 w-3.5 text-primary" /> Pass Number
                    </span>
                    <span className="font-bold text-foreground text-sm font-mono block">{currentPass.passNumber}</span>
                  </div>

                  <div className="p-3 bg-muted/40 rounded-lg space-y-1">
                    <span className="text-muted-foreground font-medium flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-primary" /> Expiry Date
                    </span>
                    <span className="font-bold text-foreground text-sm block">{currentPass.expiryDate}</span>
                  </div>

                  <div className="p-3 bg-muted/40 rounded-lg space-y-1 sm:col-span-2">
                    <span className="text-muted-foreground font-medium flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-primary" /> Assigned Route & Boarding Stop
                    </span>
                    <span className="font-bold text-primary text-sm block">{currentPass.assignedRoute}</span>
                    <span className="text-muted-foreground block">Boarding Stop: {currentPass.assignedStop}</span>
                  </div>
                </div>
              </Card>

              {/* Renewal Timeline Card */}
              <Card className="p-6">
                <SectionHeader
                  title="Renewal Timeline & Status"
                  subtitle="Annual pass extension roadmap"
                  badge={<Badge variant="success">{currentPass.eligibilityStatus}</Badge>}
                  className="pb-3 mb-4"
                />

                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs">
                        245d
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">Early Bird Renewal Window</h4>
                        <p className="text-muted-foreground text-[11px]">Submitting early guarantees seat reservation for AY {currentPass.nextTerm}.</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="hidden sm:inline-flex">Open Now</Badge>
                  </div>
                </div>
              </Card>

              {/* Terms and Conditions Card */}
              <Card className="p-6">
                <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  VFSTR Transport Terms & Regulations
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  By submitting this renewal request, you agree that your bus pass will be extended for Academic Year {currentPass.nextTerm}. Annual transport fees are non-refundable once verified by the Accounts Cell.
                </p>

                <div className="p-4 rounded-xl border border-primary/20 bg-muted/30">
                  <Checkbox
                    id="acceptTerms"
                    label="I accept the VFSTR transport regulations and confirm renewal for Academic Year 2027-2028."
                    {...register('acceptTerms')}
                  />
                  {errors.acceptTerms?.message && (
                    <p className="text-[11px] font-semibold text-destructive mt-1">{errors.acceptTerms.message}</p>
                  )}
                </div>
              </Card>
            </div>

            {/* Column 2: Fee Placeholder & Renewal Summary */}
            <div className="lg:col-span-5 space-y-6">
              {/* Fee Placeholder Breakdown Card */}
              <Card className="p-6 border-2 border-primary/20">
                <SectionHeader
                  title="Fee & Payment Summary"
                  subtitle={`Academic Year ${currentPass.nextTerm}`}
                  badge={<CreditCard className="h-4 w-4 text-primary" />}
                  className="pb-3 mb-4"
                />

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Annual Bus Pass Fee:</span>
                    <span className="font-bold text-foreground">₹{currentPass.feeAmount.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Facility & Bus Maintenance:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">Included (₹0)</span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Processing Charges:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">Waived (₹0)</span>
                  </div>

                  <div className="flex justify-between py-3 text-sm font-bold text-foreground bg-primary/5 p-3 rounded-xl border border-primary/20">
                    <span>Total Renewal Fee:</span>
                    <span className="text-primary font-extrabold text-base">₹{currentPass.totalFee.toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-5">
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full h-11 text-sm"
                    isLoading={isLoading}
                    leftIcon={<RefreshCw className="h-4 w-4" />}
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    Proceed to Renew Pass
                  </Button>
                </div>
              </Card>

              {/* Renewal Target Summary Card */}
              <Card className="p-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  New Credential Validity Summary
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Renewal Term:</span>
                    <span className="font-bold text-foreground">AY {currentPass.nextTerm}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">New Valid From:</span>
                    <span className="font-bold text-foreground">{currentPass.newValidityStart}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">New Valid Until:</span>
                    <span className="font-bold text-foreground">{currentPass.newValidityEnd}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </form>
      )}

      {/* Confirmation Dialog Modal */}
      <ConfirmDialog
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmRenewal}
        title="Confirm Bus Pass Renewal Request"
        description={`Are you sure you want to request annual pass renewal for Academic Year ${currentPass.nextTerm} (Route #14 - Guntur City Express)? Total fee ₹${currentPass.totalFee.toLocaleString()} will be submitted to the Transport Accounts Cell.`}
        confirmText="Confirm & Submit Renewal"
        variant="info"
        isLoading={isLoading}
      />
    </div>
  );
};
