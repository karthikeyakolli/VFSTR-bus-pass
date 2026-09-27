import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';
import {
  Bus,
  Navigation,
  Clock,
  Compass,
  MapPin,
  Volume2,
  VolumeX,
  Radio,
  CheckCircle2,
  Wifi,
  Map as MapIcon,
} from 'lucide-react';
import { TelemetryService, BusTelemetryPacket } from '@/services/TelemetryService';
import { RealTimeTransitMap } from '@/components/map';

interface StopProgress {
  name: string;
  landmark: string;
  order: number;
  lat: number;
  lng: number;
  scheduledTime: string;
  distanceKm: number;
}

interface LiveBusRadarProps {
  routeNumber?: string;
  routeName?: string;
  busRegNo?: string;
  driverName?: string;
  studentPickupStop?: string;
}

export const LiveBusRadar: React.FC<LiveBusRadarProps> = ({
  routeNumber = 'Route #14',
  routeName = 'Guntur City Express',
  busRegNo = 'AP 07 TJ 4521',
  driverName = 'K. Venkateswarlu',
  studentPickupStop = 'Budampadu Junction',
}) => {
  const toast = useToast();

  const stops: StopProgress[] = [
    { name: 'Narakoduru Center', landmark: 'Near Andhra Bank', order: 1, lat: 16.2412, lng: 80.5123, scheduledTime: '07:20 AM', distanceKm: 8.4 },
    { name: 'Budampadu Junction', landmark: 'National Highway NH-16 Circle', order: 2, lat: 16.2589, lng: 80.4854, scheduledTime: '07:35 AM', distanceKm: 4.8 },
    { name: 'Chuttugunta Circle', landmark: 'Guntur Municipal Water Tank', order: 3, lat: 16.291, lng: 80.4512, scheduledTime: '07:45 AM', distanceKm: 2.1 },
    { name: 'Guntur NTR Circle', landmark: 'Opposite RTC Bus Stand', order: 4, lat: 16.3025, lng: 80.4431, scheduledTime: '07:55 AM', distanceKm: 0.9 },
    { name: 'Vadlamudi VFSTR Campus', landmark: 'Main Gate Terminal', order: 5, lat: 16.2334, lng: 80.5475, scheduledTime: '08:20 AM', distanceKm: 0.0 },
  ];

  const [currentProgress, setCurrentProgress] = useState<number>(32); // percentage along route
  const [speedKmh, setSpeedKmh] = useState<number>(44);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [hasAlertedProximity, setHasAlertedProximity] = useState<boolean>(false);
  const [isRealGpsActive, setIsRealGpsActive] = useState<boolean>(false);
  const [lastTelemetryTimestamp, setLastTelemetryTimestamp] = useState<string | null>(null);
  const [showLiveMap, setShowLiveMap] = useState<boolean>(true);

  // Active stop calculation
  const currentStopIndex = Math.min(Math.floor((currentProgress / 100) * stops.length), stops.length - 1);
  const nextStop = stops[Math.min(currentStopIndex + 1, stops.length - 1)];

  // Distance to student stop
  const kmToStudentStop = Math.max(0, (5.2 * (1 - currentProgress / 100)).toFixed(1) as any);
  const minsToStudentStop = Math.max(1, Math.round((kmToStudentStop / (speedKmh || 30)) * 60));

  // 1. Subscribe to Live GPS Telemetry from Driver
  useEffect(() => {
    const unsubscribe = TelemetryService.subscribeToBusLocation(busRegNo, (packet: BusTelemetryPacket) => {
      setIsRealGpsActive(true);
      setCurrentProgress(packet.progressPercent);
      setSpeedKmh(packet.speedKmh);
      setLastTelemetryTimestamp(packet.timestamp);
    });

    return () => {
      unsubscribe();
    };
  }, [busRegNo]);

  // 2. Fallback simulation loop if driver is not actively broadcasting
  useEffect(() => {
    if (isRealGpsActive) return; // Driver is broadcasting real coords

    const interval = setInterval(() => {
      setCurrentProgress((prev) => {
        if (prev >= 98) return 15; // loop route simulation
        return prev + 1;
      });

      // fluctuate speed realistically
      setSpeedKmh((prev) => {
        const delta = (Math.random() - 0.5) * 6;
        return Math.min(58, Math.max(28, Math.round(prev + delta)));
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [isRealGpsActive]);

  // Proximity alert when approaching student stop
  useEffect(() => {
    if (kmToStudentStop <= 1.5 && !hasAlertedProximity) {
      setHasAlertedProximity(true);
      if (soundEnabled) {
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          osc.start();
          osc.stop(ctx.currentTime + 0.4);
        } catch {
          // ignore web audio limitations
        }
      }
      toast.info(
        'Bus Approaching Your Stop!',
        `${busRegNo} is now within 1.5 km (~${minsToStudentStop} mins) of ${studentPickupStop}.`
      );
    }
  }, [kmToStudentStop, hasAlertedProximity, soundEnabled, busRegNo, minsToStudentStop, studentPickupStop, toast]);

  return (
    <Card className="p-6 border-2 border-primary/25 bg-card shadow-md space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <div>
            <h3 className="font-black text-base text-foreground flex items-center gap-2">
              <Radio className="h-4 w-4 text-primary" /> Live GPS Bus Radar
            </h3>
            <p className="text-xs text-muted-foreground font-mono">
              {routeNumber} ({routeName}) • {busRegNo} • Driver: <span className="text-foreground font-semibold">{driverName}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Badge
            variant="outline"
            className={`font-mono text-xs ${
              isRealGpsActive
                ? 'border-emerald-500 text-emerald-600 bg-emerald-500/15 animate-pulse'
                : 'border-blue-500/40 text-blue-600 bg-blue-500/10'
            }`}
          >
            {isRealGpsActive ? (
              <span className="flex items-center gap-1.5">
                <Wifi className="h-3 w-3 animate-pulse" /> Live Driver GPS {lastTelemetryTimestamp ? `(${lastTelemetryTimestamp})` : ''}
              </span>
            ) : (
              'Highway Radar Active'
            )}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLiveMap(!showLiveMap)}
            className="h-8 px-2.5 text-xs font-bold border-primary/40 text-primary"
            title="Toggle Live Real-Time Street Map"
          >
            <MapIcon className="h-3.5 w-3.5 mr-1" />
            {showLiveMap ? 'Hide Map' : 'Real-Time Map'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="h-8 px-2"
            title={soundEnabled ? 'Mute Proximity Chime' : 'Enable Proximity Chime'}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4 text-primary" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
          </Button>
        </div>
      </div>

      {/* Real-time ETA Spotlight Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/20">
        <div className="space-y-0.5">
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
            Your Boarding Stage
          </span>
          <div className="font-extrabold text-sm text-foreground flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            <span className="truncate">{studentPickupStop}</span>
          </div>
        </div>

        <div className="space-y-0.5">
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
            Estimated Arrival (ETA)
          </span>
          <div className="font-black text-lg text-primary flex items-center gap-1.5 font-mono">
            <Clock className="h-4 w-4" />
            <span>~{minsToStudentStop} mins</span>
            <span className="text-xs font-normal text-muted-foreground">({kmToStudentStop} km away)</span>
          </div>
        </div>

        <div className="space-y-0.5">
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
            Cruising Speed
          </span>
          <div className="font-bold text-sm text-foreground flex items-center gap-1.5 font-mono">
            <Compass className="h-4 w-4 text-emerald-600" />
            <span>{speedKmh} km/h</span>
            <span className="text-xs text-muted-foreground font-normal">• NH-16 Transit</span>
          </div>
        </div>
      </div>

      {/* Real-Time Interactive Live Map Canvas */}
      {showLiveMap && (
        <div className="animate-fadeIn">
          <RealTimeTransitMap
            stops={stops.map((s, idx) => ({
              sequence: s.order,
              stopName: s.name,
              landmark: s.landmark,
              morningTime: s.scheduledTime,
              latitude: s.lat,
              longitude: s.lng,
              isCampus: idx === stops.length - 1,
            }))}
            busRegNo={busRegNo}
            routeNumber={routeNumber}
            routeName={routeName}
            driverName={driverName}
            heightClassName="h-72 sm:h-80"
            showControls={true}
            autoTrackBus={true}
          />
        </div>
      )}

      {/* Visual Corridor Path Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
          <span>Route Progress: {currentProgress}%</span>
          <span className="text-foreground font-bold flex items-center gap-1">
            <Navigation className="h-3 w-3 text-primary animate-pulse" /> Next: {nextStop?.name || 'Vadlamudi'}
          </span>
        </div>

        <div className="relative w-full h-3 bg-muted rounded-full overflow-hidden border border-border">
          <div
            className="h-full bg-linear-to-r from-primary via-emerald-500 to-primary transition-all duration-700 ease-out"
            style={{ width: `${currentProgress}%` }}
          />
        </div>
      </div>

      {/* Stop Sequence Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-1">
        {stops.map((stop, idx) => {
          const isPassed = idx < currentStopIndex;
          const isCurrent = idx === currentStopIndex;
          const isTarget = stop.name.toLowerCase().includes(studentPickupStop.toLowerCase());

          return (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border text-xs transition-all relative ${
                isCurrent
                  ? 'border-emerald-500 bg-emerald-500/10 shadow-xs'
                  : isTarget
                  ? 'border-primary bg-primary/10'
                  : isPassed
                  ? 'border-border/60 bg-muted/30 opacity-70'
                  : 'border-border bg-card'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-muted-foreground">Stop #{idx + 1}</span>
                {isPassed ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                ) : isCurrent ? (
                  <Bus className="h-3.5 w-3.5 text-emerald-600 animate-bounce" />
                ) : isTarget ? (
                  <Badge variant="outline" className="text-[9px] px-1 py-0 border-primary text-primary">You</Badge>
                ) : null}
              </div>
              <div className="font-bold text-foreground text-[11px] truncate mt-1">{stop.name}</div>
              <div className="font-mono text-[10px] text-muted-foreground mt-0.5">{stop.scheduledTime}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
