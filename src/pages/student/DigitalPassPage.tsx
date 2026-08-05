import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatusChip } from '@/components/ui/StatusChip';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Avatar } from '@/components/ui/Avatar';
import { useUser } from '@/hooks/useUser';
import { useToast } from '@/hooks/useToast';
import { APP_CONFIG } from '@/config/app.config';
import { downloadDigitalPassPdf } from '@/utils/downloadReceipt';
import { PageLayout } from '@/layouts/components/PageLayout';
import {
  Bus,
  Calendar,
  MapPin,
  ShieldCheck,
  Download,
  RefreshCw,
  Printer,
  CheckCircle2,
  AlertCircle,
  Building,
  User,
  CreditCard,
} from 'lucide-react';

export const DigitalPassPage: React.FC = () => {
  const { studentProfile } = useUser();
  const toast = useToast();

  const passDetails = {
    passNumber: 'VFSTR-2026-R14-04001',
    academicYear: '2026 - 2027',
    status: 'active' as const,
    issueDate: '10 Aug 2026',
    expiryDate: '31 May 2027',
    daysRemaining: 245,
    assignedRouteNumber: 'Route #14',
    assignedRouteName: 'Guntur City Express',
    assignedStop: 'Old Bus Stand, Guntur',
    morningPickupTime: '07:10 AM',
    eveningDepartureTime: '05:15 PM',
    assignedBusRegNo: 'AP 07 TJ 4521',
    assignedBusId: 'VFSTR-B14',
    transportOfficeStatus: 'Verified & Authorized by Transport Officer',
    feePaid: 18500,
    paymentStatus: 'Paid',
    authorizedBy: 'Dr. M. R. K. Murthy (Transport In-Charge)',
  };

  const handleDownloadPdf = () => {
    downloadDigitalPassPdf({
      passNumber: passDetails.passNumber,
      studentName: studentProfile.name,
      regNo: studentProfile.regNo,
      department: studentProfile.department,
      route: passDetails.assignedRouteName,
      pickupPoint: passDetails.assignedStop,
      validUntil: passDetails.expiryDate,
      busRegNo: passDetails.assignedBusRegNo,
    });
    toast.success('Pass PDF Generated', 'Official VFSTR digital bus pass credential downloaded successfully.');
  };

  const handlePrintPass = () => {
    window.print();
  };

  if (!studentProfile.isTransportUser) {
    return (
      <PageLayout>
        <SectionHeader
          title="Digital Bus Pass Credentials"
          subtitle="Vignan Foundation for Science, Technology & Research Transport Pass"
        />
        <Card className="p-8 text-center max-w-2xl mx-auto space-y-4 border-2 border-primary/20 bg-card">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto">
            <Bus className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Not Enrolled in University Transport</h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
            You do not currently have an active bus pass subscription. Apply for university transport services to get assigned to a route, seat, and digital bus pass.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link to="/student/routes">
              <Button variant="outline" size="md">View Routes & Fees</Button>
            </Link>
            <Link to="/student/apply">
              <Button variant="primary" size="md" leftIcon={<Bus className="h-4 w-4" />}>
                Apply for Bus Pass
              </Button>
            </Link>
          </div>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* Section Header with Actions */}
      <SectionHeader
        title="Official Digital Bus Pass"
        subtitle="Vignan Foundation for Science, Technology & Research Transport Pass"
        badge={<StatusChip status={passDetails.status} />}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Printer className="h-3.5 w-3.5" />}
              onClick={handlePrintPass}
            >
              Print Pass
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Download className="h-3.5 w-3.5" />}
              onClick={handleDownloadPdf}
            >
              Download PDF Pass
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Column 1: Main Digital Bus Pass Card Feature */}
        <div className="lg:col-span-8 space-y-6">
          {/* Official Pass Design Placeholder Notice */}
          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-50/40 dark:bg-amber-950/20 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
              <span>Current physical/manual bus pass remains active. Digital layout will update once the official VFSTR Bus Pass design is released by the university.</span>
            </div>
            <Badge variant="outline" className="shrink-0 border-amber-500/40 text-amber-700 dark:text-amber-300">Manual Pass Active</Badge>
          </div>

          {/* Feature #1: Exact Replica of Official Physical VFSTR Bus Pass Card (From Uploaded Sample Image) */}
          <div className="p-6 rounded-3xl bg-slate-900 shadow-2xl border-4 border-amber-400 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Official Physical Pass Blueprint</span>
              <Badge variant="secondary" className="bg-amber-400 text-slate-950 font-black text-xs">BUS PASS 2025-26</Badge>
            </div>

            {/* Laminated Plastic Pass Container */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-yellow-300 via-yellow-400 to-yellow-500 text-slate-950 p-5 sm:p-6 shadow-inner border-2 border-yellow-600 font-sans">
              {/* Card Header */}
              <div className="flex items-start justify-between border-b-2 border-slate-900/40 pb-3 gap-2">
                <div className="flex items-center gap-3">
                  {/* VFSTR Emblem Logo Circle */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 text-yellow-400 font-black text-xl shrink-0 border-2 border-white shadow">
                    V
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-950 uppercase leading-none">
                      VIGNAN'S UNIVERSITY
                    </h2>
                    <p className="text-[9px] font-bold text-slate-900 tracking-tighter leading-tight mt-0.5">
                      VIGNAN'S FOUNDATION FOR SCIENCE TECHNOLOGY AND RESEARCH
                    </p>
                    <p className="text-[8px] font-extrabold text-slate-800 tracking-tighter">
                      (DEEMED TO BE UNIVERSITY)
                    </p>
                    <p className="text-[8px] font-medium text-slate-800">
                      Vadlamudi, Guntur, AP - 522213 Ph : 7330813943, 9705444211
                    </p>
                  </div>
                </div>

                {/* Passport Student Photo Container */}
                <div className="relative shrink-0">
                  <div className="h-24 w-20 rounded-md bg-white border-2 border-slate-950 overflow-hidden shadow-md">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
                      alt="A. SAI ADITYA"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {/* Purple Transport Stamp Watermark Overlay */}
                  <div className="absolute -bottom-3 -left-4 h-14 w-14 rounded-full border-2 border-purple-800/60 bg-purple-900/10 flex items-center justify-center pointer-events-none rotate-12">
                    <span className="text-[7px] font-black text-purple-900/80 uppercase text-center leading-none">
                      VFSTR<br />TRANSPORT<br />STAMP
                    </span>
                  </div>
                </div>
              </div>

              {/* Red-Bordered BUS PASS Badge Banner */}
              <div className="flex items-center justify-between my-3 gap-2">
                <div className="flex items-center gap-3 text-xs font-black">
                  <span>SEAT No. <u className="font-mono text-sm underline decoration-slate-900">46</u></span>
                  <span>BUS No. <u className="font-mono text-sm underline decoration-slate-900">AP39WC 7038</u></span>
                </div>
                <div className="px-3 py-1 rounded-md bg-red-600 text-white font-black text-xs tracking-wider shadow border border-red-700">
                  BUS PASS 2025-26
                </div>
              </div>

              {/* Student Identification Handwritten Font Fields */}
              <div className="space-y-1.5 text-xs font-extrabold text-slate-950 border-t-2 border-slate-900/30 pt-3">
                <div className="flex items-baseline gap-2">
                  <span className="w-28 shrink-0 text-slate-900 font-bold">Name :</span>
                  <span className="font-black text-sm uppercase font-mono tracking-wide text-slate-950">A. SAI ADITYA</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="w-28 shrink-0 text-slate-900 font-bold">ID. No. :</span>
                  <span className="font-black text-sm font-mono tracking-wide text-slate-950">151FA23010</span>
                  <span className="ml-auto text-[11px] font-bold">Year / Branch : <u className="font-mono underline">Ist CSE-DS</u></span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="w-28 shrink-0 text-slate-900 font-bold">Boarding Stage :</span>
                  <span className="font-black text-xs uppercase font-mono tracking-wide text-slate-950">RATNAGIRI NAGAR</span>
                </div>
              </div>

              {/* Signature Seal Footer */}
              <div className="flex items-end justify-between border-t border-slate-900/30 pt-3 mt-3 text-[10px] font-bold">
                <span className="text-slate-800">VFSTR Smart Transport Card Credential</span>
                <div className="text-right">
                  <span className="block font-mono text-red-700 font-black italic">M.R.K. Murthy</span>
                  <span className="text-slate-900 font-extrabold">Authorised Signature</span>
                </div>
              </div>
            </div>
          </div>

          <Card className="border-2 border-primary/20 shadow-xl overflow-hidden bg-card">
            {/* Card Top Header Banner */}
            <div className="bg-gradient-to-r from-primary via-primary/90 to-primary-hover p-6 text-primary-foreground">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-background/20 backdrop-blur text-primary-foreground border border-white/20">
                    <Bus className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold tracking-tight">{APP_CONFIG.institution}</h2>
                    <p className="text-xs text-primary-foreground/80 font-medium">TRANSPORT MANAGEMENT CELL • OFFICIAL BUS PASS</p>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end">
                  <Badge variant="secondary" className="w-fit text-xs font-bold px-3 py-1 bg-secondary text-secondary-foreground">
                    AY {passDetails.academicYear}
                  </Badge>
                  <span className="text-[11px] font-mono text-primary-foreground/80 mt-1">{passDetails.passNumber}</span>
                </div>
              </div>
            </div>

            {/* Main Pass Body Details */}
            <CardContent className="p-6 space-y-6">
              {/* Student Identification Row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-4 rounded-xl bg-muted/40 border border-border">
                <Avatar name={studentProfile.name} size="xl" className="h-20 w-20 border-2 border-primary/30 text-xl shrink-0" />

                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-foreground">{studentProfile.name}</h3>
                    <Badge variant="outline" className="font-mono text-xs">{studentProfile.regNo}</Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Building className="h-3.5 w-3.5 text-primary shrink-0" /> {studentProfile.department}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-primary shrink-0" /> {studentProfile.academicYear}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 sm:text-right">
                  <StatusChip status={passDetails.status} />
                </div>
              </div>

              {/* Route & Vehicle Assignment Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Assigned Route */}
                <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                  <span className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px] block">
                    Assigned Route & Stop
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-bold">{passDetails.assignedRouteNumber}</Badge>
                    <span className="font-bold text-foreground text-sm">{passDetails.assignedRouteName}</span>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 font-medium pt-1">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{passDetails.assignedStop}</span>
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/60 pt-2 mt-2">
                    <span>Morning: <strong className="text-emerald-600 dark:text-emerald-400">{passDetails.morningPickupTime}</strong></span>
                    <span>Evening: <strong className="text-blue-600 dark:text-blue-400">{passDetails.eveningDepartureTime}</strong></span>
                  </div>
                </div>

                {/* Assigned Bus Vehicle */}
                <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                  <span className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px] block">
                    Vehicle Assignment
                  </span>
                  <div className="flex items-center gap-2">
                    <Bus className="h-4 w-4 text-primary shrink-0" />
                    <span className="font-bold text-foreground text-sm">{passDetails.assignedBusRegNo}</span>
                    <Badge variant="secondary" className="ml-auto">{passDetails.assignedBusId}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground pt-1">
                    Transport Cell Office Code: <span className="font-semibold text-foreground">VFSTR-CELL-04</span>
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/60 pt-2 mt-2">
                    <span>Authorized Seating: <strong className="text-foreground">Reserved</strong></span>
                    <span>Class: <strong className="text-foreground">Deluxe Fleet</strong></span>
                  </div>
                </div>
              </div>

              {/* Pass Validity Dates & Authorization */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-muted/40 rounded-lg space-y-0.5">
                  <span className="text-muted-foreground font-medium flex items-center gap-1 text-[11px]">
                    <Calendar className="h-3.5 w-3.5 text-primary" /> Issue Date
                  </span>
                  <span className="font-bold text-foreground block">{passDetails.issueDate}</span>
                </div>

                <div className="p-3 bg-muted/40 rounded-lg space-y-0.5">
                  <span className="text-muted-foreground font-medium flex items-center gap-1 text-[11px]">
                    <Calendar className="h-3.5 w-3.5 text-primary" /> Expiry Date
                  </span>
                  <span className="font-bold text-foreground block">{passDetails.expiryDate}</span>
                </div>

                <div className="p-3 bg-muted/40 rounded-lg space-y-0.5">
                  <span className="text-muted-foreground font-medium flex items-center gap-1 text-[11px]">
                    <CreditCard className="h-3.5 w-3.5 text-primary" /> Fee Status
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 block">{passDetails.paymentStatus} (₹{passDetails.feePaid.toLocaleString()})</span>
                </div>
              </div>

              {/* Transport Office Status Badge Banner */}
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/20 flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div className="flex-1 text-xs">
                  <span className="font-bold text-emerald-900 dark:text-emerald-200 block">
                    {passDetails.transportOfficeStatus}
                  </span>
                  <span className="text-muted-foreground">
                    Authorized Signatory: {passDetails.authorizedBy}
                  </span>
                </div>
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 hidden sm:block" />
              </div>
            </CardContent>

            <CardFooter className="bg-muted/30 p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>This is an official digital credential issued by VFSTR Transport Cell.</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleDownloadPdf} leftIcon={<Download className="h-3.5 w-3.5" />}>
                  Download PDF
                </Button>
                <Link to="/student/renew">
                  <Button variant="primary" size="sm" leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>
                    Renew Pass
                  </Button>
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Column 2: Renewal Status & Pass Instructions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Renewal Status Card */}
          <Card className="p-6 border-2 border-primary/20">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">Pass Validity & Renewal</h3>
                <StatusChip status="active" />
              </div>

              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-center space-y-1">
                <span className="text-3xl font-extrabold text-primary">{passDetails.daysRemaining}</span>
                <span className="text-xs font-semibold text-foreground block">Days Remaining in Term</span>
                <span className="text-[11px] text-muted-foreground block">Valid until {passDetails.expiryDate}</span>
              </div>

              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between py-1 border-b border-border/60">
                  <span>Pass Type:</span>
                  <span className="font-semibold text-foreground">Annual Bus Pass</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/60">
                  <span>Fee Amount:</span>
                  <span className="font-semibold text-foreground">₹{passDetails.feePaid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/60">
                  <span>Renewal Window:</span>
                  <span className="font-semibold text-foreground">Open 30 Days Prior</span>
                </div>
              </div>

              <Link to="/student/renew" className="block w-full">
                <Button variant="secondary" className="w-full" leftIcon={<RefreshCw className="h-4 w-4" />}>
                  Proceed to Pass Renewal
                </Button>
              </Link>
            </div>
          </Card>

          {/* Pass Guidelines Card */}
          <Card className="p-6">
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-primary" />
              Transport Rules & Pass Guidelines
            </h3>
            <ul className="space-y-2 text-xs text-muted-foreground leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Present this pass on your smartphone upon boarding university buses.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Passes are non-transferable and valid strictly for the assigned route.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Report any change in pickup stop immediately to Room 104 Admin Block.</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};
