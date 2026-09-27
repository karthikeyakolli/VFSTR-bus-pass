import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  LocateFixed,
  Maximize2,
  Bus,
  Clock,
  Database,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { TelemetryService, BusTelemetryPacket } from '@/services/TelemetryService';
import { DatabaseTelemetryInspector } from '@/components/database';
import { liveGpsTracker } from '@/services/tracking/LiveGPSTrackerService';

// Ensure Leaflet default icon paths are safe
try {
  if (L?.Icon?.Default?.prototype) {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }
} catch {
  // Gracefully fallback to divIcon
}

export interface TransitStopItem {
  id?: string | number;
  sequence: number;
  stopName: string;
  landmark?: string;
  morningTime?: string;
  latitude: number;
  longitude: number;
  isCampus?: boolean;
  isTerminal?: boolean;
}

export interface RealTimeTransitMapProps {
  stops: TransitStopItem[];
  busRegNo?: string;
  routeNumber?: string;
  routeName?: string;
  driverName?: string;
  heightClassName?: string;
  showControls?: boolean;
  autoTrackBus?: boolean;
  initialTileLayer?: 'voyager' | 'satellite' | 'streets' | 'dark';
}

// Map Auto Resizer and Camera Controller
function MapLifecycleController({
  stops,
  busLocation,
  cameraMode,
  userLocation,
}: {
  stops: TransitStopItem[];
  busLocation: { lat: number; lng: number } | null;
  cameraMode: 'route' | 'bus' | 'user' | 'free';
  userLocation: { lat: number; lng: number } | null;
}) {
  const map = useMap();

  // Invalidate size on mount to ensure tiles load seamlessly
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (cameraMode === 'bus' && busLocation) {
      map.setView([busLocation.lat, busLocation.lng], 15, { animate: true });
    } else if (cameraMode === 'user' && userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 16, { animate: true });
    } else if (cameraMode === 'route' && stops.length > 0) {
      const bounds = L.latLngBounds(stops.map((s) => [s.latitude, s.longitude]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [cameraMode, busLocation, userLocation, stops, map]);

  return null;
}

// Stop Marker Icon
const createStopMarkerIcon = (seq: number, isCampus?: boolean, isFirst?: boolean) => {
  const bg = isCampus ? '#10b981' : isFirst ? '#0284c7' : '#6366f1';
  return L.divIcon({
    className: 'custom-stop-marker',
    html: `
      <div style="
        background: ${bg};
        color: white;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 11px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.35);
        border: 2px solid white;
      ">
        ${isCampus ? '🏛️' : seq}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

// Moving Real-Time Bus Marker Icon with Heading Rotation
const createLiveBusIcon = (bearing: number, speedKmh: number, busRegNo: string) => {
  return L.divIcon({
    className: 'live-bus-marker',
    html: `
      <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
        <!-- Sonar Beacon Wave -->
        <div style="
          position: absolute;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.3);
          animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>

        <!-- Bus Disc -->
        <div style="
          width: 36px;
          height: 36px;
          background: #0f172a;
          border: 2.5px solid #10b981;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.5), 0 0 10px rgba(16, 185, 129, 0.7);
          transform: rotate(${bearing}deg);
          transition: transform 0.3s ease;
        ">
          <!-- Direction Arrow -->
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#10b981" stroke="#ffffff" stroke-width="1.5">
            <polygon points="12 2 19 21 12 17 5 21 12 2" />
          </svg>
        </div>

        <!-- Speed & Bus Tag -->
        <div style="
          position: absolute;
          bottom: -8px;
          background: #1e293b;
          color: #38bdf8;
          font-size: 8px;
          font-weight: 800;
          font-family: monospace;
          padding: 1px 3px;
          border-radius: 4px;
          border: 1px solid #334155;
          white-space: nowrap;
        ">
          ${busRegNo ? busRegNo + ' • ' : ''}${speedKmh} km/h
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
};

// User Location Pin
const createUserLocationIcon = () => {
  return L.divIcon({
    className: 'user-loc-marker',
    html: `
      <div style="
        width: 18px;
        height: 18px;
        background: #3b82f6;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 0 12px #3b82f6, 0 4px 6px rgba(0, 0, 0, 0.4);
      "></div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
};

export const RealTimeTransitMap: React.FC<RealTimeTransitMapProps> = ({
  stops,
  busRegNo = 'AP 07 TJ 4521',
  routeNumber = 'Route #14',
  routeName = 'Guntur City Express',
  driverName = 'K. Venkateswarlu',
  heightClassName = 'h-[440px]',
  showControls = true,
  autoTrackBus = false,
  initialTileLayer = 'voyager',
}) => {
  const [tileLayer, setTileLayer] = useState<'voyager' | 'satellite' | 'streets' | 'dark'>(initialTileLayer);
  const [cameraMode, setCameraMode] = useState<'route' | 'bus' | 'user' | 'free'>(autoTrackBus ? 'bus' : 'route');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [isRealGpsLive, setIsRealGpsLive] = useState(false);
  const [isDbInspectorOpen, setIsDbInspectorOpen] = useState(false);

  // 1. Start dynamic GPS tracking into database
  useEffect(() => {
    liveGpsTracker.startTracking(busRegNo, routeNumber, driverName);
  }, [busRegNo, routeNumber, driverName]);

  // Live Bus Telemetry state
  const [busPacket, setBusPacket] = useState<BusTelemetryPacket>({
    busRegNo,
    routeNumber,
    driverName,
    latitude: stops[0]?.latitude || 16.3025,
    longitude: stops[0]?.longitude || 80.4431,
    speedKmh: 42,
    headingDeg: 140,
    timestamp: 'Live',
    isLiveGps: true,
    currentStopName: stops[0]?.stopName || 'Departure Hub',
    nextStopName: stops[1]?.stopName || 'Next Stage',
    progressPercent: 35,
  });

  // 2. Subscribe to Live GPS Telemetry
  useEffect(() => {
    const unsubscribe = TelemetryService.subscribeToBusLocation(busRegNo, (packet) => {
      setIsRealGpsLive(true);
      setBusPacket(packet);
    });

    return () => unsubscribe();
  }, [busRegNo]);

  // 2. Fallback simulation loop if driver is not actively broadcasting
  useEffect(() => {
    if (isRealGpsLive || stops.length < 2) return;

    let progress = 0.25;
    const interval = setInterval(() => {
      progress = (progress + 0.015) % 0.98;

      const totalSegments = stops.length - 1;
      const currentSegment = Math.min(Math.floor(progress * totalSegments), totalSegments - 1);
      const sub = (progress * totalSegments) - currentSegment;

      const p1 = stops[currentSegment];
      const p2 = stops[currentSegment + 1];

      if (p1 && p2) {
        const curLat = p1.latitude + (p2.latitude - p1.latitude) * sub;
        const curLng = p1.longitude + (p2.longitude - p1.longitude) * sub;

        setBusPacket((prev) => ({
          ...prev,
          latitude: curLat,
          longitude: curLng,
          currentStopName: p1.stopName,
          nextStopName: p2.stopName,
          speedKmh: Math.round(40 + Math.sin(Date.now() / 2500) * 12),
          progressPercent: Math.round(progress * 100),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        }));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isRealGpsLive, stops]);

  // Polyline positions
  const routePolylineCoords: [number, number][] = useMemo(() => {
    return stops.map((s) => [s.latitude, s.longitude]);
  }, [stops]);

  // Locate User GPS
  const handleLocateUser = () => {
    if (!navigator.geolocation) return;
    setIsLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocatingUser(false);
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setCameraMode('user');
      },
      () => {
        setIsLocatingUser(false);
        // Fallback default to Guntur area
        setUserLocation({ lat: 16.298, lng: 80.445 });
        setCameraMode('user');
      }
    );
  };

  // Tile Layer URL Config
  const getTileUrl = () => {
    switch (tileLayer) {
      case 'satellite':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'dark':
        return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      case 'streets':
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      case 'voyager':
      default:
        return 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    }
  };

  const centerPos: [number, number] = stops.length > 0
    ? [stops[Math.floor(stops.length / 2)].latitude, stops[Math.floor(stops.length / 2)].longitude]
    : [16.2334, 80.5475];

  return (
    <div className={`relative w-full ${heightClassName} rounded-3xl overflow-hidden border-2 border-border shadow-2xl bg-card`}>
      <MapContainer
        center={centerPos}
        zoom={12}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <MapLifecycleController
          stops={stops}
          busLocation={{ lat: busPacket.latitude, lng: busPacket.longitude }}
          cameraMode={cameraMode}
          userLocation={userLocation}
        />

        {/* Dynamic Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> | CARTO | Esri'
          url={getTileUrl()}
        />

        {/* Route Outer Casing Line */}
        <Polyline
          positions={routePolylineCoords}
          color="#0284c7"
          weight={7}
          opacity={0.85}
          lineCap="round"
          lineJoin="round"
        />

        {/* Route Inner Dash Line */}
        <Polyline
          positions={routePolylineCoords}
          color="#38bdf8"
          weight={3}
          opacity={0.95}
          dashArray="8, 12"
        />

        {/* Stop Markers */}
        {stops.map((stop, idx) => {
          const isCampus = stop.isCampus || stop.isTerminal;
          const isFirst = idx === 0;

          return (
            <Marker
              key={stop.id || idx}
              position={[stop.latitude, stop.longitude]}
              icon={createStopMarkerIcon(stop.sequence, isCampus, isFirst)}
            >
              <Popup>
                <div className="p-1 font-sans space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-xs text-foreground">{stop.stopName}</span>
                    <Badge variant="outline" className="text-[9px] px-1 font-mono">
                      #{stop.sequence}
                    </Badge>
                  </div>
                  {stop.landmark && <p className="text-[11px] text-muted-foreground">{stop.landmark}</p>}
                  {stop.morningTime && (
                    <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-bold pt-0.5">
                      <Clock className="h-3 w-3" /> Pickup: {stop.morningTime}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Live Moving Bus Marker */}
        <Marker
          position={[busPacket.latitude, busPacket.longitude]}
          icon={createLiveBusIcon(busPacket.headingDeg, busPacket.speedKmh, busRegNo)}
          zIndexOffset={1000}
        >
          <Popup>
            <div className="p-1.5 font-sans space-y-1 min-w-[180px]">
              <div className="flex items-center justify-between gap-2 border-b border-border pb-1">
                <span className="font-extrabold text-xs text-foreground flex items-center gap-1">
                  <Bus className="h-3.5 w-3.5 text-emerald-600" /> {busRegNo}
                </span>
                <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                  {busPacket.speedKmh} km/h
                </span>
              </div>
              <p className="text-xs font-semibold text-primary">{routeNumber} ({routeName})</p>
              <p className="text-[11px] text-muted-foreground">Driver: {driverName}</p>
              <div className="text-[10px] text-slate-500 pt-1 border-t border-border flex items-center justify-between">
                <span>Next: {busPacket.nextStopName}</span>
                <span className="font-mono">{busPacket.timestamp}</span>
              </div>
            </div>
          </Popup>
        </Marker>

        {/* User Geolocation Marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={createUserLocationIcon()}>
            <Popup>
              <div className="p-1 font-sans text-xs">
                <p className="font-bold text-blue-600">Your Current Location</p>
                <p className="text-[11px] text-muted-foreground">GPS Location Located</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Floating Header Info Ribbon */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="pointer-events-auto bg-card/90 border border-border/80 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-lg flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold text-foreground truncate max-w-[200px] sm:max-w-xs">
            {routeNumber}: {busRegNo}
          </span>
          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-mono">
            {busPacket.speedKmh} km/h
          </Badge>
        </div>

        {/* Floating Quick Camera & Tile Controls */}
        {showControls && (
          <div className="pointer-events-auto flex items-center gap-1.5 bg-card/90 border border-border/80 backdrop-blur-md p-1 rounded-2xl shadow-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCameraMode(cameraMode === 'bus' ? 'route' : 'bus')}
              className={`h-8 px-2.5 rounded-xl text-xs font-bold ${
                cameraMode === 'bus' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'
              }`}
              title="Lock Camera on Live Bus"
            >
              <Bus className="h-3.5 w-3.5 mr-1" />
              Bus
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCameraMode('route')}
              className={`h-8 px-2.5 rounded-xl text-xs font-bold ${
                cameraMode === 'route' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'
              }`}
              title="Fit Entire Route"
            >
              <Maximize2 className="h-3.5 w-3.5 mr-1" />
              Fit
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLocateUser}
              className={`h-8 px-2.5 rounded-xl text-xs font-bold ${
                cameraMode === 'user' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'
              }`}
              title="Locate My GPS Position"
            >
              <LocateFixed className={`h-3.5 w-3.5 mr-1 ${isLocatingUser ? 'animate-spin' : ''}`} />
              Me
            </Button>

            {/* Live Database Inspector Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDbInspectorOpen(true)}
              className="h-8 px-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground"
              title="Inspect Live Database GPS Telemetry"
            >
              <Database className="h-3.5 w-3.5 mr-1 text-emerald-500" />
              DB
            </Button>

            {/* Tile Layer Selector */}
            <select
              value={tileLayer}
              onChange={(e) => setTileLayer(e.target.value as any)}
              className="h-8 px-2 rounded-xl text-xs font-semibold bg-muted/60 text-foreground border border-border focus:outline-none cursor-pointer"
            >
              <option value="voyager">Voyager</option>
              <option value="satellite">Satellite</option>
              <option value="dark">Dark</option>
              <option value="streets">OpenStreet</option>
            </select>
          </div>
        )}
      </div>

      {/* Floating Footer Legend */}
      <div className="absolute bottom-3 left-3 z-20 pointer-events-none hidden sm:flex items-center gap-2 bg-card/85 border border-border/80 backdrop-blur-md px-3 py-1 rounded-xl text-[10px] text-muted-foreground font-mono shadow-md">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-sky-500 inline-block" /> Boarding Stop
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Live Bus
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" /> University
        </span>
      </div>

      {/* Database Telemetry Inspector Modal */}
      <DatabaseTelemetryInspector
        isOpen={isDbInspectorOpen}
        onClose={() => setIsDbInspectorOpen(false)}
        busRegNo={busRegNo}
      />
    </div>
  );
};
