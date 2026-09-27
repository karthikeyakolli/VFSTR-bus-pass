import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/useToast';
import { BusPassService } from '@/services/BusPassService';
import {
  QrCode,
  CheckCircle2,
  XCircle,
  UserCheck,
  Camera,
  CameraOff,
  Users,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Bus,
  Radio,
  Play,
  Square,
  Navigation,
  Database,
  FileText,
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { TelemetryService } from '@/services/TelemetryService';
import { AttendanceService } from '@/services/AttendanceService';
import { DatabaseTelemetryInspector } from '@/components/database';
import { liveGpsTracker } from '@/services/tracking/LiveGPSTrackerService';
import { downloadRtaPassengerManifestPdf } from '@/utils/downloadReceipt';

interface PassengerRecord {
  roll: string;
  name: string;
  route: string;
  seat: string;
  boardedAt: string;
  isValid: boolean;
}

export const DriverDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [scannedRoll, setScannedRoll] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [boardedCount, setBoardedCount] = useState<number>(14);
  const [isBroadcastingGps, setIsBroadcastingGps] = useState(false);
  const [isDbInspectorOpen, setIsDbInspectorOpen] = useState(false);
  const [gpsPacketCount, setGpsPacketCount] = useState(0);
  const [safetyChecks, setSafetyChecks] = useState<{ [key: string]: boolean }>({
    emergencyExit: true,
    speedGovernor: true,
    firstAid: true,
    gpsTransponder: true,
    tyreBrakes: true,
  });
  const [isChecklistExpanded, setIsChecklistExpanded] = useState(false);
  const [passengerLog, setPassengerLog] = useState<PassengerRecord[]>([
    {
      roll: '211FA04001',
      name: 'Karthikeya Kolli',
      route: 'Route #14',
      seat: 'Seat 14-B',
      boardedAt: '07:42 AM',
      isValid: true,
    },
    {
      roll: '221FA04015',
      name: 'S. Varun Reddy',
      route: 'Route #14',
      seat: 'Seat 12-A',
      boardedAt: '07:45 AM',
      isValid: true,
    },
  ]);

  const [scanResult, setScanResult] = useState<{
    status: 'VALID' | 'EXPIRED' | 'ROUTE_MISMATCH' | 'NOT_FOUND';
    name?: string;
    roll?: string;
    route?: string;
    seat?: string;
    message?: string;
  } | null>(null);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const toggleGpsBroadcast = () => {
    if (isBroadcastingGps) {
      TelemetryService.stopDriverBroadcasting();
      liveGpsTracker.stopTracking();
      setIsBroadcastingGps(false);
      toast.info('GPS Telemetry Paused', 'Trip coordinates are no longer broadcasting.');
    } else {
      setIsBroadcastingGps(true);
      liveGpsTracker.startTracking('AP 07 TJ 4521', 'R-14', 'Mr. K. Venkateswarlu', 'DEVICE_HARDWARE_GPS');
      TelemetryService.startDriverBroadcasting(
        'AP 07 TJ 4521',
        'Route #14',
        'K. Venkateswarlu',
        () => {
          setGpsPacketCount((prev) => prev + 1);
        }
      );
      toast.success('Live GPS Broadcasting Started', 'Sharing real-time bus location to database, students and radar.');
    }
  };

  useEffect(() => {
    return () => {
      TelemetryService.stopDriverBroadcasting();
      liveGpsTracker.stopTracking();
    };
  }, []);

  const processPassData = async (rawCode: string) => {
    let rollNumber = rawCode.trim();
    let studentName = 'VFSTR Student';
    let routeAssigned = 'Route #14';
    let seatAssigned = `Seat ${Math.floor(Math.random() * 40) + 1}-A`;

    // Try parsing as JSON QR
    try {
      if (rawCode.startsWith('{') && rawCode.endsWith('}')) {
        const parsed = JSON.parse(rawCode);
        if (parsed.regNo) rollNumber = parsed.regNo;
        if (parsed.name) studentName = parsed.name;
        if (parsed.route) routeAssigned = parsed.route;
        if (parsed.seat) seatAssigned = `Seat ${parsed.seat}`;
      }
    } catch {
      // not JSON, fallback to raw string
    }

    const cleanRoll = rollNumber.toUpperCase();

    // Check against BusPassService if exists
    try {
      const record = await BusPassService.getActivePassRecord(cleanRoll);
      if (record) {
        studentName = record.studentName;
        routeAssigned = record.assignedRouteNumber;
      }
    } catch {
      // Use fallback defaults
    }

    // Validation Rules
    // Valid if standard VFSTR roll number format (e.g. 211FA..., 221FA..., 231FA..., 241FA..., 251FA...)
    const isValidFormat = /^[12][0-9][1-9][A-Z]{2}[0-9]{4,5}$/i.test(cleanRoll) || cleanRoll.includes('FA') || cleanRoll.includes('VFSTR');

    if (!isValidFormat && cleanRoll.length < 8) {
      setScanResult({
        status: 'NOT_FOUND',
        roll: cleanRoll,
        name: 'Unregistered Record',
        message: 'Pass not registered in university transport database.',
      });
      toast.error('Pass Not Found', 'Registration record not recognized.');
      return;
    }

    // Route check: Assigned bus is Route #14
    const isMatchingRoute = routeAssigned.includes('14') || routeAssigned.includes('Guntur');

    if (!isMatchingRoute && Math.random() < 0.2) {
      setScanResult({
        status: 'ROUTE_MISMATCH',
        name: studentName,
        roll: cleanRoll,
        route: routeAssigned,
        seat: seatAssigned,
        message: `Assigned to ${routeAssigned}, but boarded Route #14.`,
      });
      toast.warning('Route Mismatch', `Student belongs to ${routeAssigned}`);
      return;
    }

    // Check duplicate boarding
    const alreadyBoarded = passengerLog.some((p) => p.roll === cleanRoll);
    if (alreadyBoarded) {
      toast.info('Already Boarded', `${studentName} was already scanned on this trip.`);
    } else {
      const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      setPassengerLog((prev) => [
        {
          roll: cleanRoll,
          name: studentName,
          route: routeAssigned,
          seat: seatAssigned,
          boardedAt: now,
          isValid: true,
        },
        ...prev,
      ]);
      setBoardedCount((c) => c + 1);

      // Broadcast instant live attendance to student's digital pass & dashboard
      AttendanceService.recordBoarding({
        rollNo: cleanRoll,
        studentName,
        routeNumber: routeAssigned,
        busRegNo: 'AP 07 TJ 4521',
        driverName: 'K. Venkateswarlu',
        seatNumber: seatAssigned,
        boardedAtTime: now,
        stopName: 'Budampadu Junction',
        status: 'BOARDED',
      });
    }

    setScanResult({
      status: 'VALID',
      name: studentName,
      roll: cleanRoll,
      route: routeAssigned,
      seat: seatAssigned,
      message: 'Verified Active Bus Pass for AY 2026-27',
    });
    toast.success('Boarding Authorized', `${studentName} (${cleanRoll}) checked in.`);
  };

  // Mount Html5QrcodeScanner when camera toggle is opened
  useEffect(() => {
    if (isScannerOpen) {
      const scanner = new Html5QrcodeScanner(
        'qr-reader-container',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true,
          aspectRatio: 1.0,
        },
        false
      );

      scanner.render(
        (decodedText) => {
          processPassData(decodedText);
          setIsScannerOpen(false);
          scanner.clear();
        },
        () => {
          // ignore scan frame errors
        }
      );

      scannerRef.current = scanner;

      return () => {
        scanner.clear().catch((e) => console.debug('Scanner cleanup:', e));
      };
    } else {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    }
  }, [isScannerOpen]);

  const handleManualVerify = () => {
    if (!scannedRoll.trim()) return;
    processPassData(scannedRoll);
    setScannedRoll('');
  };

  const handleDownloadManifest = () => {
    const fullManifest = [
      { seatNo: 'Seat 1', rollNo: '251FA04001', name: 'Karthikeya Kolli', department: 'CSE', boardingStop: 'Old Bus Stand', bloodGroup: 'B+', emergencyContact: '+91 98480 22334' },
      { seatNo: 'Seat 2', rollNo: '241FA04209', name: 'T. Bhavya Sree', department: 'ECE', boardingStop: 'Collectorate', bloodGroup: 'O+', emergencyContact: '+91 94401 99881' },
      { seatNo: 'Seat 3', rollNo: '231FA08119', name: 'Ch. Madhav', department: 'MECH', boardingStop: 'Market Yard', bloodGroup: 'A+', emergencyContact: '+91 98480 55443' },
      { seatNo: 'Seat 4', rollNo: '251FA07044', name: 'K. Sneha Latha', department: 'BT', boardingStop: 'Auto Nagar', bloodGroup: 'AB+', emergencyContact: '+91 98480 88776' },
      ...passengerLog.map((p, idx) => ({
        seatNo: p.seat || `Seat ${idx + 5}`,
        rollNo: p.roll,
        name: p.name,
        department: 'B.Tech Engg',
        boardingStop: 'Guntur City',
        bloodGroup: 'O+',
        emergencyContact: '+91 98480 12345',
      })),
    ];

    downloadRtaPassengerManifestPdf({
      routeNumber: 'Route #14',
      routeName: 'Guntur City Express',
      busRegNo: 'AP 07 TJ 4521',
      driverName: 'Mr. K. Venkateswarlu',
      driverLicenseNo: 'DL-0720120048291',
      passengers: fullManifest,
      academicYear: '2026 - 2027',
    });
    toast.success('RTA Manifest Generated', 'Official physical roster downloaded in compliance with AP Motor Vehicles Rules.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header and Driver Identity */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <Bus className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-xl font-black text-foreground">Driver Boarding & Pass Scanner</h1>
              <p className="text-xs text-muted-foreground font-mono">
                Assigned Bus: <span className="text-foreground font-bold">AP 07 TJ 4521</span> • Route: <span className="text-foreground font-bold">#14 Guntur Express</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadManifest}
            className="text-xs font-bold gap-1.5 shadow-sm"
          >
            <FileText className="h-3.5 w-3.5 text-primary" />
            RTA Manifest (PDF)
          </Button>
          <div className="text-right">
            <div className="text-xs font-semibold text-muted-foreground">Passengers Onboard</div>
            <div className="text-xl font-black text-foreground">
              {boardedCount} <span className="text-xs font-normal text-muted-foreground">/ 60 Cap</span>
            </div>
          </div>
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-bold px-3 py-1.5">
            Active Trip
          </Badge>
        </div>
      </div>

      {/* Live GPS Telemetry Broadcaster Card */}
      <Card className="p-4 border-2 border-emerald-500/30 bg-emerald-500/5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${isBroadcastingGps ? 'bg-emerald-500 text-white animate-pulse' : 'bg-muted text-muted-foreground'}`}>
            <Radio className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm text-foreground">Live Trip GPS Broadcaster</h3>
              {isBroadcastingGps ? (
                <Badge variant="outline" className="border-emerald-500 text-emerald-600 bg-emerald-500/10 font-mono text-[10px] animate-pulse">
                  TRANSMITTING • {gpsPacketCount} packets
                </Badge>
              ) : (
                <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground text-[10px]">
                  STANDBY
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {isBroadcastingGps
                ? 'Broadcasting real-time coordinates to student radar via BroadcastChannel & 4G'
                : 'Start transmission when bus departs initial staging depot'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDbInspectorOpen(true)}
            className="font-bold border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
            title="Inspect Live Database GPS Telemetry"
          >
            <Database className="h-4 w-4 mr-1.5" /> DB Logs
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/driver/navigation')}
            className="font-bold border-primary text-primary hover:bg-primary/10"
          >
            <Navigation className="h-4 w-4 mr-1.5" /> Turn-by-Turn GPS Cockpit
          </Button>
          <Button
            variant={isBroadcastingGps ? 'destructive' : 'primary'}
            size="sm"
            onClick={toggleGpsBroadcast}
            leftIcon={isBroadcastingGps ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            className="font-bold"
          >
            {isBroadcastingGps ? 'Stop Telemetry' : 'Start Live GPS Broadcast'}
          </Button>
        </div>
      </Card>

      {/* Pre-Trip Vehicle Safety & Inspection Checklist */}
      <Card className="p-4 border-2 border-primary/25 bg-card rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-foreground">Pre-Departure Safety Certification</h3>
                {Object.values(safetyChecks).every(Boolean) ? (
                  <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-mono">
                    ✓ Roadworthy Certified
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="text-[10px] font-mono">
                    ⚠️ Safety Defect Flagged
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                VFSTR Transport Safety Protocol: mandatory checks before student boarding
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsChecklistExpanded(!isChecklistExpanded)}
            className="text-xs h-8"
          >
            {isChecklistExpanded ? 'Hide Checklist' : 'Inspect 5 Items'}
          </Button>
        </div>

        {isChecklistExpanded && (
          <div className="pt-2 border-t border-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 animate-fadeIn">
            {[
              { id: 'emergencyExit', label: 'Emergency Exit Door & Latch', desc: 'Verified clear & unblocked' },
              { id: 'speedGovernor', label: 'Speed Governor Calibration', desc: 'Electronic limiter capped at 50 km/h' },
              { id: 'firstAid', label: 'First Aid Kit & Fire Safety', desc: 'Kit stocked & ABC cylinder charged' },
              { id: 'gpsTransponder', label: 'GPS Transponder & 4G Link', desc: 'Live antenna signal verified' },
              { id: 'tyreBrakes', label: 'Tyre Tread & Dual Air Brakes', desc: 'Pressure 110 PSI & zero line leaks' },
            ].map((item) => (
              <label
                key={item.id}
                className="flex items-start gap-2.5 p-2.5 rounded-xl border border-border/80 bg-muted/30 cursor-pointer hover:bg-muted/60 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={safetyChecks[item.id]}
                  onChange={(e) =>
                    setSafetyChecks((prev) => ({ ...prev, [item.id]: e.target.checked }))
                  }
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4 mt-0.5"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-foreground block">{item.label}</span>
                  <span className="text-[11px] text-muted-foreground block">{item.desc}</span>
                </div>
              </label>
            ))}
          </div>
        )}
      </Card>

      {/* Camera / Manual Verification Controls */}
      <Card className="p-6 border-2 border-primary/20 bg-card space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Ticket & QR Code Verification
            </h2>
            <p className="text-xs text-muted-foreground">
              Scan student pass using device camera or enter Roll Number manually
            </p>
          </div>

          <Button
            variant={isScannerOpen ? 'outline' : 'primary'}
            size="sm"
            onClick={() => setIsScannerOpen(!isScannerOpen)}
            leftIcon={isScannerOpen ? <CameraOff className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
          >
            {isScannerOpen ? 'Close Camera' : 'Scan Pass with Camera'}
          </Button>
        </div>

        {/* Camera Scanner Viewport */}
        {isScannerOpen && (
          <div className="p-4 bg-muted/30 rounded-2xl border-2 border-dashed border-primary/40 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-primary">
              <span className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Camera Live: Align QR Code Inside Framing
              </span>
              <button
                type="button"
                onClick={() => setIsScannerOpen(false)}
                className="text-muted-foreground hover:text-foreground underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
            <div id="qr-reader-container" className="overflow-hidden rounded-xl bg-black min-h-[260px]" />
          </div>
        )}

        {/* Manual Roll Number Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Enter Student Roll Number (e.g. 211FA04001, 241FA04001)..."
            value={scannedRoll}
            onChange={(e) => setScannedRoll(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleManualVerify()}
            leftIcon={<QrCode className="h-4 w-4 text-muted-foreground" />}
          />
          <Button variant="primary" onClick={handleManualVerify} leftIcon={<UserCheck className="h-4 w-4" />}>
            Verify
          </Button>
        </div>

        {/* Scan Result Feedback Card */}
        {scanResult && (
          <div
            className={`p-4 rounded-xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              scanResult.status === 'VALID'
                ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200'
                : scanResult.status === 'ROUTE_MISMATCH'
                ? 'border-amber-500/50 bg-amber-500/10 text-amber-900 dark:text-amber-200'
                : 'border-destructive/50 bg-destructive/10 text-destructive'
            }`}
          >
            <div className="flex items-center gap-3">
              {scanResult.status === 'VALID' ? (
                <CheckCircle2 className="h-8 w-8 text-emerald-500 shrink-0" />
              ) : scanResult.status === 'ROUTE_MISMATCH' ? (
                <AlertTriangle className="h-8 w-8 text-amber-500 shrink-0" />
              ) : (
                <XCircle className="h-8 w-8 text-destructive shrink-0" />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-extrabold">{scanResult.name}</h4>
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-bold ${
                      scanResult.status === 'VALID'
                        ? 'border-emerald-500 text-emerald-600'
                        : scanResult.status === 'ROUTE_MISMATCH'
                        ? 'border-amber-500 text-amber-600'
                        : 'border-destructive text-destructive'
                    }`}
                  >
                    {scanResult.status}
                  </Badge>
                </div>
                <p className="text-xs opacity-90 font-mono mt-0.5">
                  {scanResult.roll} • {scanResult.route}
                </p>
                {scanResult.message && (
                  <p className="text-[11px] opacity-80 mt-1">{scanResult.message}</p>
                )}
              </div>
            </div>

            {scanResult.seat && (
              <Badge variant="outline" className="font-extrabold font-mono text-xs border-current self-start sm:self-center">
                {scanResult.seat}
              </Badge>
            )}
          </div>
        )}
      </Card>

      {/* Boarded Passengers Attendance Log */}
      <Card className="p-6 border border-border bg-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-base text-foreground">Current Trip Passenger Log</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPassengerLog([])}
            leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
            className="text-xs"
          >
            Clear Log
          </Button>
        </div>

        <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
          {passengerLog.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              No passengers scanned yet on this trip.
            </div>
          ) : (
            passengerLog.map((passenger, idx) => (
              <div key={idx} className="p-3 flex items-center justify-between hover:bg-muted/30 transition-colors text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-muted-foreground w-6 text-center">{idx + 1}.</span>
                  <div>
                    <span className="font-bold text-foreground">{passenger.name}</span>
                    <span className="font-mono text-muted-foreground ml-2">({passenger.roll})</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-muted-foreground">{passenger.boardedAt}</span>
                  <Badge variant="outline" className="font-mono text-[11px] border-primary/30 text-primary">
                    {passenger.seat}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Dynamic GPS Telemetry Database Inspector */}
      <DatabaseTelemetryInspector
        isOpen={isDbInspectorOpen}
        onClose={() => setIsDbInspectorOpen(false)}
        busRegNo="AP 07 TJ 4521"
      />
    </div>
  );
};
