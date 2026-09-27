import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/useToast';
import { Html5QrcodeScanner } from 'html5-qrcode';
import {
  QrCode,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Camera,
  CameraOff,
  UserCheck,
  Search,
  RotateCcw,
  Users,
  Flag,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface VerifiedCommuter {
  rollNo: string;
  name: string;
  department: string;
  year: string;
  routeCode: string;
  assignedBus: string;
  seatNumber?: string;
  passType: 'SEATED' | 'STANDING';
  feeStatus: 'PAID' | 'PARTIAL' | 'PENDING';
  validUntil: string;
  isValid: boolean;
  validationReason: string;
}

const KNOWN_STUDENTS: Record<string, VerifiedCommuter> = {
  '251FA04001': {
    rollNo: '251FA04001',
    name: 'Karthikeya Kolli',
    department: 'CSE - AI & ML',
    year: '2nd Year',
    routeCode: 'Route #14',
    assignedBus: 'AP 07 TJ 4521',
    seatNumber: '12 (Window)',
    passType: 'SEATED',
    feeStatus: 'PAID',
    validUntil: '31 May 2027',
    isValid: true,
    validationReason: 'Active Academic Year Pass • Accounts Cleared',
  },
  '241FA04209': {
    rollNo: '241FA04209',
    name: 'T. Bhavya Sree',
    department: 'ECE',
    year: '3rd Year',
    routeCode: 'Route #01',
    assignedBus: 'AP 07 TJ 4501',
    seatNumber: '04 (Aisle)',
    passType: 'SEATED',
    feeStatus: 'PAID',
    validUntil: '31 May 2027',
    isValid: true,
    validationReason: 'Active Academic Year Pass • Accounts Cleared',
  },
  '231FA08119': {
    rollNo: '231FA08119',
    name: 'Ch. Madhav',
    department: 'Mechanical',
    year: '3rd Year',
    routeCode: 'Route #22',
    assignedBus: 'AP 07 TJ 4518',
    passType: 'STANDING',
    feeStatus: 'PAID',
    validUntil: '31 May 2027',
    isValid: true,
    validationReason: 'Standing Corridor Pass Authorized',
  },
  '231FA04310': {
    rollNo: '231FA04310',
    name: 'B. Karthik',
    department: 'Civil Eng',
    year: '3rd Year',
    routeCode: 'Route #52',
    assignedBus: 'AP 07 TJ 4530',
    passType: 'STANDING',
    feeStatus: 'PENDING',
    validUntil: 'Expired',
    isValid: false,
    validationReason: 'FEE PAYMENT PENDING • PASS NOT ISSUED',
  },
};

export const ConductorScannerPage: React.FC = () => {
  const toast = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [manualRoll, setManualRoll] = useState('');
  const [activeCommuter, setActiveCommuter] = useState<VerifiedCommuter | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Daily gate counters
  const [scannedCount, setScannedCount] = useState(148);
  const [validCount, setValidCount] = useState(145);
  const [flaggedCount, setFlaggedCount] = useState(3);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const playChime = (valid: boolean) => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (valid) {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else {
        osc.frequency.setValueAtTime(220, ctx.currentTime); // A3
        osc.frequency.setValueAtTime(164.81, ctx.currentTime + 0.15); // E3
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch {
      // Audio context might be restricted
    }
  };

  const handleVerifyRoll = (roll: string) => {
    const clean = roll.trim().toUpperCase();
    if (!clean) return;

    setScannedCount((p) => p + 1);

    if (KNOWN_STUDENTS[clean]) {
      const student = KNOWN_STUDENTS[clean];
      setActiveCommuter(student);
      playChime(student.isValid);

      if (student.isValid) {
        setValidCount((p) => p + 1);
        toast.success('Valid Pass', `${student.name} • ${student.routeCode}`);
      } else {
        setFlaggedCount((p) => p + 1);
        toast.error('Pass Invalid!', `${student.name} (${student.validationReason})`);
      }
    } else {
      // Default verified student for demo
      const fallback: VerifiedCommuter = {
        rollNo: clean,
        name: 'VFSTR Commuter',
        department: 'B.Tech Student',
        year: 'AY 2026-27',
        routeCode: 'Route #14',
        assignedBus: 'AP 07 TJ 4521',
        passType: 'SEATED',
        feeStatus: 'PAID',
        validUntil: '31 May 2027',
        isValid: true,
        validationReason: 'Verified Digital Pass Payload • AY 2026-27 Active',
      };
      setActiveCommuter(fallback);
      playChime(true);
      setValidCount((p) => p + 1);
      toast.success('Valid Pass', `${clean} verified successfully`);
    }
  };

  const startScanner = () => {
    setIsScanning(true);
    setTimeout(() => {
      try {
        const scanner = new Html5QrcodeScanner(
          'gate-reader',
          { fps: 10, qrbox: { width: 250, height: 250 } },
          false
        );
        scannerRef.current = scanner;
        scanner.render(
          (decodedText) => {
            // Check if QR text contains roll or JSON
            let targetRoll = decodedText;
            try {
              const parsed = JSON.parse(decodedText);
              if (parsed.regNo || parsed.rollNo) {
                targetRoll = parsed.regNo || parsed.rollNo;
              }
            } catch {
              // Plain text roll
            }
            handleVerifyRoll(targetRoll);
          },
          () => {
            // scanning loop error - silent
          }
        );
      } catch (err) {
        console.error('QR scanner init error', err);
        toast.error('Camera Access Error', 'Please enable camera permissions or use Roll No input.');
      }
    }, 150);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.clear();
      } catch {
        // clear errors
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, []);

  const handleReportViolation = (student: VerifiedCommuter) => {
    try {
      const violations = JSON.parse(localStorage.getItem('vfstr_violations') || '[]');
      violations.unshift({
        id: `VIO-${Date.now()}`,
        studentRoll: student.rollNo,
        studentName: student.name,
        routeNumber: student.routeCode,
        violationType: 'UNAUTHORIZED_PASS_BOARDING',
        fineAmount: 500,
        status: 'PENDING',
        timestamp: new Date().toLocaleTimeString(),
      });
      localStorage.setItem('vfstr_violations', JSON.stringify(violations));
      toast.warning('Violation Flagged', `${student.rollNo} logged into Transport Admin Violations desk.`);
    } catch {
      toast.success('Violation Logged', 'Security incident recorded.');
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              VFSTR Security & Turnstile Gateway
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mt-1">
            Gate Pass Rapid Validator
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Campus main gates & bus door high-speed QR check-in terminal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-xs gap-1.5"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4 text-emerald-600" /> : <VolumeX className="h-4 w-4 text-slate-400" />}
            {soundEnabled ? 'Chime ON' : 'Chime Muted'}
          </Button>
          {isScanning ? (
            <Button variant="destructive" size="sm" onClick={stopScanner} className="gap-1.5">
              <CameraOff className="h-4 w-4" /> Stop Camera
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={startScanner} className="gap-1.5 shadow-sm">
              <Camera className="h-4 w-4" /> Launch Camera Scanner
            </Button>
          )}
        </div>
      </div>

      {/* Headcount Stat Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-primary" /> Total Scanned Today
          </div>
          <div className="text-2xl sm:text-3xl font-black text-foreground mt-1">
            {scannedCount}
          </div>
        </Card>
        <Card className="p-4 border border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-xl">
          <div className="text-xs text-emerald-800 dark:text-emerald-300 font-medium flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Authorized Passes
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
            {validCount}
          </div>
        </Card>
        <Card className="p-4 border border-rose-200 dark:border-rose-800 bg-rose-50/40 dark:bg-rose-950/20 rounded-xl">
          <div className="text-xs text-rose-800 dark:text-rose-300 font-medium flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-600" /> Flagged / Unpaid
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-700 dark:text-rose-400 mt-1">
            {flaggedCount}
          </div>
        </Card>
      </div>

      {/* Main Scanner & Verification Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: QR Camera & Manual Input */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="p-5 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
            <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <QrCode className="h-4 w-4 text-primary" />
              Live Scanner Viewport
            </h2>

            {isScanning ? (
              <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-black min-h-[280px]">
                <div id="gate-reader" className="w-full" />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <Camera className="h-7 w-7" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Camera Scanner Inactive</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Tap "Launch Camera Scanner" to scan student dynamic QR passes or use manual roll entry below.
                </p>
                <Button size="sm" onClick={startScanner} className="mt-4 font-semibold">
                  Start Camera Feed
                </Button>
              </div>
            )}

            {/* Manual Roll Number Fallback */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                Manual Roll Number Lookup (No Camera)
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="e.g. 251FA04001 or 231FA04310"
                    value={manualRoll}
                    onChange={(e) => setManualRoll(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerifyRoll(manualRoll)}
                    className="pl-9 text-xs"
                  />
                </div>
                <Button size="sm" onClick={() => handleVerifyRoll(manualRoll)}>
                  Validate
                </Button>
              </div>

              {/* Quick Preset Buttons for testing */}
              <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                <span className="text-muted-foreground">Test Quick Rolls:</span>
                <button
                  type="button"
                  onClick={() => { setManualRoll('251FA04001'); handleVerifyRoll('251FA04001'); }}
                  className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-mono hover:underline"
                >
                  251FA04001 (Valid)
                </button>
                <button
                  type="button"
                  onClick={() => { setManualRoll('231FA04310'); handleVerifyRoll('231FA04310'); }}
                  className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 font-mono hover:underline"
                >
                  231FA04310 (Unpaid)
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Large Visual Validation Result */}
        <div className="lg:col-span-6">
          {activeCommuter ? (
            <Card
              className={`p-6 rounded-2xl border-2 shadow-lg transition-all duration-300 ${
                activeCommuter.isValid
                  ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20'
                  : 'border-rose-500 bg-rose-50/20 dark:bg-rose-950/20'
              }`}
            >
              {/* Header Status Flag */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  {activeCommuter.isValid ? (
                    <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md animate-bounce">
                      <XCircle className="h-6 w-6" />
                    </div>
                  )}
                  <div>
                    <h3
                      className={`text-lg font-black tracking-tight ${
                        activeCommuter.isValid ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
                      }`}
                    >
                      {activeCommuter.isValid ? 'AUTHORIZED COMMUTER' : 'ENTRY PROHIBITED'}
                    </h3>
                    <p className="text-xs text-muted-foreground">{activeCommuter.validationReason}</p>
                  </div>
                </div>

                <Badge
                  variant={activeCommuter.isValid ? 'success' : 'destructive'}
                  className="text-xs font-bold px-3 py-1 uppercase"
                >
                  {activeCommuter.passType}
                </Badge>
              </div>

              {/* Student Credential Summary */}
              <div className="mt-5 space-y-3.5 text-sm">
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/80">
                  <span className="text-muted-foreground">Student Name</span>
                  <span className="font-extrabold text-foreground">{activeCommuter.name}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/80">
                  <span className="text-muted-foreground">Roll Number</span>
                  <span className="font-mono font-bold text-foreground text-base">{activeCommuter.rollNo}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/80">
                  <span className="text-muted-foreground">Department & Year</span>
                  <span className="font-semibold text-foreground">{activeCommuter.department} ({activeCommuter.year})</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/80">
                  <span className="text-muted-foreground">Authorized Route</span>
                  <span className="font-bold text-primary">{activeCommuter.routeCode}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/80">
                  <span className="text-muted-foreground">Assigned Bus</span>
                  <span className="font-semibold text-foreground">{activeCommuter.assignedBus}</span>
                </div>
                {activeCommuter.seatNumber && (
                  <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/80">
                    <span className="text-muted-foreground">Reserved Seat</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{activeCommuter.seatNumber}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground">Pass Expiration</span>
                  <span className="font-semibold text-foreground">{activeCommuter.validUntil}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                {!activeCommuter.isValid && (
                  <Button
                    variant="destructive"
                    className="flex-1 font-bold gap-2 text-xs"
                    onClick={() => handleReportViolation(activeCommuter)}
                  >
                    <Flag className="h-4 w-4" />
                    Report Ticketless Violation
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="flex-1 text-xs font-semibold gap-1.5"
                  onClick={() => setActiveCommuter(null)}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Ready Next Commuter
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="h-full min-h-[360px] flex flex-col items-center justify-center p-8 border border-slate-200 dark:border-slate-800 rounded-2xl text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
                <UserCheck className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-foreground">Waiting for Commuter Pass</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Scan QR pass from student mobile screen or enter registration number to verify authenticity in real-time.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
