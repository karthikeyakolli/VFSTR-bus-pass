import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Play, Pause, RotateCcw, Zap, Radio } from 'lucide-react';
import { InteractiveRouteMap } from './InteractiveRouteMap';
import { RouteStopDesignItem } from './RouteStopsDesigner';

interface BusGpsTrackerProps {
  routeCode?: string;
  routeName?: string;
  stops?: RouteStopDesignItem[];
}

const DEFAULT_STOPS: RouteStopDesignItem[] = [
  { id: '1', seq: 1, name: 'Guntur Bus Station Depot', morningTime: '07:00 AM', eveningDropTime: '05:55 PM', landmark: 'Platform 1 Departure Gate', lat: 16.3067, lng: 80.4365, feeTier: 'Standard' },
  { id: '2', seq: 2, name: 'Old Bus Stand, Guntur', morningTime: '07:10 AM', eveningDropTime: '05:45 PM', landmark: 'Near Municipal High School', lat: 16.2995, lng: 80.4430, feeTier: 'Standard' },
  { id: '3', seq: 3, name: 'Collectorate Junction', morningTime: '07:18 AM', eveningDropTime: '05:38 PM', landmark: 'Opposite State Bank Branch', lat: 16.2910, lng: 80.4505, feeTier: 'Standard' },
  { id: '4', seq: 4, name: 'Market Yard Center', morningTime: '07:25 AM', eveningDropTime: '05:30 PM', landmark: 'Beside HP Petrol Pump', lat: 16.2750, lng: 80.4680, feeTier: 'Standard' },
  { id: '5', seq: 5, name: 'Auto Nagar Arch', morningTime: '07:32 AM', eveningDropTime: '05:22 PM', landmark: 'Near Fire Station Signal', lat: 16.2610, lng: 80.4910, feeTier: 'Standard' },
  { id: '6', seq: 6, name: 'VFSTR Vadlamudi Main Campus', morningTime: '07:50 AM', eveningDropTime: '05:15 PM', landmark: 'Transport Bay 3', lat: 16.2335, lng: 80.5486, feeTier: 'Terminal', isCampusEndpoint: true },
];

export const BusGpsTracker: React.FC<BusGpsTrackerProps> = ({
  routeCode = 'Route #14',
  stops = DEFAULT_STOPS,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0); // 0 to 100%
  const [currentSpeed, setCurrentSpeed] = useState(42); // km/h
  const estimatedArrival = '8 mins';

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return prev + 1;
        });
        setCurrentSpeed(Math.floor(35 + Math.random() * 20));
      }, 800);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Interpolate current bus lat/lng along stops
  const currentStopIndex = Math.min(
    Math.floor((currentProgress / 100) * (stops.length - 1)),
    stops.length - 1
  );
  const nextStopIndex = Math.min(currentStopIndex + 1, stops.length - 1);
  const nextStop = stops[nextStopIndex];

  return (
    <Card className="p-5 border-2 border-blue-500/20 bg-card space-y-4 shadow-md">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
          <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
            <Radio className="h-4 w-4 text-blue-500" /> Live GPS Bus Telemetry Simulator
          </h3>
          <Badge variant="outline" className="text-[10px] border-blue-500 text-blue-600 font-mono">
            {routeCode}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={isPlaying ? 'outline' : 'primary'}
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            leftIcon={isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          >
            {isPlaying ? 'Pause Tracking' : 'Start Simulation'}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setIsPlaying(false);
              setCurrentProgress(0);
            }}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Telemetry Status Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-muted/40 border border-border text-xs">
        <div>
          <span className="text-[10px] text-muted-foreground uppercase font-bold block">Next Stop</span>
          <span className="font-extrabold text-foreground truncate block">{nextStop?.name}</span>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground uppercase font-bold block">Telemetry Speed</span>
          <span className="font-mono font-bold text-blue-600 flex items-center gap-1">
            <Zap className="h-3 w-3 text-amber-500" /> {currentSpeed} km/h
          </span>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground uppercase font-bold block">ETA to Stop</span>
          <span className="font-mono font-bold text-emerald-600">{estimatedArrival}</span>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground uppercase font-bold block">Route Progress</span>
          <span className="font-mono font-bold text-foreground">{currentProgress}% Completed</span>
        </div>
      </div>

      {/* Live Map Render */}
      <InteractiveRouteMap stops={stops} />
    </Card>
  );
};
