import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useToast } from '@/hooks/useToast';
import {
  MapPin,
  Clock,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Navigation,
  Compass,
  Check,
  Save,
  Route as RouteIcon,
  Layers,
  Sparkles,
  Building,
} from 'lucide-react';
import { InteractiveRouteMap } from './InteractiveRouteMap';

export interface RouteStopDesignItem {
  id: string;
  seq: number;
  name: string;
  morningTime: string;
  eveningDropTime: string;
  landmark: string;
  lat: number;
  lng: number;
  feeTier: string;
  isCampusEndpoint?: boolean;
}

export interface PresetRoute {
  id: string;
  routeCode: string;
  routeName: string;
  busNo: string;
  driverName: string;
  stopsCount: number;
  distanceKm: number;
  initialStops: RouteStopDesignItem[];
}

const PRESET_ROUTES: PresetRoute[] = [
  {
    id: 'r14',
    routeCode: 'Route #14',
    routeName: 'Guntur City Express',
    busNo: 'AP 07 TJ 4521',
    driverName: 'Mr. K. Venkateswarlu',
    stopsCount: 6,
    distanceKm: 24.5,
    initialStops: [
      { id: '1', seq: 1, name: 'Guntur Bus Station Depot', morningTime: '07:00 AM', eveningDropTime: '05:55 PM', landmark: 'Platform 1 Departure Gate', lat: 16.3067, lng: 80.4365, feeTier: 'Standard' },
      { id: '2', seq: 2, name: 'Old Bus Stand, Guntur', morningTime: '07:10 AM', eveningDropTime: '05:45 PM', landmark: 'Near Municipal High School', lat: 16.2995, lng: 80.4430, feeTier: 'Standard' },
      { id: '3', seq: 3, name: 'Collectorate Junction', morningTime: '07:18 AM', eveningDropTime: '05:38 PM', landmark: 'Opposite State Bank Branch', lat: 16.2910, lng: 80.4505, feeTier: 'Standard' },
      { id: '4', seq: 4, name: 'Market Yard Center', morningTime: '07:25 AM', eveningDropTime: '05:30 PM', landmark: 'Beside HP Petrol Pump', lat: 16.2750, lng: 80.4680, feeTier: 'Standard' },
      { id: '5', seq: 5, name: 'Auto Nagar Arch', morningTime: '07:32 AM', eveningDropTime: '05:22 PM', landmark: 'Near Fire Station Signal', lat: 16.2610, lng: 80.4910, feeTier: 'Standard' },
      { id: '6', seq: 6, name: 'VFSTR Vadlamudi Main Campus', morningTime: '07:50 AM', eveningDropTime: '05:15 PM', landmark: 'Transport Bay 3', lat: 16.2335, lng: 80.5486, feeTier: 'Terminal', isCampusEndpoint: true },
    ],
  },
  {
    id: 'r08',
    routeCode: 'Route #08',
    routeName: 'Vijayawada Highway Line',
    busNo: 'AP 16 TZ 8812',
    driverName: 'Mr. M. Sambaiah',
    stopsCount: 5,
    distanceKm: 42.0,
    initialStops: [
      { id: '801', seq: 1, name: 'Benz Circle, Vijayawada', morningTime: '06:45 AM', eveningDropTime: '06:10 PM', landmark: 'Near Novotel Flyover Pillar #12', lat: 16.5062, lng: 80.6480, feeTier: 'Extended' },
      { id: '802', seq: 2, name: 'Auto Nagar Bus Stop, Vijayawada', morningTime: '06:55 AM', eveningDropTime: '06:00 PM', landmark: 'Opposite Gate #2', lat: 16.4950, lng: 80.6650, feeTier: 'Extended' },
      { id: '803', seq: 3, name: 'Mangalagiri Bypass Junction', morningTime: '07:15 AM', eveningDropTime: '05:40 PM', landmark: 'Near NRI General Hospital', lat: 16.4410, lng: 80.5600, feeTier: 'Standard' },
      { id: '804', seq: 4, name: 'Pedakakani Arch', morningTime: '07:30 AM', eveningDropTime: '05:25 PM', landmark: 'Near Shiva Temple Gate', lat: 16.3450, lng: 80.5100, feeTier: 'Standard' },
      { id: '805', seq: 5, name: 'VFSTR Vadlamudi Main Campus', morningTime: '07:50 AM', eveningDropTime: '05:15 PM', landmark: 'Transport Bay 1', lat: 16.2335, lng: 80.5486, feeTier: 'Terminal', isCampusEndpoint: true },
    ],
  },
  {
    id: 'r21',
    routeCode: 'Route #21',
    routeName: 'Tenali Town Shuttle',
    busNo: 'AP 07 TL 3099',
    driverName: 'Mr. P. Srinivasa Rao',
    stopsCount: 4,
    distanceKm: 16.8,
    initialStops: [
      { id: '2101', seq: 1, name: 'Tenali Railway Station', morningTime: '07:15 AM', eveningDropTime: '05:45 PM', landmark: 'Platform 1 Clock Tower', lat: 16.2430, lng: 80.6400, feeTier: 'Local' },
      { id: '2102', seq: 2, name: 'Tenali Bose Road Center', morningTime: '07:22 AM', eveningDropTime: '05:38 PM', landmark: 'Near Guntur Bank Branch', lat: 16.2380, lng: 80.6310, feeTier: 'Local' },
      { id: '2103', seq: 3, name: 'Chenchupet Junction', morningTime: '07:30 AM', eveningDropTime: '05:30 PM', landmark: 'Beside Municipal Water Tank', lat: 16.2350, lng: 80.6100, feeTier: 'Local' },
      { id: '2104', seq: 4, name: 'VFSTR Vadlamudi Main Campus', morningTime: '07:50 AM', eveningDropTime: '05:15 PM', landmark: 'Transport Bay 4', lat: 16.2335, lng: 80.5486, feeTier: 'Terminal', isCampusEndpoint: true },
    ],
  },
];

export const RouteStopsDesigner: React.FC = () => {
  const toast = useToast();
  const [selectedPresetId, setSelectedPresetId] = useState<string>('r14');
  const activePreset = PRESET_ROUTES.find((r) => r.id === selectedPresetId) || PRESET_ROUTES[0];
  
  const [stops, setStops] = useState<RouteStopDesignItem[]>(activePreset.initialStops);
  const [newStopName, setNewStopName] = useState('');
  const [newLandmark, setNewLandmark] = useState('');
  const [newMorningTime, setNewMorningTime] = useState('07:20 AM');
  const [isSaved, setIsSaved] = useState(false);

  // Switch preset route
  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const found = PRESET_ROUTES.find((r) => r.id === presetId);
    if (found) {
      setStops(found.initialStops);
      setIsSaved(false);
      toast.info('Loaded Route Preset', `Loaded ${found.routeCode} - ${found.routeName} with ${found.initialStops.length} stops.`);
    }
  };

  // Add custom new stop
  const handleAddStop = () => {
    if (!newStopName.trim()) {
      toast.error('Stop Name Required', 'Please enter a valid stop name before adding.');
      return;
    }

    const newId = `custom_${Date.now()}`;
    // Insert before campus endpoint (last stop)
    const campusStop = stops[stops.length - 1];
    const middleStops = stops.slice(0, stops.length - 1);

    const newStop: RouteStopDesignItem = {
      id: newId,
      seq: middleStops.length + 1,
      name: newStopName.trim(),
      morningTime: newMorningTime,
      eveningDropTime: '05:35 PM',
      landmark: newLandmark.trim() || 'Near Main Center Marker',
      lat: 16.2700,
      lng: 80.4800,
      feeTier: 'Standard',
    };

    const reorderedMiddle = [...middleStops, newStop].map((s, idx) => ({
      ...s,
      seq: idx + 1,
    }));

    const updated = [
      ...reorderedMiddle,
      { ...campusStop, seq: reorderedMiddle.length + 1 },
    ];

    setStops(updated);
    setNewStopName('');
    setNewLandmark('');
    setIsSaved(false);
    toast.success('Stop Added Successfully', `Added "${newStop.name}" at sequence position #${newStop.seq}.`);
  };

  // Delete stop
  const handleDeleteStop = (id: string) => {
    if (stops.length <= 2) {
      toast.error('Minimum Stops Required', 'A bus route must have at least 1 origin stop and 1 campus destination stop.');
      return;
    }

    const filtered = stops.filter((s) => s.id !== id);
    const reordered = filtered.map((s, idx) => ({ ...s, seq: idx + 1 }));
    setStops(reordered);
    setIsSaved(false);
    toast.info('Stop Removed', 'Route stop sequence updated.');
  };

  // Move stop up/down
  const handleMoveStop = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index <= 0) return;
    if (direction === 'down' && index >= stops.length - 2) return; // Leave campus endpoint last

    const updated = [...stops];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Recalculate seq
    const reordered = updated.map((s, idx) => ({ ...s, seq: idx + 1 }));
    setStops(reordered);
    setIsSaved(false);
  };

  // Save Config
  const handleSaveRoute = () => {
    setIsSaved(true);
    toast.success(
      'Route & Stops Configuration Saved',
      `Saved ${stops.length} stops for ${activePreset.routeCode} (${activePreset.routeName}).`
    );
  };

  // Open turn-by-turn route in Google Maps
  const handleOpenGoogleMapsRoute = () => {
    const origin = encodeURIComponent(stops[0].name + ', Guntur');
    const destination = encodeURIComponent('Vignan University Vadlamudi');
    const waypoints = stops
      .slice(1, -1)
      .map((s) => encodeURIComponent(s.name + ', AP'))
      .join('|');

    const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=driving`;
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="p-6 border-2 border-primary/20 bg-card space-y-6 shadow-lg">
      <SectionHeader
        title="Interactive Bus Route & Stops Designer"
        subtitle="Visual stop sequence architect: add boarding points, reorder timetables, set GPS landmarks, and generate Google Maps paths"
        badge={
          <Badge variant="secondary" className="font-extrabold flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-500" /> Route Architect Studio
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Navigation className="h-3.5 w-3.5 text-primary" />}
              onClick={handleOpenGoogleMapsRoute}
            >
              Open Route in Google Maps
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={isSaved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
              onClick={handleSaveRoute}
              className={isSaved ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
            >
              {isSaved ? 'Saved to System' : 'Save Route Blueprint'}
            </Button>
          </div>
        }
      />

      {/* Preset Route Selection Tabs */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
          Select Route Blueprint to Customize
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PRESET_ROUTES.map((r) => (
            <button
              key={r.id}
              onClick={() => handleSelectPreset(r.id)}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                selectedPresetId === r.id
                  ? 'border-primary bg-primary/10 ring-2 ring-primary/30 font-bold text-foreground shadow-sm'
                  : 'border-border/80 bg-muted/30 hover:bg-muted/60 text-muted-foreground'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-primary">{r.routeCode}</span>
                <Badge variant="outline" className="text-[9px]">{r.busNo}</Badge>
              </div>
              <h4 className="text-sm font-extrabold text-foreground mt-1 truncate">{r.routeName}</h4>
              <p className="text-[11px] text-muted-foreground mt-1 flex items-center justify-between">
                <span>{r.initialStops.length} Stops</span>
                <span>{r.distanceKm} km Total</span>
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Map Visualizer */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            Live Route Geographic Map View
          </span>
          <Badge variant="outline" className="text-[10px] text-primary">OpenStreetMap GIS</Badge>
        </div>
        <InteractiveRouteMap stops={stops} />
      </div>
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
            <RouteIcon className="h-4 w-4 text-blue-400" /> Sequential Stop Pipeline
          </span>
          <span className="text-xs text-slate-300 font-mono">
            Origin: <strong className="text-white">{stops[0]?.name}</strong> ➔ Destination: <strong className="text-white">{stops[stops.length - 1]?.name}</strong>
          </span>
        </div>

        <div className="overflow-x-auto scrollbar-none py-3">
          <div className="min-w-[680px] flex items-center justify-between relative px-4">
            <div className="absolute top-1/2 left-6 right-6 h-1 bg-blue-500/40 -translate-y-1/2 rounded-full" />
            {stops.map((stop, idx) => (
              <div key={stop.id} className="relative z-10 flex flex-col items-center">
                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center font-extrabold text-xs shadow-lg ${
                    stop.isCampusEndpoint
                      ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/30'
                      : idx === 0
                      ? 'bg-blue-500 text-white ring-4 ring-blue-500/30'
                      : 'bg-slate-800 text-blue-300 border-2 border-blue-400'
                  }`}
                >
                  {stop.isCampusEndpoint ? <Building className="h-4 w-4" /> : `#${stop.seq}`}
                </div>
                <span className="text-[11px] font-bold text-slate-200 mt-2 max-w-[110px] text-center truncate">
                  {stop.name}
                </span>
                <span className="text-[9px] text-slate-400 font-mono">{stop.morningTime}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add New Stop Form Controls */}
      <div className="p-4 rounded-xl border-2 border-primary/20 bg-primary/5 space-y-3">
        <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
          <Plus className="h-4 w-4 text-primary" /> Add New Boarding Stop to {activePreset.routeCode}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            placeholder="Stop Name (e.g., Gorantla Center)"
            value={newStopName}
            onChange={(e) => setNewStopName(e.target.value)}
            leftIcon={<MapPin className="h-4 w-4 text-muted-foreground" />}
            className="text-xs h-9 bg-background"
          />
          <Input
            placeholder="Landmark (e.g., Opp. HDFC Bank)"
            value={newLandmark}
            onChange={(e) => setNewLandmark(e.target.value)}
            leftIcon={<Compass className="h-4 w-4 text-muted-foreground" />}
            className="text-xs h-9 bg-background"
          />
          <div className="flex gap-2">
            <Input
              placeholder="Pickup Time"
              value={newMorningTime}
              onChange={(e) => setNewMorningTime(e.target.value)}
              leftIcon={<Clock className="h-4 w-4 text-muted-foreground" />}
              className="text-xs h-9 bg-background"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddStop}
              className="shrink-0 h-9"
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Add Stop
            </Button>
          </div>
        </div>
      </div>

      {/* List of Configured Stops with Re-ordering & Deleting */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-extrabold text-foreground flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" /> Configured Route Stops ({stops.length})
          </h4>
          <span className="text-xs text-muted-foreground">Reorder stops using arrows</span>
        </div>

        <div className="space-y-2">
          {stops.map((stop, idx) => (
            <div
              key={stop.id}
              className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                stop.isCampusEndpoint
                  ? 'border-emerald-500/40 bg-emerald-500/10'
                  : idx === 0
                  ? 'border-blue-500/40 bg-blue-500/10'
                  : 'border-border bg-card'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-8 w-8 rounded-lg flex items-center justify-center font-extrabold text-xs shrink-0 ${
                    stop.isCampusEndpoint
                      ? 'bg-emerald-500 text-white'
                      : idx === 0
                      ? 'bg-blue-600 text-white'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  0{stop.seq}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-foreground">{stop.name}</span>
                    {stop.isCampusEndpoint ? (
                      <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold">
                        Terminal Campus
                      </Badge>
                    ) : idx === 0 ? (
                      <Badge variant="outline" className="border-blue-500 text-blue-600 dark:text-blue-400 font-bold">
                        Route Origin
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3 text-primary shrink-0" />
                    <span>{stop.landmark}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-border/60">
                <div className="text-right text-xs">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Pickup Time</span>
                  <span className="font-mono font-bold text-foreground">{stop.morningTime}</span>
                </div>

                {!stop.isCampusEndpoint && (
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={idx === 0}
                      onClick={() => handleMoveStop(idx, 'up')}
                      title="Move stop up"
                    >
                      <MoveUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={idx >= stops.length - 2}
                      onClick={() => handleMoveStop(idx, 'down')}
                      title="Move stop down"
                    >
                      <MoveDown className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteStop(stop.id)}
                      title="Delete stop"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
