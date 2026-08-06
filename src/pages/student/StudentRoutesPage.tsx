import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatusChip } from '@/components/ui/StatusChip';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Input } from '@/components/ui/Input';
import { useUser } from '@/hooks/useUser';
import { useToast } from '@/hooks/useToast';
import { PageLayout } from '@/layouts/components/PageLayout';
import { RouteStopsDesigner } from '@/components/routes/RouteStopsDesigner';
import {
  Bus,
  MapPin,
  Clock,
  Phone,
  Search,
  AlertTriangle,
  Calendar,
  Navigation,
  UserCheck,
  Building,
  CheckCircle2,
  QrCode,
  Radio,
  LocateFixed,
  Layers,
  Info,
} from 'lucide-react';

export interface RouteStop {
  id: string;
  seq: number;
  name: string;
  morningTime: string;
  eveningDropTime: string;
  landmark: string;
  isAssigned: boolean;
  lat?: number;
  lng?: number;
  distanceFromUser?: string;
}

export const StudentRoutesPage: React.FC = () => {
  const { studentProfile } = useUser();
  const toast = useToast();
  const [stopSearch, setStopSearch] = useState('');
  const [selectedRouteId, setSelectedRouteId] = useState('R14');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [nearestStopId, setNearestStopId] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [liveMapMode, setLiveMapMode] = useState<'visual' | 'satellite'>('visual');

  // Simulated live bus GPS coordinates moving along Guntur -> Vadlamudi route
  const [busLocation] = useState({
    lat: 16.2780,
    lng: 80.4560,
    speed: 42,
    nextStop: 'Collectorate Junction',
    etaMinutes: 4,
  });

  const routesList = [
    { id: 'R14', name: 'Route #14 - Guntur City Express', busNo: 'AP 07 TJ 4521', driver: 'K. Venkateswarlu', phone: '+91 94401 23456' },
    { id: 'R08', name: 'Route #08 - Vijayawada Highway Line', busNo: 'AP 16 TZ 8812', driver: 'M. Sambaiah', phone: '+91 98481 12345' },
    { id: 'R21', name: 'Route #21 - Tenali Town Shuttle', busNo: 'AP 07 TL 3099', driver: 'P. Srinivasa Rao', phone: '+91 99123 45678' },
  ];

  const assignedRouteDetails = {
    routeId: 'R14',
    routeName: 'Route #14 - Guntur City Express',
    assignedBusNo: 'AP 07 TJ 4521',
    busCode: 'VFSTR-B14',
    capacity: '55 Seats (48 Allocated)',
    morningStart: '07:00 AM',
    pickupTime: '07:10 AM',
    campusArrival: '07:50 AM',
    eveningDeparture: '05:15 PM',
    driverName: 'Mr. K. Venkateswarlu',
    driverExperience: '12 Years VFSTR Service',
    driverPhone: '+91 94401 23456',
    transportOfficer: 'Mr. P. Raghava Rao',
    officeContact: '+91 863-2344700 Ext 104',
    officeLocation: 'Admin Block, Room 104',
  };

  const initialStops: RouteStop[] = [
    { id: '1', seq: 1, name: 'Guntur Bus Station Depot', morningTime: '07:00 AM', eveningDropTime: '05:55 PM', landmark: 'Platform 1 Departure Gate', isAssigned: false, lat: 16.3067, lng: 80.4365 },
    { id: '2', seq: 2, name: 'Old Bus Stand, Guntur', morningTime: '07:10 AM', eveningDropTime: '05:45 PM', landmark: 'Near Municipal High School', isAssigned: true, lat: 16.2995, lng: 80.4430 },
    { id: '3', seq: 3, name: 'Collectorate Junction', morningTime: '07:18 AM', eveningDropTime: '05:38 PM', landmark: 'Opposite State Bank Branch', isAssigned: false, lat: 16.2910, lng: 80.4505 },
    { id: '4', seq: 4, name: 'Market Yard Center', morningTime: '07:25 AM', eveningDropTime: '05:30 PM', landmark: 'Beside HP Petrol Pump', isAssigned: false, lat: 16.2750, lng: 80.4680 },
    { id: '5', seq: 5, name: 'Auto Nagar Arch', morningTime: '07:32 AM', eveningDropTime: '05:22 PM', landmark: 'Near Fire Station Signal', isAssigned: false, lat: 16.2610, lng: 80.4910 },
    { id: '6', seq: 6, name: 'VFSTR Vadlamudi Main Campus', morningTime: '07:50 AM', eveningDropTime: '05:15 PM', landmark: 'Transport Bay 3', isAssigned: false, lat: 16.2335, lng: 80.5486 },
  ];

  const [routeStops, setRouteStops] = useState<RouteStop[]>(initialStops);

  // Haversine formula to calculate real distance between coordinates in KM
  const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of Earth in KM
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // User Location Handler
  const handleDetectUserLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const uLat = pos.coords.latitude;
          const uLng = pos.coords.longitude;
          setUserCoords({ lat: uLat, lng: uLng });
          setIsLocating(false);

          // Calculate distance to each stop & find nearest
          let minDist = Infinity;
          let closestId: string | null = null;

          const updated = routeStops.map((stop) => {
            const dist = calculateDistanceKm(uLat, uLng, stop.lat || 0, stop.lng || 0);
            if (dist < minDist) {
              minDist = dist;
              closestId = stop.id;
            }
            return {
              ...stop,
              distanceFromUser: `${dist.toFixed(1)} km away`,
            };
          });

          setRouteStops(updated);
          setNearestStopId(closestId);
          toast.success(
            'GPS Location Detected',
            `Your nearest stop is ${updated.find((s) => s.id === closestId)?.name} (${minDist.toFixed(1)} km away).`
          );
        },
        (_err) => {
          setIsLocating(false);
          // Fallback to Guntur approximate location for testing
          const defaultLat = 16.2950;
          const defaultLng = 80.4450;
          setUserCoords({ lat: defaultLat, lng: defaultLng });
          
          let minDist = Infinity;
          let closestId: string | null = null;

          const updated = routeStops.map((stop) => {
            const dist = calculateDistanceKm(defaultLat, defaultLng, stop.lat || 0, stop.lng || 0);
            if (dist < minDist) {
              minDist = dist;
              closestId = stop.id;
            }
            return {
              ...stop,
              distanceFromUser: `${dist.toFixed(1)} km away`,
            };
          });

          setRouteStops(updated);
          setNearestStopId(closestId);
          toast.info(
            'Default Location Loaded',
            'Using Guntur region coordinates to measure distance to route stops.'
          );
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setIsLocating(false);
      toast.error('Geolocation Error', 'Geolocation is not supported by your browser.');
    }
  };

  const routeNotices = [
    {
      id: '1',
      title: 'Road Works Detour near Collectorate Junction',
      date: '02 Aug 2026',
      desc: 'Due to flyover maintenance, Stop #3 will temporarily shift 100 meters ahead near HDFC Bank ATM.',
      type: 'warning',
    },
    {
      id: '2',
      title: 'Mid-Term Exam Shift Departure Schedule',
      date: '10 Aug 2026',
      desc: 'Buses will make an additional afternoon return trip departing Vadlamudi Campus at 01:30 PM.',
      type: 'info',
    },
  ];

  const filteredStops = routeStops.filter(
    (stop) =>
      stop.name.toLowerCase().includes(stopSearch.toLowerCase()) ||
      stop.landmark.toLowerCase().includes(stopSearch.toLowerCase())
  );

  const lifecycleSteps = [
    { step: '01', title: 'Application', desc: 'Online request submitted', done: true },
    { step: '02', title: 'Approval', desc: 'Transport cell verified', done: true },
    { step: '03', title: 'Pass Generated', desc: 'Active digital pass', done: true },
    { step: '04', title: 'Renewal', desc: 'Open 30 days prior', done: false },
    { step: '05', title: 'Expiration', desc: '31 May 2027', done: false },
  ];

  return (
    <PageLayout>
      {/* Section Header */}
      <SectionHeader
        title="Transport Information Center"
        subtitle="Primary student transport workspace: route schedules, live stop maps, GPS telemetry, and pass lifecycle"
        badge={<StatusChip status={studentProfile.isTransportUser ? "active" : "pending"} label={studentProfile.isTransportUser ? "Transport Enrolled" : "Not Enrolled"} />}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<LocateFixed className="h-3.5 w-3.5 text-primary" />}
              onClick={handleDetectUserLocation}
              isLoading={isLocating}
            >
              {userCoords ? 'Update My GPS Location' : 'Find Nearest Stop'}
            </Button>
            <Link to="/student/pass">
              <Button variant="outline" size="sm" leftIcon={<QrCode className="h-3.5 w-3.5" />}>
                View Bus Pass
              </Button>
            </Link>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Navigation className="h-3.5 w-3.5" />}
              onClick={() => window.open('https://vignan.ac.in/transport/tracking', '_blank', 'noopener,noreferrer')}
            >
              Live GPS Radar
            </Button>
          </div>
        }
      />

      {/* 1. Geolocation Alert Banner if Location Detected */}
      {userCoords && (
        <div className="p-4 rounded-2xl border-2 border-primary/30 bg-primary/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary text-primary-foreground shrink-0">
              <LocateFixed className="h-5 w-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-foreground">Your GPS Location Active</span>
              <p className="text-xs text-muted-foreground mt-0.5">
                Latitude: <span className="font-mono text-foreground font-semibold">{userCoords.lat.toFixed(4)}</span> | Longitude: <span className="font-mono text-foreground font-semibold">{userCoords.lng.toFixed(4)}</span>
                {nearestStopId && (
                  <span className="ml-2 text-primary font-bold">
                    • Nearest Boarding Point: {routeStops.find(s => s.id === nearestStopId)?.name}
                  </span>
                )}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="shrink-0 font-bold">GPS Accuracy: ± 15m</Badge>
        </div>
      )}

      {/* 2. Live Bus GPS Tracking Radar & Interactive Map View */}
      <Card className="p-6 border-2 border-primary/20 bg-card space-y-4 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Radio className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-foreground">Real-Time Bus Route GPS Radar</h3>
                <Badge variant="outline" className="border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold">
                  ● Live Feed Active
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">Tracking Bus <strong className="text-foreground">{assignedRouteDetails.assignedBusNo}</strong> on Route #14 to Vadlamudi Campus</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedRouteId}
              onChange={(e) => setSelectedRouteId(e.target.value)}
              className="h-9 px-3 text-xs font-semibold rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {routesList.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setLiveMapMode(liveMapMode === 'visual' ? 'satellite' : 'visual')}
              leftIcon={<Layers className="h-3.5 w-3.5" />}
            >
              {liveMapMode === 'visual' ? 'Satellite View' : 'Map View'}
            </Button>
          </div>
        </div>

        {/* Live GPS Telemetry Dashboard Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-muted/40 border border-border/80 text-xs">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold block">Current Speed</span>
            <span className="text-sm font-extrabold text-foreground font-mono">{busLocation.speed} km/h</span>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold block">Next Arrival Stop</span>
            <span className="text-sm font-extrabold text-primary truncate block">{busLocation.nextStop}</span>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold block">Estimated Arrival</span>
            <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">{busLocation.etaMinutes} mins ETA</span>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold block">Schedule Status</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="h-3.5 w-3.5" /> On Time Schedule
            </span>
          </div>
        </div>

        {/* Real Interactive Map Canvas & OpenStreetMap Embed */}
        <div className="relative rounded-2xl overflow-hidden border-2 border-primary/20 bg-slate-900 min-h-[320px] flex flex-col justify-between p-4 text-white">
          {/* OpenStreetMap / Google Map Interactive Frame */}
          <iframe
            title="VIGNAN Transport Live Map"
            width="100%"
            height="320"
            className="absolute inset-0 w-full h-full opacity-70 grayscale-[20%] contrast-[110%]"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=80.4000%2C16.2000%2C80.5800%2C16.3200&layer=${liveMapMode === 'satellite' ? 'hot' : 'mapnik'}&marker=16.2335%2C80.5486`}
            style={{ border: 0 }}
          />

          {/* Map Overlay Header */}
          <div className="relative z-10 flex items-center justify-between bg-slate-950/80 backdrop-blur-md p-3 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 text-xs">
              <MapPin className="h-4 w-4 text-emerald-400 animate-bounce" />
              <span>
                Origin: <strong className="text-white">Guntur Bus Station</strong> → Destination: <strong className="text-white">Vadlamudi Campus (Bay 3)</strong>
              </span>
            </div>
            <Badge className="bg-emerald-500 text-white font-bold text-[10px] px-2 py-0.5">
              GPS Active
            </Badge>
          </div>

          {/* Interactive Route Stop Node Flow on top of Map */}
          <div className="relative z-10 my-6 overflow-x-auto scrollbar-none py-2">
            <div className="min-w-[650px] flex items-center justify-between relative px-6">
              {/* Animated Connecting Polyline */}
              <div className="absolute top-1/2 left-8 right-8 h-1.5 bg-gradient-to-r from-blue-500 via-emerald-400 to-amber-400 -translate-y-1/2 rounded-full shadow-lg" />

              {routeStops.map((stop) => {
                const isNearest = stop.id === nearestStopId;
                return (
                  <div key={stop.id} className="relative z-10 flex flex-col items-center group cursor-pointer">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs shadow-xl transition-all duration-300 ${
                        stop.isAssigned
                          ? 'bg-blue-600 text-white ring-4 ring-blue-400/50 scale-125'
                          : isNearest
                          ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-400/50 scale-125'
                          : stop.seq === 6
                          ? 'bg-emerald-500 text-white ring-4 ring-emerald-400/30'
                          : 'bg-slate-900 text-white border-2 border-blue-400'
                      }`}
                    >
                      {stop.seq === 6 ? <Building className="h-4 w-4" /> : `#${stop.seq}`}
                    </div>

                    <div className="mt-2 text-center space-y-0.5 max-w-[110px] bg-slate-950/85 backdrop-blur-md p-1.5 rounded-lg border border-white/10">
                      <span className={`text-[11px] block font-bold truncate ${stop.isAssigned ? 'text-blue-400' : 'text-slate-100'}`}>
                        {stop.name}
                      </span>
                      <span className="text-[9px] text-slate-300 font-mono block">{stop.morningTime}</span>
                      {stop.isAssigned && (
                        <span className="text-[8px] bg-blue-500 text-white px-1 rounded font-bold uppercase block mt-0.5">Assigned Stop</span>
                      )}
                      {isNearest && !stop.isAssigned && (
                        <span className="text-[8px] bg-amber-500 text-slate-950 px-1 rounded font-bold uppercase block mt-0.5">Closest to You</span>
                      )}
                      {stop.distanceFromUser && (
                        <span className="text-[9px] text-emerald-400 font-semibold block">{stop.distanceFromUser}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Map Overlay Footer */}
          <div className="relative z-10 flex items-center justify-between bg-slate-950/80 backdrop-blur-md p-2.5 rounded-xl border border-white/10 text-xs">
            <span className="text-slate-300 flex items-center gap-1.5 text-[11px]">
              <Info className="h-3.5 w-3.5 text-blue-400" />
              Live location coordinates updated every 5 seconds via VFSTR Transport Telemetry
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-[11px] bg-white/10 hover:bg-white/20 border-white/20 text-white"
              onClick={() => window.open('https://maps.google.com/?q=16.2335,80.5486', '_blank')}
            >
              Open in Google Maps ↗
            </Button>
          </div>
        </div>
      </Card>

      {/* Interactive Bus Route & Stops Designer */}
      <RouteStopsDesigner />

      {/* 3. Transport Lifecycle Timeline Card */}
      <Card className="p-5 border-2 border-primary/20 bg-card space-y-4">
        <SectionHeader
          title="Transport Pass Lifecycle Status"
          subtitle="Progress from online application to annual pass expiration"
          badge={<Badge variant="secondary">AY 2026-2027</Badge>}
          className="pb-2"
        />

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
          {lifecycleSteps.map((s, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border flex flex-col justify-between gap-2 relative ${
                s.done
                  ? 'border-primary/40 bg-primary/5 text-foreground'
                  : 'border-border bg-muted/30 text-muted-foreground'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">{s.step}</span>
                {s.done ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">{s.title}</h4>
                <p className="text-[11px] text-muted-foreground">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 4. Main Route & Vehicle Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Assigned Route Overview Card */}
        <Card className="p-5 border-2 border-primary/20 bg-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Assigned Route
            </span>
            <StatusChip status="active" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-foreground">{assignedRouteDetails.routeName}</h3>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>Your Boarding Stop: <strong className="text-foreground">{studentProfile.pickupPoint}</strong></span>
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20 text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>Morning Pickup:</span>
              <strong className="text-foreground font-semibold">{assignedRouteDetails.pickupTime}</strong>
            </div>
            <div className="flex justify-between">
              <span>Est. Campus Arrival:</span>
              <strong className="text-foreground font-semibold">{assignedRouteDetails.campusArrival}</strong>
            </div>
          </div>
        </Card>

        {/* Assigned Bus & Capacity Card with Live Occupancy Meter */}
        <Card className="p-5 border-2 border-border bg-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Assigned Bus & Capacity
            </span>
            <Badge variant="outline">{assignedRouteDetails.busCode}</Badge>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Bus className="h-5 w-5 text-primary shrink-0" />
              <span className="text-lg font-extrabold text-foreground">{assignedRouteDetails.assignedBusNo}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
              <span>Bus Capacity:</span>
              <strong className="text-foreground">48 / 55 Allocated</strong>
            </p>
          </div>

          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-[11px] font-semibold">
              <span className="text-emerald-600 dark:text-emerald-400">87% Seat Allocation</span>
              <span className="text-muted-foreground">7 Seats Available</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full" style={{ width: '87%' }} />
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>Route Origin:</span>
              <span className="text-foreground font-medium">Guntur Depot (07:00 AM)</span>
            </div>
            <div className="flex justify-between">
              <span>Evening Return Departure:</span>
              <span className="text-foreground font-medium">{assignedRouteDetails.eveningDeparture}</span>
            </div>
          </div>
        </Card>

        {/* Driver & Helpdesk Contacts Card */}
        <Card className="p-5 border-2 border-border bg-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Driver & Transport Desk
            </span>
            <Badge variant="secondary">Verified Staff</Badge>
          </div>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5 text-primary" /> {assignedRouteDetails.driverName}
                </span>
                <span className="text-[10px] text-muted-foreground">{assignedRouteDetails.driverExperience}</span>
              </div>
              <p className="text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3 text-primary" /> {assignedRouteDetails.driverPhone}
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 space-y-1">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <Building className="h-3.5 w-3.5 text-primary" /> Transport Cell Desk
              </span>
              <p className="text-muted-foreground text-[11px]">
                {assignedRouteDetails.officeLocation} • {assignedRouteDetails.officeContact}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* 5. Searchable Stop Timetable with User Distance */}
      <Card className="p-6 space-y-4 border-2 border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" /> Route #14 Stop Timetable & Distances
            </h3>
            <p className="text-xs text-muted-foreground">Morning pickup, evening drop schedule, and distance to your location</p>
          </div>

          <div className="w-full sm:w-64">
            <Input
              placeholder="Search stop name or landmark..."
              value={stopSearch}
              onChange={(e) => setStopSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4 text-muted-foreground" />}
              className="h-9 text-xs"
            />
          </div>
        </div>

        {/* Timetable List */}
        <div className="space-y-3">
          {filteredStops.map((stop) => {
            const isNearest = stop.id === nearestStopId;
            return (
              <div
                key={stop.id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  stop.isAssigned
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : isNearest
                    ? 'border-amber-500 bg-amber-500/10 shadow-sm'
                    : 'border-border/60 bg-card hover:bg-muted/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      stop.isAssigned ? 'bg-primary text-primary-foreground' : isNearest ? 'bg-amber-500 text-slate-950 font-black' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    0{stop.seq}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-foreground">{stop.name}</span>
                      {stop.isAssigned && <Badge variant="secondary" dot>Your Assigned Stop</Badge>}
                      {isNearest && !stop.isAssigned && <Badge variant="warning">Nearest to You</Badge>}
                      {stop.distanceFromUser && (
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          ({stop.distanceFromUser})
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-primary shrink-0" />
                      <span>{stop.landmark}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-medium border-t sm:border-t-0 pt-2 sm:pt-0 border-border/60">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Morning Pickup</span>
                    <span className="text-foreground font-bold font-mono">{stop.morningTime}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Evening Drop</span>
                    <span className="text-foreground font-bold font-mono">{stop.eveningDropTime}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 6. Route Notices & Advisory Card */}
      <Card className="p-6 border-2 border-amber-500/20 bg-amber-50/10 space-y-4">
        <SectionHeader
          title="Important Route Notices & Advisory"
          subtitle="Official route updates, traffic detours, and exam schedules"
          badge={<AlertTriangle className="h-4 w-4 text-amber-500" />}
          className="pb-2"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {routeNotices.map((n) => (
            <div key={n.id} className="p-3.5 rounded-xl border border-amber-500/30 bg-card space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">{n.title}</span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {n.date}
                </span>
              </div>
              <p className="text-muted-foreground leading-relaxed">{n.desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </PageLayout>
  );
};
