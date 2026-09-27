import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/hooks/useToast';
import { RealTimeTransitMap } from '@/components/map';
import { MASTER_ROUTES_AY2026_27 } from '@/constants/masterRoutesSeed';
import {
  ShieldCheck,
  Search,
  User,
  Bus,
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  Bell,
  MessageCircle,
  Navigation,
  Compass,
  RefreshCw,
} from 'lucide-react';

interface WardTransitInfo {
  rollNo: string;
  name: string;
  department: string;
  academicYear: string;
  routeCode: string;
  routeName: string;
  busRegNo: string;
  driverName: string;
  driverPhone: string;
  pickupStop: string;
  scheduledPickupTime: string;
  eveningDropTime: string;
  boardingStatus: 'boarded' | 'waiting' | 'arrived_campus' | 'not_boarded';
  boardedAtTime?: string;
  currentSpeed: number;
  etaToNextStop: string;
  nextStop: string;
}

const DEMO_WARDS: Record<string, WardTransitInfo> = {
  '251FA04001': {
    rollNo: '251FA04001',
    name: 'Karthikeya Kolli',
    department: 'Computer Science & Engineering',
    academicYear: '2nd Year B.Tech',
    routeCode: 'Route #14',
    routeName: 'Guntur City Express',
    busRegNo: 'AP 07 TJ 4521',
    driverName: 'K. Venkateswarlu',
    driverPhone: '+91 98480 22334',
    pickupStop: 'Old Bus Stand, Guntur',
    scheduledPickupTime: '07:15 AM',
    eveningDropTime: '05:30 PM',
    boardingStatus: 'boarded',
    boardedAtTime: '07:12 AM Today',
    currentSpeed: 44,
    etaToNextStop: '4 mins',
    nextStop: 'Kakani Junction',
  },
  '241FA04209': {
    rollNo: '241FA04209',
    name: 'T. Bhavya Sree',
    department: 'Electronics & Communication',
    academicYear: '3rd Year B.Tech',
    routeCode: 'Route #01',
    routeName: 'Vijayawada Superfast',
    busRegNo: 'AP 07 TJ 4501',
    driverName: 'M. Sambasiva Rao',
    driverPhone: '+91 98480 99881',
    pickupStop: 'Benz Circle, Vijayawada',
    scheduledPickupTime: '06:50 AM',
    eveningDropTime: '05:45 PM',
    boardingStatus: 'boarded',
    boardedAtTime: '06:53 AM Today',
    currentSpeed: 52,
    etaToNextStop: '8 mins',
    nextStop: 'Mangalagiri Bypass',
  },
};

export const ParentTrackingPage: React.FC = () => {
  const toast = useToast();
  const [searchRoll, setSearchRoll] = useState('251FA04001');
  const [currentWard, setCurrentWard] = useState<WardTransitInfo | null>(DEMO_WARDS['251FA04001']);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Notification Preferences
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [arrivalProximityAlert, setArrivalProximityAlert] = useState(true);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchRoll.trim().toUpperCase();
    if (DEMO_WARDS[query]) {
      setCurrentWard(DEMO_WARDS[query]);
      toast.success('Ward Found', `Loaded live transit details for ${DEMO_WARDS[query].name}`);
    } else {
      // Fallback template for any entered roll
      setCurrentWard({
        rollNo: query,
        name: 'Student Commuter',
        department: 'B.Tech Student',
        academicYear: 'AY 2026-27',
        routeCode: 'Route #14',
        routeName: 'Guntur City Express',
        busRegNo: 'AP 07 TJ 4521',
        driverName: 'K. Venkateswarlu',
        driverPhone: '+91 98480 22334',
        pickupStop: 'Guaranteed Campus Route Stop',
        scheduledPickupTime: '07:15 AM',
        eveningDropTime: '05:30 PM',
        boardingStatus: 'boarded',
        boardedAtTime: '07:15 AM Today',
        currentSpeed: 38,
        etaToNextStop: '6 mins',
        nextStop: 'Highway Junction',
      });
      toast.info('Student Record Loaded', `Displaying active transit session for ${query}`);
    }
  };

  const handleRefreshTelemetry = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Telemetry Refreshed', 'GPS satellite coordinates updated.');
    }, 600);
  };

  const handleSendTestSms = () => {
    toast.success('WhatsApp/SMS Dispatched', `Simulated SMS sent to registered parent number: "VFSTR Transit: Bus ${currentWard?.busRegNo} is 2 stops away from ${currentWard?.pickupStop}."`);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-vfstr-burgundy-900 via-primary to-vfstr-burgundy-800 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-8 -translate-y-8">
          <Bus className="w-80 h-80" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-white mb-3">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Official VFSTR Parent Transit Portal • Safe Commute Assurance
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Live Ward Transit Tracker
          </h1>
          <p className="mt-2 text-sm text-slate-200 leading-relaxed">
            Monitor your ward's daily morning pickup and evening return commute in real time. Access instant bus location, driver contact, and verified boarding timestamps.
          </p>

          {/* Quick Roll Number Search */}
          <form onSubmit={handleSearch} className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Enter Student Roll No (e.g., 251FA04001)"
                value={searchRoll}
                onChange={(e) => setSearchRoll(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-sm"
              />
            </div>
            <Button type="submit" variant="secondary" className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold px-6">
              Track Ward Bus
            </Button>
          </form>
        </div>
      </div>

      {currentWard && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Ward Status & Driver Info */}
          <div className="space-y-6 lg:col-span-1">
            {/* Ward Identity Card */}
            <Card className="p-5 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg border-2 border-primary/20">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-foreground">{currentWard.name}</h2>
                    <p className="text-xs text-muted-foreground">{currentWard.rollNo} • {currentWard.department}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20 font-semibold">
                  {currentWard.academicYear}
                </Badge>
              </div>

              {/* Boarding Status Banner */}
              <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold text-sm">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Safely Boarded & En Route</span>
                </div>
                <p className="text-xs text-emerald-700 dark:text-emerald-400/80 mt-1 pl-7">
                  Scanned at {currentWard.pickupStop} at <strong>{currentWard.boardedAtTime}</strong>.
                </p>
              </div>

              {/* Transit Details */}
              <div className="mt-5 space-y-3 text-xs border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Bus className="h-3.5 w-3.5" /> Assigned Bus
                  </span>
                  <span className="font-bold text-foreground">{currentWard.routeCode} ({currentWard.busRegNo})</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> Boarding Stop
                  </span>
                  <span className="font-semibold text-foreground text-right">{currentWard.pickupStop}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> Scheduled Morning Pickup
                  </span>
                  <span className="font-semibold text-foreground">{currentWard.scheduledPickupTime}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> Estimated Return Drop
                  </span>
                  <span className="font-semibold text-foreground">{currentWard.eveningDropTime}</span>
                </div>
              </div>
            </Card>

            {/* Driver & Emergency Helpline */}
            <Card className="p-5 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Bus Driver & Crew Contact
              </h3>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-foreground">
                    DR
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground">{currentWard.driverName}</div>
                    <div className="text-[11px] text-muted-foreground">Certified Heavy Vehicle Pilot</div>
                  </div>
                </div>
                <a
                  href={`tel:${currentWard.driverPhone}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                >
                  <Phone className="h-3.5 w-3.5" />
                  Call
                </a>
              </div>

              {/* Campus Central Helpline */}
              <div className="mt-4 p-3 rounded-lg bg-vfstr-burgundy-50 dark:bg-vfstr-burgundy-950/30 border border-vfstr-burgundy-200/60 dark:border-vfstr-burgundy-900/40 text-xs">
                <div className="font-semibold text-vfstr-burgundy-900 dark:text-vfstr-burgundy-300 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  VFSTR Transport Cell 24/7 Desk
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Campus Central Control Room, Vadlamudi
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <a
                    href="tel:+918632344700"
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                  >
                    <Phone className="h-3 w-3" /> +91 863 2344700
                  </a>
                  <span className="text-slate-300">•</span>
                  <span className="text-[11px] text-muted-foreground">Extn: 701</span>
                </div>
              </div>
            </Card>

            {/* Notification Alerts Settings */}
            <Card className="p-5 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <Bell className="h-3.5 w-3.5 text-primary" />
                Parent Alerts & WhatsApp Sync
              </h3>
              <div className="space-y-3 text-xs">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-foreground font-medium">WhatsApp Arrival Updates</span>
                  <input
                    type="checkbox"
                    checked={whatsappAlerts}
                    onChange={(e) => setWhatsappAlerts(e.target.checked)}
                    className="rounded text-primary focus:ring-primary h-4 w-4"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-foreground font-medium">SMS Boarding Confirmation</span>
                  <input
                    type="checkbox"
                    checked={smsAlerts}
                    onChange={(e) => setSmsAlerts(e.target.checked)}
                    className="rounded text-primary focus:ring-primary h-4 w-4"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-foreground font-medium">2-Stops Proximity Alarm</span>
                  <input
                    type="checkbox"
                    checked={arrivalProximityAlert}
                    onChange={(e) => setArrivalProximityAlert(e.target.checked)}
                    className="rounded text-primary focus:ring-primary h-4 w-4"
                  />
                </label>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSendTestSms}
                className="w-full mt-4 text-xs font-semibold gap-1.5"
              >
                <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                Send Test Alert to Phone
              </Button>
            </Card>
          </div>

          {/* Right Column: Live Map & Corridor Telemetry */}
          <div className="space-y-6 lg:col-span-2">
            {/* Live Telemetry Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-card border border-slate-200 dark:border-slate-800 rounded-xl">
                <div className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                  <Compass className="h-3 w-3 text-primary" /> Bus Speed
                </div>
                <div className="text-xl font-bold text-foreground mt-1">
                  {currentWard.currentSpeed} <span className="text-xs font-normal text-muted-foreground">km/h</span>
                </div>
              </div>
              <div className="p-3.5 bg-card border border-slate-200 dark:border-slate-800 rounded-xl">
                <div className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                  <Navigation className="h-3 w-3 text-primary" /> Next Stop
                </div>
                <div className="text-sm font-bold text-foreground mt-1 truncate">
                  {currentWard.nextStop}
                </div>
              </div>
              <div className="p-3.5 bg-card border border-slate-200 dark:border-slate-800 rounded-xl">
                <div className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3 text-primary" /> Stop ETA
                </div>
                <div className="text-xl font-bold text-foreground mt-1">
                  {currentWard.etaToNextStop}
                </div>
              </div>
              <div className="p-3.5 bg-card border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-medium text-muted-foreground">GPS Status</div>
                  <div className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    AIS-140 Live
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleRefreshTelemetry}
                  disabled={isRefreshing}
                  className="h-8 w-8 p-0"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Map Container */}
            <Card className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Live Corridor Map • {currentWard.routeCode}
                  </span>
                </div>
                <Badge variant="outline" className="text-xs">
                  Updated 2 seconds ago
                </Badge>
              </div>

              <div className="h-[460px] w-full rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
                <RealTimeTransitMap
                  stops={
                    MASTER_ROUTES_AY2026_27.find((r) => r.routeNumber === 14)?.stops ||
                    MASTER_ROUTES_AY2026_27[0].stops
                  }
                  busRegNo={currentWard.busRegNo}
                  routeNumber={currentWard.routeCode}
                  routeName={currentWard.routeName}
                  driverName={currentWard.driverName}
                  heightClassName="h-full w-full"
                />
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground text-center">
                Bus AP 07 TJ 4521 transponder broadcasting via VFSTR campus IoT mesh. Geofenced within NH-16 corridor.
              </p>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
