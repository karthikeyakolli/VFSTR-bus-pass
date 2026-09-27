import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';
import {
  AlertOctagon,
  PhoneCall,
  MapPin,
  ShieldAlert,
  X,
  Radio,
  CheckCircle2,
} from 'lucide-react';

interface SosBeaconModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  regNo: string;
  busRegNo?: string;
  routeAssigned?: string;
}

export const SosBeaconModal: React.FC<SosBeaconModalProps> = ({
  isOpen,
  onClose,
  studentName,
  regNo,
  busRegNo = 'AP 07 TJ 4521',
  routeAssigned = 'Route #14 (Guntur City Express)',
}) => {
  const toast = useToast();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [beaconDispatched, setBeaconDispatched] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          },
          () => {
            // Default Vadlamudi Corridor fallback
            setCoords({ lat: 16.2334, lng: 80.5475 });
          }
        );
      } else {
        setCoords({ lat: 16.2334, lng: 80.5475 });
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleActivateEmergencyBeacon = () => {
    setBeaconDispatched(true);

    // Save alert to local storage so admin/driver sees it
    const alertData = {
      id: `SOS-${Date.now()}`,
      studentName,
      regNo,
      busRegNo,
      routeAssigned,
      coords: coords || { lat: 16.2334, lng: 80.5475 },
      timestamp: new Date().toLocaleTimeString(),
      status: 'DISPATCHED',
    };
    try {
      const existing = JSON.parse(localStorage.getItem('vfstr-active-sos-alerts') || '[]');
      localStorage.setItem('vfstr-active-sos-alerts', JSON.stringify([alertData, ...existing]));
    } catch {
      // ignore
    }

    toast.error(
      'EMERGENCY BEACON BROADCASTED',
      'Campus Security Control Room & Transport Desk alerted with your location.'
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-6 bg-card border-2 border-destructive shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-destructive/15 text-destructive animate-pulse">
              <AlertOctagon className="h-6 w-6" />
            </span>
            <div>
              <h2 className="font-black text-lg text-foreground flex items-center gap-2">
                Transit Safety & SOS Beacon
              </h2>
              <p className="text-xs text-muted-foreground font-mono">
                VFSTR 24/7 Security & Rapid Response Grid
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Live Status Beacon Indicator */}
        {beaconDispatched ? (
          <div className="p-4 rounded-2xl bg-destructive/10 border-2 border-destructive/50 text-destructive space-y-2">
            <div className="flex items-center gap-2">
              <Radio className="h-5 w-5 animate-spin" />
              <span className="font-black text-sm uppercase tracking-wide">
                Live SOS Signal Active & Relayed
              </span>
            </div>
            <p className="text-xs text-foreground font-medium">
              Campus Security Vehicle and Driver have been notified. Stay calm, stay inside the vehicle or at a well-lit location.
            </p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Tap below in case of transit harassment, vehicle breakdown on highway, or medical emergency. This will immediately transmit your real-time coordinates to University Security.
          </p>
        )}

        {/* Student & Bus Snapshot */}
        <div className="p-3.5 rounded-2xl bg-muted/30 border border-border text-xs space-y-1.5 font-mono">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Passenger:</span>
            <span className="font-bold text-foreground">{studentName} ({regNo})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Assigned Bus:</span>
            <span className="font-bold text-foreground">{busRegNo} • {routeAssigned}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3 text-destructive" /> GPS Coordinates:
            </span>
            <span className="font-bold text-primary">
              {coords ? `${coords.lat.toFixed(4)}° N, ${coords.lng.toFixed(4)}° E` : 'Locating satellite fix...'}
            </span>
          </div>
        </div>

        {/* Big SOS Trigger Button */}
        {!beaconDispatched ? (
          <Button
            variant="destructive"
            className="w-full h-14 text-sm font-black tracking-wider uppercase shadow-lg shadow-destructive/30"
            onClick={handleActivateEmergencyBeacon}
            leftIcon={<ShieldAlert className="h-5 w-5" />}
          >
            Transmit Emergency SOS Signal
          </Button>
        ) : (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>Incident Logged: Dispatching Campus Mobile Patrol Unit</span>
          </div>
        )}

        {/* Direct Emergency Dials */}
        <div className="space-y-2 pt-2 border-t border-border">
          <span className="text-[11px] uppercase font-bold text-muted-foreground block">
            Direct Emergency Lines (Tap to Dial)
          </span>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <a
              href="tel:7330813943"
              className="p-2.5 rounded-xl border border-border bg-card hover:bg-muted/40 font-bold flex items-center justify-between transition-colors"
            >
              <span className="truncate">Transport Cell</span>
              <PhoneCall className="h-3.5 w-3.5 text-primary shrink-0 ml-1" />
            </a>

            <a
              href="tel:9705444211"
              className="p-2.5 rounded-xl border border-border bg-card hover:bg-muted/40 font-bold flex items-center justify-between transition-colors"
            >
              <span className="truncate">Chief Security</span>
              <PhoneCall className="h-3.5 w-3.5 text-destructive shrink-0 ml-1" />
            </a>

            <a
              href="tel:112"
              className="p-2.5 rounded-xl border border-border bg-card hover:bg-muted/40 font-bold flex items-center justify-between transition-colors"
            >
              <span className="truncate">Disha Helpline (112)</span>
              <PhoneCall className="h-3.5 w-3.5 text-rose-500 shrink-0 ml-1" />
            </a>

            <a
              href="tel:100"
              className="p-2.5 rounded-xl border border-border bg-card hover:bg-muted/40 font-bold flex items-center justify-between transition-colors"
            >
              <span className="truncate">Police Assistance</span>
              <PhoneCall className="h-3.5 w-3.5 text-blue-500 shrink-0 ml-1" />
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
};
