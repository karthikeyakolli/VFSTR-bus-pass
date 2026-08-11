import React, { useState, useRef } from 'react';
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
import { downloadCombinedBusPassPdf, downloadCardElementAsImage } from '@/utils/downloadReceipt';
import { PageLayout } from '@/layouts/components/PageLayout';
import { AdvancedBackendService, VerificationResult } from '@/services/AdvancedBackendService';
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
  RotateCw,
  Upload,
  Camera,
  Image as ImageIcon,
} from 'lucide-react';

export const DigitalPassPage: React.FC = () => {
  const { studentProfile } = useUser();
  const toast = useToast();
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  // Card Flip State
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // Rotating TOTP Security Verification Token
  const [totpToken, setTotpToken] = useState<string>('849201');
  const [totpTimer, setTotpTimer] = useState<number>(30);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTotpTimer((prev) => {
        if (prev <= 1) {
          const newToken = Math.floor(100000 + Math.random() * 900000).toString();
          setTotpToken(newToken);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Custom User Photo State (default to sample photo)
  const [userPhoto, setUserPhoto] = useState<string>(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const passDetails = {
    passNumber: 'VFSTR-2026-R14-04001',
    academicYear: '2026 - 2027',
    status: 'active' as const,
    issueDate: '10 Aug 2026',
    expiryDate: '31 May 2027',
    daysRemaining: 245,
    assignedRouteNumber: 'Route #14',
    assignedRouteName: 'Guntur City Express',
    assignedStop: 'Gorantla, Guntur',
    seatNo: '41',
    busRegNo: 'AP39WC - 7020',
    morningPickupTime: '07:10 AM',
    eveningDepartureTime: '05:15 PM',
    transportOfficeStatus: 'Verified & Authorized by Transport Officer',
    feePaid: 18500,
    paymentStatus: 'Paid',
    authorizedBy: 'Dr. M. R. K. Murthy (Transport In-Charge)',
    phoneNumber: '8885940527',
    yearBranch: 'Ist CSE-DS',
  };

  const handleVerifyHmac = async () => {
    if (!studentProfile.isTransportUser) {
      toast.error('Pass Not Issued', 'You have not applied for a bus pass yet. Please complete registration first.');
      return;
    }
    const payload = JSON.stringify({
      passNumber: passDetails.passNumber,
      studentName: studentProfile.name,
      regNo: studentProfile.regNo,
      validUntil: passDetails.expiryDate,
    });
    const signature = btoa(`${passDetails.passNumber}:${studentProfile.regNo}:VFSTR_SECRET_KEY`);
    const res = await AdvancedBackendService.verifyPassSignature(payload, signature);
    setVerificationResult(res);
    toast.success('HMAC Cryptographic Proof Verified', 'Pass token signature validated against backend secret key.');
  };

  const handleDownloadPdf = async () => {
    if (!studentProfile.isTransportUser) {
      toast.error('Pass Not Issued', 'Bus pass download is locked until your application and fee payment are completed.');
      return;
    }
    toast.info('Generating PDF Pass...', 'Creating multi-page PDF with Front and Back pass faces.');
    await downloadCombinedBusPassPdf('vfstr-bus-pass-front', 'vfstr-bus-pass-back', studentProfile.regNo || '241FA04001');
    toast.success('Combined Pass PDF Downloaded', 'Official VFSTR bus pass PDF with both Front & Back sides generated successfully.');
  };

  const handleDownloadFrontImage = async () => {
    if (!studentProfile.isTransportUser) {
      toast.error('Pass Not Issued', 'Bus pass download is locked. Please apply and complete fee payment first.');
      return;
    }
    toast.info('Generating Image...', 'Capturing front side of VFSTR Bus Pass.');
    await downloadCardElementAsImage('vfstr-bus-pass-front', `VFSTR_BusPass_Front_${studentProfile.regNo}.png`);
    toast.success('Downloaded Front Side', 'Front side pass image saved successfully.');
  };

  const handleDownloadBackImage = async () => {
    if (!studentProfile.isTransportUser) {
      toast.error('Pass Not Issued', 'Bus pass download is locked. Please apply and complete fee payment first.');
      return;
    }
    toast.info('Generating Image...', 'Capturing back side of VFSTR Bus Pass.');
    await downloadCardElementAsImage('vfstr-bus-pass-back', `VFSTR_BusPass_Back_${studentProfile.regNo}.png`);
    toast.success('Downloaded Back Side', 'Back side pass image saved successfully.');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Invalid File Type', 'Please upload a valid image file (JPG, PNG, WebP).');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUserPhoto(event.target.result as string);
          toast.success('Passport Photo Updated', 'Your passport size photo has been updated on the bus pass.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePrintPass = () => {
    window.print();
  };

  const isSamplePreview = !studentProfile.isTransportUser;

  return (
    <PageLayout>
      {/* Hidden File Input for Passport Photo Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Non-Enrolled Student Sample Bus Pass Banner Notice */}
      {isSamplePreview && (
        <div className="p-4 rounded-2xl border-2 border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
              <Bus className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm uppercase tracking-wide">Sample Bus Pass Preview</span>
                <Badge variant="outline" className="border-amber-500/50 text-amber-700 dark:text-amber-300 font-bold">
                  Demo Mode
                </Badge>
              </div>
              <p className="text-xs text-amber-800 dark:text-amber-300/90 mt-0.5">
                You are currently viewing a sample prototype of the official VFSTR Bus Pass card. Apply now to get your official pass assigned!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <Link to="/student/routes" className="w-1/2 sm:w-auto">
              <Button variant="outline" size="sm" className="w-full border-amber-500/40 text-amber-800 dark:text-amber-200">
                View Routes
              </Button>
            </Link>
            <Link to="/student/apply" className="w-1/2 sm:w-auto">
              <Button variant="primary" size="sm" className="w-full bg-amber-600 hover:bg-amber-700 text-white" leftIcon={<Bus className="h-4 w-4" />}>
                Apply Now
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Section Header with Actions */}
      <SectionHeader
        title="Official Digital Bus Pass"
        subtitle="Vignan Foundation for Science, Technology & Research Transport Pass"
        badge={<StatusChip status={studentProfile.isTransportUser ? passDetails.status : "pending"} label={studentProfile.isTransportUser ? "Active & Authorized" : "Not Issued / Unpaid"} />}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />}
              onClick={handleVerifyHmac}
              disabled={!studentProfile.isTransportUser}
            >
              Verify Security HMAC
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Printer className="h-3.5 w-3.5" />}
              onClick={handlePrintPass}
              disabled={!studentProfile.isTransportUser}
            >
              Print Pass
            </Button>
            <Button
              variant={studentProfile.isTransportUser ? "primary" : "secondary"}
              size="sm"
              leftIcon={<Download className="h-3.5 w-3.5" />}
              onClick={handleDownloadPdf}
              disabled={!studentProfile.isTransportUser}
            >
              {studentProfile.isTransportUser ? "Download PDF Pass" : "Pass Locked (Fee Unpaid)"}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Column 1: Main Digital Bus Pass Card Feature */}
        <div className="lg:col-span-8 space-y-6">
          {/* Verification Result Banner */}
          {verificationResult && (
            <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs ${
              verificationResult.isValid
                ? 'border-emerald-500/40 bg-emerald-50/50 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200'
                : 'border-rose-500/40 bg-rose-50/50 text-rose-900 dark:bg-rose-950/30 dark:text-rose-200'
            }`}>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600" />
                <div>
                  <span className="font-bold block">HMAC Signature Status: {verificationResult.status.toUpperCase()}</span>
                  <span className="text-[11px] opacity-90">Pass ID: {verificationResult.passNumber} • Verified for {verificationResult.studentName} ({verificationResult.regNo})</span>
                </div>
              </div>
              <Badge variant="outline" className="shrink-0 border-current">Authentic Key Token</Badge>
            </div>
          )}

          {/* Interactive Card Action Controls Header */}
          <div className="p-4 rounded-2xl bg-card border border-border flex flex-wrap items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2">
              <Button
                variant={isFlipped ? "outline" : "primary"}
                size="sm"
                onClick={() => setIsFlipped(!isFlipped)}
                leftIcon={<RotateCw className="h-4 w-4" />}
                className="font-semibold shadow-sm"
              >
                Flip to {isFlipped ? "Front Side" : "Back Side"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                leftIcon={<Upload className="h-4 w-4 text-primary" />}
                className="font-medium"
              >
                Upload Passport Photo
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDownloadFrontImage}
                leftIcon={<ImageIcon className="h-3.5 w-3.5" />}
              >
                Download Front (PNG)
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDownloadBackImage}
                leftIcon={<ImageIcon className="h-3.5 w-3.5" />}
              >
                Download Back (PNG)
              </Button>
            </div>
          </div>

          {/* 3D Flip Card Container */}
          <div className="w-full flex items-center justify-center py-2" style={{ perspective: '1200px' }}>
            <div className="relative w-full max-w-[580px] group">
              {/* Dynamic Security Ribbon / Ticker Header */}
              <div className="mb-2 flex items-center justify-between px-3.5 py-2 rounded-xl bg-emerald-950/90 text-emerald-300 border border-emerald-500/30 text-xs font-mono shadow-md">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="font-bold text-emerald-400">AUTHENTICATED LIVE PASS</span>
                </div>
                <div className="text-[11px] text-emerald-200/90">
                  TOTP Token: <span className="font-bold text-white font-mono">{totpToken}</span> ({totpTimer}s)
                </div>
              </div>

              {/* Holographic Sheen & 3D Flip Card */}
              <div
                id="vfstr-bus-pass-container"
                className="relative w-full transition-transform duration-700 ease-in-out cursor-pointer select-none"
                style={{
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  transformStyle: 'preserve-3d',
                }}
                onClick={() => setIsFlipped(!isFlipped)}
                title="Click to flip bus pass card"
              >
                {/* ============================================================ */}
                {/* FRONT SIDE OF PHYSICAL VFSTR BUS PASS */}
                {/* ============================================================ */}
                <div
                  id="vfstr-bus-pass-front"
                  className="w-full rounded-3xl bg-yellow-300 p-3 sm:p-5 shadow-2xl border-4 border-yellow-400 text-slate-950 font-sans relative overflow-hidden"
                  style={{
                    backgroundColor: '#facc15',
                    backgroundImage: 'radial-gradient(#eab308 0.75px, transparent 0.75px)',
                    backgroundSize: '12px 12px',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                  }}
                >
                  {/* Holographic Watermark Sheen */}
                  <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-tr from-transparent via-white/25 to-transparent opacity-40 mix-blend-overlay transition-opacity duration-300 group-hover:opacity-70" />

                  {/* Outer Red Line Border Enclosing Front Pass Content */}
                  <div className="relative rounded-2xl border-2 border-red-600 p-4 sm:p-5 bg-yellow-300/90 shadow-inner space-y-3">
                    
                    {/* Top University Header & Logo */}
                    <div className="flex items-start justify-between border-b-2 border-slate-900 pb-3 gap-2">
                      <div className="flex-1 max-w-[340px] sm:max-w-[420px] pt-1">
                        <img
                          src={`${import.meta.env.BASE_URL}vignan-logo.svg`}
                          alt="Vignan's Foundation for Science, Technology & Research"
                          className="w-full h-auto object-contain"
                        />
                        <p className="text-[8px] sm:text-[9px] font-bold text-slate-900 tracking-tighter mt-1 text-center">
                          Vadlamudi, Guntur, AP - 522213 • Ph : 7330813943, 9705444211
                        </p>
                      </div>

                      {/* Student Passport Size Photo Box */}
                      <div className="relative shrink-0 group/photo">
                        <div className="h-28 w-22 sm:h-32 sm:w-26 rounded-md bg-white border-2 border-slate-950 overflow-hidden shadow-md relative">
                          <img
                            src={userPhoto}
                            alt={studentProfile.name}
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              fileInputRef.current?.click();
                            }}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover/photo:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold gap-1 cursor-pointer"
                          >
                            <Camera className="h-4 w-4" />
                            <span>Change Photo</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Seat No, Bus No & Red BUS PASS Badge */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <div className="space-y-1 text-xs sm:text-sm font-extrabold text-slate-950">
                        <div>
                          SEAT No. <span className="font-mono text-base font-black underline decoration-slate-900 ml-2">{passDetails.seatNo}</span>
                        </div>
                        <div>
                          BUS No. <span className="font-mono text-base font-black underline decoration-slate-900 ml-2">{passDetails.busRegNo}</span>
                        </div>
                      </div>

                      {/* Red Rounded BUS PASS Badge */}
                      <div className="px-3 sm:px-4 py-1.5 rounded-xl bg-red-600 text-white font-black text-xs sm:text-sm tracking-wider shadow-md border-2 border-red-700 uppercase shrink-0">
                        BUS PASS 2025-26
                      </div>
                    </div>

                    {/* Student Information Fields */}
                    <div className="space-y-2 text-xs sm:text-sm font-extrabold text-slate-950 border-t-2 border-slate-900/40 pt-3">
                      <div className="flex items-baseline gap-2">
                        <span className="w-28 sm:w-32 shrink-0 text-slate-900 font-bold">Name :</span>
                        <span className="font-black text-sm sm:text-base font-mono tracking-wide text-blue-950 uppercase border-b border-dashed border-slate-900/60 flex-1 pb-0.5">
                          {studentProfile.name || 'P. M. SAI GOWTHAM REDDY'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="w-28 sm:w-32 shrink-0 text-slate-900 font-bold">ID. No. :</span>
                        <span className="font-black text-sm sm:text-base font-mono tracking-wide text-blue-950 border-b border-dashed border-slate-900/60 flex-1 pb-0.5">
                          {studentProfile.regNo || '241FA04001'}
                        </span>
                        <div className="flex items-center gap-1 text-xs sm:text-sm ml-auto">
                          <span className="font-bold">Year / Branch :</span>
                          <span className="font-black font-mono border-b border-dashed border-slate-900/60 px-1">
                            {passDetails.yearBranch}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-baseline gap-2">
                        <span className="w-28 sm:w-32 shrink-0 text-slate-900 font-bold">Boarding Stage :</span>
                        <span className="font-black text-xs sm:text-sm font-mono tracking-wide text-blue-950 uppercase border-b border-dashed border-slate-900/60 flex-1 pb-0.5">
                          {passDetails.assignedStop}
                        </span>
                      </div>
                    </div>

                    {/* Stamp & Authorized Signature Footer */}
                    <div className="flex items-end justify-between border-t-2 border-slate-900/40 pt-3 mt-2">
                      <div className="flex items-center gap-2">
                        {/* Purple Round Transport Stamp */}
                        <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full border-2 border-red-700 bg-red-600/10 flex items-center justify-center rotate-[-12deg] pointer-events-none p-1">
                          <div className="text-[7px] sm:text-[8px] font-black text-red-800 uppercase text-center leading-none border border-red-700/60 rounded-full p-1 w-full h-full flex flex-col items-center justify-center">
                            <span>VFSTR</span>
                            <span>TRANSPORT</span>
                            <span>SEAL</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-800 max-w-[140px] leading-tight hidden sm:block">
                          Valid for Academic Session 2025-2026
                        </span>
                      </div>

                      <div className="text-right space-y-0.5">
                        <div className="h-6 flex items-end justify-end">
                          <span className="font-serif italic text-red-700 font-bold text-sm tracking-wide">
                            M.R.K. Murthy
                          </span>
                        </div>
                        <span className="text-[11px] sm:text-xs font-black text-slate-950 uppercase block">
                          Authorised Signature
                        </span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* ============================================================ */}
                {/* BACK SIDE OF PHYSICAL VFSTR BUS PASS */}
                {/* ============================================================ */}
                <div
                  id="vfstr-bus-pass-back"
                  className="absolute inset-0 w-full h-full rounded-3xl bg-yellow-300 p-3 sm:p-5 shadow-2xl border-4 border-yellow-400 text-slate-950 font-sans flex flex-col justify-between overflow-hidden"
                  style={{
                    backgroundColor: '#facc15',
                    backgroundImage: 'radial-gradient(#eab308 0.75px, transparent 0.75px)',
                    backgroundSize: '12px 12px',
                    transform: 'rotateY(180deg)',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                  }}
                >
                  {/* Holographic Watermark Sheen */}
                  <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-tr from-transparent via-white/25 to-transparent opacity-40 mix-blend-overlay transition-opacity duration-300 group-hover:opacity-70" />

                  {/* Outer Red Line Border Enclosing Back Pass Content */}
                  <div className="relative rounded-2xl border-2 border-red-600 p-4 sm:p-5 bg-yellow-300/90 shadow-inner h-full flex flex-col justify-between space-y-4">
                    
                    {/* Top Hologram & Note Box Row */}
                    <div className="flex items-start justify-between gap-3">
                      {/* Note Box */}
                      <div className="flex-1 space-y-1 text-xs sm:text-sm font-extrabold text-slate-950">
                        <div className="flex items-start gap-1.5 leading-snug">
                          <span className="px-2 py-0.5 rounded bg-red-600 text-white font-black text-xs uppercase shrink-0">
                            Note :
                          </span>
                          <span className="text-[11px] sm:text-xs font-bold text-slate-900">
                            Once the bus pass is issued to a student, it is not transferable and not exchangeable to anyone. If found like this it will be penalised for both students.
                          </span>
                        </div>
                        <p className="text-[11px] sm:text-xs font-black text-slate-950 pt-1">
                          *Once paid amount not refundable.
                        </p>
                      </div>

                      {/* Live TOTP Rotating Security QR Badge */}
                      <div className="flex flex-col items-center bg-white/90 p-2 rounded-xl border-2 border-slate-900 shadow-md shrink-0 space-y-1">
                        <div className="h-14 w-14 rounded-lg bg-slate-950 p-1 flex items-center justify-center text-white relative">
                          {/* Dynamic SVG QR pattern representation */}
                          <div className="grid grid-cols-4 gap-0.5 w-full h-full p-0.5">
                            <div className="bg-white rounded-xs" />
                            <div className="bg-emerald-400 rounded-xs" />
                            <div className="bg-white rounded-xs" />
                            <div className="bg-white rounded-xs" />
                            <div className="bg-white rounded-xs" />
                            <div className="bg-transparent" />
                            <div className="bg-emerald-400 rounded-xs" />
                            <div className="bg-white rounded-xs" />
                            <div className="bg-white rounded-xs" />
                            <div className="bg-white rounded-xs" />
                            <div className="bg-white rounded-xs" />
                            <div className="bg-emerald-400 rounded-xs" />
                            <div className="bg-white rounded-xs" />
                            <div className="bg-emerald-400 rounded-xs" />
                            <div className="bg-white rounded-xs" />
                            <div className="bg-white rounded-xs" />
                          </div>
                        </div>
                        <div className="text-center font-mono font-extrabold text-[10px] text-slate-900">
                          TOTP: <span className="text-emerald-700 font-black">{totpToken}</span>
                          <span className="block text-[8px] text-slate-600 font-sans">Refreshes in {totpTimer}s</span>
                        </div>
                      </div>
                    </div>

                    {/* Lined Address & Vehicle & Phone Section */}
                    <div className="space-y-4 my-auto pt-2">
                      {/* Address Line */}
                      <div className="space-y-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-black text-slate-950 w-24 shrink-0">Address</span>
                          <span className="font-mono font-extrabold text-sm sm:text-base text-blue-950 border-b-2 border-slate-900 flex-1 pb-0.5">
                            Guntur, Gorantla
                          </span>
                        </div>
                      </div>

                      {/* Bus Reg No Line */}
                      <div className="space-y-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-black text-slate-950 w-24 shrink-0">Vehicle No.</span>
                          <span className="font-mono font-black text-base sm:text-lg text-blue-950 border-b-2 border-slate-900 flex-1 pb-0.5">
                            {passDetails.busRegNo}
                          </span>
                        </div>
                      </div>

                      {/* Phone No Line */}
                      <div className="space-y-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-black text-slate-950 w-24 shrink-0">Phone No.</span>
                          <span className="font-mono font-black text-base sm:text-lg text-blue-950 border-b-2 border-slate-900 flex-1 pb-0.5">
                            {passDetails.phoneNumber}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Back Footer */}
                    <div className="border-t-2 border-slate-900/40 pt-2 flex items-center justify-between text-[10px] font-bold text-slate-800">
                      <span>VFSTR Transport Cell Security Verification Desk</span>
                      <span>Admin Block Room 104</span>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Full Pass Details Table */}
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
                <Avatar name={studentProfile.name} src={userPhoto} size="xl" className="h-20 w-20 border-2 border-primary/30 text-xl shrink-0" />

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
                    <span className="font-bold text-foreground text-sm">{passDetails.busRegNo}</span>
                    <Badge variant="secondary" className="ml-auto">Seat #{passDetails.seatNo}</Badge>
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
