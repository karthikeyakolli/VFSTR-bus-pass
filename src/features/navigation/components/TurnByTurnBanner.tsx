import React from 'react';
import {
  CornerUpRight,
  CornerUpLeft,
  ArrowUp,
  RotateCw,
  Compass,
  Volume2,
  VolumeX,
  AlertTriangle,
  ShieldAlert,
  Radio,
  Languages,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { RouteManeuver, ManeuverType, GeofenceZone } from '@/services/navigation';

interface TurnByTurnBannerProps {
  currentManeuver?: RouteManeuver;
  nextManeuver?: RouteManeuver;
  distanceToManeuverMeters: number;
  isOffRoute: boolean;
  isRerouting: boolean;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  bilingualEnabled?: boolean;
  onToggleBilingual?: () => void;
  activeGeofence: GeofenceZone | null;
  speedKmh: number;
}

const getManeuverIcon = (type?: ManeuverType) => {
  switch (type) {
    case 'turn-right':
    case 'turn-sharp-right':
    case 'turn-slight-right':
      return <CornerUpRight className="h-8 w-8 text-emerald-400 animate-pulse" />;
    case 'turn-left':
    case 'turn-sharp-left':
    case 'turn-slight-left':
      return <CornerUpLeft className="h-8 w-8 text-emerald-400 animate-pulse" />;
    case 'u-turn':
    case 'roundabout-enter':
    case 'roundabout-exit':
      return <RotateCw className="h-8 w-8 text-amber-400 animate-spin" />;
    case 'arrive':
      return <Compass className="h-8 w-8 text-purple-400" />;
    case 'straight':
    case 'depart':
    default:
      return <ArrowUp className="h-8 w-8 text-blue-400" />;
  }
};

export const TurnByTurnBanner: React.FC<TurnByTurnBannerProps> = ({
  currentManeuver,
  nextManeuver,
  distanceToManeuverMeters,
  isOffRoute,
  isRerouting,
  voiceEnabled,
  onToggleVoice,
  bilingualEnabled = true,
  onToggleBilingual,
  activeGeofence,
  speedKmh,
}) => {
  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  return (
    <div className="w-full space-y-2">
      {/* Geofence / Speed Advisory Toast */}
      {activeGeofence && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-xl px-4 py-2 flex items-center justify-between text-xs text-emerald-400 animate-fadeIn backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 animate-ping text-emerald-400" />
            <span className="font-semibold">Zone Alert: {activeGeofence.name}</span>
          </div>
          <span className="font-mono bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40 text-[11px]">
            Max Limit: {activeGeofence.speedLimitKmh} km/h {speedKmh > activeGeofence.speedLimitKmh ? '⚠️ SLOW DOWN' : '✓ Safe'}
          </span>
        </div>
      )}

      {/* Off-Route Alert */}
      {isRerouting && (
        <div className="bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-xl px-4 py-2.5 flex items-center justify-between shadow-lg animate-pulse backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <div>
              <p className="font-bold text-xs uppercase tracking-wider">Off-Route Detected</p>
              <p className="text-xs text-amber-200/80">Recalculating fastest corridor to VFSTR Campus...</p>
            </div>
          </div>
          <Badge variant="outline" className="border-amber-400 text-amber-300 font-mono text-[10px]">
            Dynamic Re-plan
          </Badge>
        </div>
      )}

      {/* Main High-Contrast Navigation HUD Banner (Uber/Rapido Cockpit) */}
      <div className="relative overflow-hidden bg-slate-900/95 text-white border-2 border-slate-700/60 rounded-2xl p-4 shadow-2xl backdrop-blur-xl transition-all">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between gap-4">
          {/* Big Maneuver Icon */}
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-slate-800/90 rounded-2xl border border-slate-600/50 shadow-inner flex items-center justify-center shrink-0">
              {getManeuverIcon(currentManeuver?.type)}
            </div>

            <div className="space-y-0.5">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono tracking-tight text-emerald-400">
                  {formatDistance(distanceToManeuverMeters)}
                </span>
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                  {currentManeuver?.type === 'arrive' ? 'Destination' : 'Next Maneuver'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-100 truncate max-w-md">
                {currentManeuver?.instruction || 'Proceed towards VFSTR Campus'}
              </h2>
              <p className="text-xs text-slate-400 font-mono truncate">
                On: <span className="text-slate-200 font-semibold">{currentManeuver?.roadName || 'Main Corridor'}</span>
              </p>
            </div>
          </div>

          {/* Quick HUD Action Buttons */}
          <div className="flex items-center gap-2">
            {onToggleBilingual && (
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleBilingual}
                className={`h-9 px-2.5 rounded-xl border-slate-700 text-slate-200 hover:bg-slate-800 ${
                  bilingualEnabled ? 'border-sky-500/50 text-sky-400 font-bold' : 'text-slate-400'
                }`}
                title="Toggle Bilingual English / Telugu PA Voice Announcements"
              >
                <Languages className="h-4 w-4 mr-1 text-sky-400" />
                <span className="text-xs">{bilingualEnabled ? 'EN + తె' : 'EN Only'}</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={onToggleVoice}
              className={`h-9 px-3 rounded-xl border-slate-700 text-slate-200 hover:bg-slate-800 ${
                voiceEnabled ? 'border-emerald-500/50 text-emerald-400' : 'text-slate-400'
              }`}
              title={voiceEnabled ? 'Mute Voice Turn Guidance' : 'Enable Voice Turn Guidance'}
            >
              {voiceEnabled ? (
                <Volume2 className="h-4 w-4 text-emerald-400 animate-pulse" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
              <span className="ml-1.5 hidden sm:inline text-xs font-semibold">
                {voiceEnabled ? 'Voice On' : 'Muted'}
              </span>
            </Button>
          </div>
        </div>

        {/* Secondary Upcoming Maneuver Preview */}
        {nextManeuver && (
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2 truncate">
              <span className="text-[10px] uppercase font-bold text-slate-500">Then:</span>
              <span className="truncate text-slate-300 font-medium">
                {nextManeuver.instruction} ({formatDistance(nextManeuver.distanceMeters)})
              </span>
            </div>
            {isOffRoute && (
              <span className="text-amber-400 font-mono text-[11px] flex items-center gap-1">
                <ShieldAlert className="h-3 w-3" /> Map Match Warning
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
