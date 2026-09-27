import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/layouts/components/PageLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';
import {
  NavigationTripManager,
  NavigationSessionState,
  NavigationMode,
} from '@/services/navigation';
import {
  TurnByTurnBanner,
  NavigationMapCanvas,
  NavigationBottomSheet,
  NavigationTelemetryPanel,
} from '@/features/navigation/components';
import {
  Bus,
  RefreshCw,
  Database,
} from 'lucide-react';
import { DatabaseTelemetryInspector } from '@/components/database';

export const LiveNavigationPage: React.FC = () => {
  const toast = useToast();
  const manager = NavigationTripManager.getInstance();
  const [session, setSession] = useState<NavigationSessionState>(manager.getState());
  const [isDbInspectorOpen, setIsDbInspectorOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = manager.subscribe((newState) => {
      setSession(newState);
    });
    return () => unsubscribe();
  }, [manager]);

  const activeManeuver = session.activeRoute.maneuvers[session.currentManeuverIndex];
  const nextManeuver = session.activeRoute.maneuvers[session.currentManeuverIndex + 1];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Campus Transit Navigation & Routing Engine"
          description="Uber/Rapido-grade multi-modal GPS navigation, turn-by-turn maneuvers, road map-matching & dynamic auto-rerouting"
        />
        <div className="flex items-center gap-2 self-start sm:self-center">
          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs px-2.5 py-1 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-ping inline-block" />
            Live Highway Telemetry
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDbInspectorOpen(true)}
            className="rounded-xl text-xs h-9 font-bold border-primary/30 text-primary hover:bg-primary/10"
          >
            <Database className="h-3.5 w-3.5 mr-1.5 text-emerald-500" /> DB Logs
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              manager.resetTrip();
              toast.info('Trip Engine Reset', 'Session returned to departure point.');
            }}
            className="rounded-xl text-xs h-9"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Reset Engine
          </Button>
        </div>
      </div>

      {/* Turn-by-Turn Navigation HUD Banner */}
      <TurnByTurnBanner
        currentManeuver={activeManeuver}
        nextManeuver={nextManeuver}
        distanceToManeuverMeters={session.distanceToNextManeuverMeters}
        isOffRoute={session.isOffRoute}
        isRerouting={session.status === 'REROUTING'}
        voiceEnabled={session.voiceGuidanceEnabled}
        onToggleVoice={() => {
          manager.toggleVoiceGuidance();
          toast.info(
            session.voiceGuidanceEnabled ? 'Voice Guidance Muted' : 'Voice Guidance Enabled',
            session.voiceGuidanceEnabled ? 'Audio alerts turned off' : 'Turn-by-turn prompts will speak aloud'
          );
        }}
        bilingualEnabled={session.bilingualAudioEnabled}
        onToggleBilingual={() => {
          manager.toggleBilingualAudio();
          toast.info(
            session.bilingualAudioEnabled ? 'English Only Audio' : 'Bilingual Audio (EN + Telugu) Enabled',
            session.bilingualAudioEnabled ? 'Switched to English announcements' : 'In-bus stop announcements will speak in English & Telugu'
          );
        }}
        activeGeofence={session.activeGeofence}
        speedKmh={session.speedKmh}
      />

      {/* Main Grid: Interactive Map Canvas + Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Center Map Stage (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <NavigationMapCanvas
            currentLocation={session.currentLocation}
            snappedLocation={session.snappedLocation}
            bearing={session.bearing}
            speedKmh={session.speedKmh}
            activeRoute={session.activeRoute}
            availableRoutes={session.availableRoutes}
            onSelectRoute={(id) => manager.selectRouteAlternative(id)}
            isNavigating={session.status === 'NAVIGATING'}
          />

          {/* Real-Time Map Matching Telemetry Console */}
          <NavigationTelemetryPanel session={session} />
        </div>

        {/* Right Cockpit Drawer (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <NavigationBottomSheet
            session={session}
            onStart={() => manager.startNavigation()}
            onPause={() => manager.pauseNavigation()}
            onResume={() => manager.resumeNavigation()}
            onReset={() => manager.resetTrip()}
            onReroute={() => manager.simulateOffRouteDeviation()}
            onSetMode={(m: NavigationMode) => manager.setNavigationMode(m)}
            onSetSpeed={(s: number) => manager.setSpeedMultiplier(s)}
          />

          {/* Quick Route Corridor Selector Card */}
          <Card className="p-4 bg-card border border-border rounded-3xl space-y-3">
            <div className="flex items-center gap-2 text-foreground font-bold text-xs uppercase tracking-wider">
              <Bus className="h-4 w-4 text-primary" /> Active Transit Corridors
            </div>

            <div className="space-y-2 text-xs">
              {[
                { name: 'Route #14: Guntur Express', code: 'GT-VFSTR-01', dist: '18.4 km', time: '28 min' },
                { name: 'Route #08: Vijayawada Superfast', code: 'VJA-VFSTR-04', dist: '34.2 km', time: '45 min' },
                { name: 'Route #22: Tenali Campus Direct', code: 'TNL-VFSTR-02', dist: '14.8 km', time: '22 min' },
              ].map((corridor, idx) => (
                <div
                  key={idx}
                  onClick={() => toast.info('Corridor Selected', `Loaded graph topology for ${corridor.name}`)}
                  className="p-2.5 rounded-2xl border border-border/80 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-foreground">{corridor.name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{corridor.code}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-primary">{corridor.time}</span>
                    <span className="text-[10px] text-muted-foreground block">{corridor.dist}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Real-time Dynamic GPS Database Inspector */}
      <DatabaseTelemetryInspector
        isOpen={isDbInspectorOpen}
        onClose={() => setIsDbInspectorOpen(false)}
        busRegNo="AP 07 TJ 4521"
      />
    </div>
  );
};
