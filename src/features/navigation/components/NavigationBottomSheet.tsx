import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  Phone,
  Share2,
  Shield,
  Gauge,
  MapPin,
  ChevronDown,
  ChevronUp,
  Bus,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/hooks/useToast';
import {
  NavigationSessionState,
  NavigationMode,
} from '@/services/navigation';

interface NavigationBottomSheetProps {
  session: NavigationSessionState;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onReroute: () => void;
  onSetMode: (mode: NavigationMode) => void;
  onSetSpeed: (speed: number) => void;
}

export const NavigationBottomSheet: React.FC<NavigationBottomSheetProps> = ({
  session,
  onStart,
  onPause,
  onResume,
  onReset,
  onReroute,
  onSetMode,
  onSetSpeed,
}) => {
  const toast = useToast();
  const [isItineraryExpanded, setIsItineraryExpanded] = useState(false);
  const [showSosModal, setShowSosModal] = useState(false);

  const isNavigating = session.status === 'NAVIGATING';
  const isPaused = session.status === 'PAUSED';
  const isArrived = session.status === 'ARRIVED';

  const handleShareTrip = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success('Live Trip Link Copied', 'Share this tracking URL with friends or family for live GPS tracking.');
  };

  const handleTriggerSos = () => {
    setShowSosModal(true);
  };

  return (
    <div className="space-y-4">
      {/* Primary Floating Cockpit Drawer (Uber/Rapido Signature Card) */}
      <Card className="p-5 bg-card/95 border-2 border-primary/20 shadow-2xl rounded-3xl backdrop-blur-xl space-y-5">
        {/* Top ETA & Live Metrics Pill */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black font-mono tracking-tight text-foreground">
                {session.etaRemainingMinutes} min
              </span>
              <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-bold px-2 py-0.5 text-xs">
                {isArrived ? 'Arrived at Destination' : isNavigating ? 'Fastest Route' : 'Ready'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-mono flex items-center gap-2">
              <span>{session.distanceRemainingKm} km remaining</span>
              <span>•</span>
              <span className="text-foreground font-semibold">ETA: {session.estimatedArrivalTime}</span>
            </p>
          </div>

          {/* Speedometer Gauge */}
          <div className="flex items-center gap-3 bg-muted/50 p-2.5 rounded-2xl border border-border">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Gauge className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black font-mono text-foreground">{session.speedKmh}</span>
                <span className="text-[10px] text-muted-foreground font-mono">KM/H</span>
              </div>
              <span className="text-[10px] text-muted-foreground block font-mono">Limit: 50 km/h</span>
            </div>
          </div>
        </div>

        {/* Transit Mode Switcher (University Bus Fleet Only) */}
        <div className="space-y-2">
          <span className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground flex items-center justify-between">
            <span>University Bus Fleet Mode</span>
            <span className="text-[10px] text-emerald-600 font-mono">100% University Buses</span>
          </span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'REGULAR_ROUTE_BUS' as NavigationMode, label: 'Route Bus', icon: Bus, desc: 'All Stops' },
              { id: 'EXPRESS_CAMPUS_BUS' as NavigationMode, label: 'Express Shuttle', icon: Bus, desc: 'Direct Highway' },
              { id: 'FACULTY_SPECIAL_BUS' as NavigationMode, label: 'Faculty Special', icon: Bus, desc: 'Deluxe AC' },
            ].map((m) => {
              const Icon = m.icon;
              const isSelected = session.mode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => onSetMode(m.id)}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1 ${
                    isSelected
                      ? 'bg-primary/10 border-primary text-primary shadow-sm ring-1 ring-primary/30'
                      : 'bg-muted/40 border-border text-muted-foreground hover:bg-muted/70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Icon className="h-4 w-4" />
                    {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
                  </div>
                  <span className="text-xs font-bold text-foreground">{m.label}</span>
                  <span className="text-[10px] text-muted-foreground truncate">{m.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Captain / Bus Driver Card */}
        <div className="p-3.5 rounded-2xl bg-muted/40 border border-border flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="relative shrink-0">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-primary/15 border-2 border-primary/30 flex items-center justify-center font-black text-primary text-sm sm:text-base">
                KV
              </div>
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 w-3.5 h-3.5 rounded-full border-2 border-card" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-extrabold text-xs sm:text-sm text-foreground truncate">K. Venkateswarlu</span>
                <Badge variant="outline" className="text-[9px] px-1 py-0 border-primary/40 text-primary shrink-0">
                  ★ 4.9
                </Badge>
              </div>
              <p className="text-[11px] sm:text-xs text-muted-foreground font-mono truncate">
                AP 07 TJ 4521 • Route #14
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info('Connecting to Driver', 'Calling K. Venkateswarlu (+91 98480 22334)...')}
              className="h-8 w-8 sm:h-9 sm:w-9 p-0 rounded-xl"
              title="Call Driver"
            >
              <Phone className="h-4 w-4 text-primary" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareTrip}
              className="h-8 w-8 sm:h-9 sm:w-9 p-0 rounded-xl"
              title="Share Live Trip"
            >
              <Share2 className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleTriggerSos}
              className="h-8 sm:h-9 px-2 sm:px-2.5 rounded-xl font-bold text-xs"
              title="Emergency SOS"
            >
              <Shield className="h-3.5 w-3.5 mr-1" /> SOS
            </Button>
          </div>
        </div>

        {/* Primary Navigation Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            {!isNavigating ? (
              <Button
                onClick={isPaused ? onResume : onStart}
                className="rounded-2xl px-6 font-bold shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground h-11"
              >
                <Play className="h-4 w-4 mr-2 fill-current" />
                {isPaused ? 'Resume Navigation' : 'Start Navigation'}
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={onPause}
                className="rounded-2xl px-5 font-bold h-11"
              >
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            )}

            <Button
              variant="outline"
              onClick={onReset}
              className="rounded-2xl h-11 px-3"
              title="Reset Trip to Start"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {/* Off-Route Detour Simulation & Speed Multiplier */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onReroute}
              className="h-11 rounded-2xl border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 text-xs font-semibold"
              title="Demonstrates Uber/Rapido auto-rerouting when driver turns off the planned road"
            >
              <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
              Simulate Detour
            </Button>

            {/* Sim Speed Selector */}
            <div className="flex items-center bg-muted rounded-2xl p-1 border border-border">
              {[1, 2, 4].map((mult) => (
                <button
                  key={mult}
                  onClick={() => onSetSpeed(mult)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
                    session.simSpeedMultiplier === mult
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {mult}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Collapsible Turn-by-Turn Route Itinerary Accordion */}
        <div className="pt-2 border-t border-border">
          <button
            onClick={() => setIsItineraryExpanded(!isItineraryExpanded)}
            className="w-full flex items-center justify-between text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              View All {session.activeRoute.maneuvers.length} Navigation Steps
            </span>
            {isItineraryExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {isItineraryExpanded && (
            <div className="mt-3 space-y-2 max-h-56 overflow-y-auto pr-1 text-xs">
              {session.activeRoute.maneuvers.map((m, idx) => {
                const isPassed = idx < session.currentManeuverIndex;
                const isCurrent = idx === session.currentManeuverIndex;
                return (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border flex items-start gap-2.5 transition-all ${
                      isCurrent
                        ? 'bg-primary/10 border-primary/40 font-semibold text-foreground'
                        : isPassed
                        ? 'bg-muted/20 border-border text-muted-foreground opacity-60'
                        : 'bg-muted/40 border-border text-foreground'
                    }`}
                  >
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0 mt-0.5">
                      #{idx + 1}
                    </span>
                    <div className="flex-1">
                      <p>{m.instruction}</p>
                      <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                        {m.distanceMeters > 0 ? `${(m.distanceMeters / 1000).toFixed(1)} km` : 'Arrival'} • {m.roadName}
                      </p>
                    </div>
                    {isCurrent && (
                      <Badge className="bg-primary text-primary-foreground text-[9px] px-1 py-0 shrink-0">
                        Current
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* SOS Modal Dialog */}
      {showSosModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 border-red-500/50 bg-card shadow-2xl rounded-3xl space-y-4">
            <div className="flex items-center gap-3 text-red-500">
              <Shield className="h-8 w-8 animate-bounce" />
              <div>
                <h3 className="font-black text-lg text-foreground">VFSTR Campus Emergency SOS</h3>
                <p className="text-xs text-muted-foreground">Direct connection to Security & Fleet Control</p>
              </div>
            </div>

            <p className="text-xs text-foreground/80 leading-relaxed">
              Activating SOS immediately broadcasts your live vehicle coordinates to the Campus Security Control Room, Transport Officer (+91 86323 44700), and emergency response team.
            </p>

            <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20 text-xs text-red-600 dark:text-red-400 font-mono space-y-1">
              <div>Location: {session.snappedLocation.lat.toFixed(4)}, {session.snappedLocation.lng.toFixed(4)}</div>
              <div>Vehicle: AP 07 TJ 4521 (Route #14)</div>
              <div>Captain: K. Venkateswarlu</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowSosModal(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setShowSosModal(false);
                  toast.success('SOS Alert Dispatched', 'Security team notified of your live location.');
                }}
                className="rounded-xl font-bold"
              >
                Confirm Dispatch SOS
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
