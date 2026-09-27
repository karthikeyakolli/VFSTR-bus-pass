import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Compass,
  Maximize2,
  Layers,
  LocateFixed,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { GeoPoint, RouteAlternative } from '@/services/navigation';

interface NavigationMapCanvasProps {
  currentLocation: GeoPoint;
  snappedLocation: GeoPoint;
  bearing: number;
  speedKmh: number;
  activeRoute: RouteAlternative;
  availableRoutes: RouteAlternative[];
  onSelectRoute: (routeId: string) => void;
  isNavigating?: boolean;
}

// Controller to auto-center or fit bounds dynamically
function MapCameraController({
  currentLocation,
  cameraMode,
  routePath,
}: {
  currentLocation: GeoPoint;
  cameraMode: 'follow' | 'overview' | 'free';
  routePath: GeoPoint[];
}) {
  const map = useMap();

  useEffect(() => {
    if (cameraMode === 'follow') {
      map.setView([currentLocation.lat, currentLocation.lng], 16, { animate: true });
    } else if (cameraMode === 'overview' && routePath.length > 0) {
      const bounds = L.latLngBounds(routePath.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [currentLocation, cameraMode, routePath, map]);

  return null;
}

// Vehicle Marker Icon with 360° heading rotation and radar pulse
const createVehicleMarkerIcon = (bearing: number, speedKmh: number) => {
  return L.divIcon({
    className: 'vehicle-nav-marker',
    html: `
      <div style="position: relative; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center;">
        <!-- Pulsing Radar Wave -->
        <div style="
          position: absolute;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.25);
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
        
        <!-- Rotating Vehicle Cockpit Puck -->
        <div style="
          width: 38px;
          height: 38px;
          background: #0f172a;
          border: 2.5px solid #10b981;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 0 12px rgba(16, 185, 129, 0.6);
          transform: rotate(${bearing}deg);
          transition: transform 0.25s linear;
        ">
          <!-- Chevron Arrow -->
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 19 21 12 17 5 21 12 2" fill="#10b981" />
          </svg>
        </div>

        <!-- Speed Badge Pill -->
        <div style="
          position: absolute;
          bottom: -8px;
          background: #1e293b;
          color: #38bdf8;
          font-size: 9px;
          font-weight: 800;
          font-family: monospace;
          padding: 1px 4px;
          border-radius: 4px;
          border: 1px solid #334155;
          white-space: nowrap;
        ">
          ${speedKmh} km/h
        </div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });
};

// Destination Campus Pin
const createDestinationPinIcon = () => {
  return L.divIcon({
    className: 'campus-dest-marker',
    html: `
      <div style="
        background: #8b5cf6;
        color: white;
        padding: 6px 10px;
        border-radius: 12px;
        font-weight: 800;
        font-size: 11px;
        display: flex;
        align-items: center;
        gap: 4px;
        box-shadow: 0 4px 10px rgba(139, 92, 246, 0.4);
        border: 2px solid white;
        white-space: nowrap;
      ">
        <span>🏛️ VFSTR Central</span>
      </div>
    `,
    iconSize: [120, 32],
    iconAnchor: [60, 16],
  });
};

// Pickup Pin
const createPickupPinIcon = () => {
  return L.divIcon({
    className: 'pickup-marker',
    html: `
      <div style="
        background: #0284c7;
        color: white;
        padding: 4px 8px;
        border-radius: 10px;
        font-weight: 800;
        font-size: 10px;
        display: flex;
        align-items: center;
        gap: 3px;
        box-shadow: 0 4px 8px rgba(2, 132, 199, 0.4);
        border: 2px solid white;
        white-space: nowrap;
      ">
        <span>📍 Departure Hub</span>
      </div>
    `,
    iconSize: [100, 28],
    iconAnchor: [50, 14],
  });
};

export const NavigationMapCanvas: React.FC<NavigationMapCanvasProps> = ({
  currentLocation,
  snappedLocation,
  bearing,
  speedKmh,
  activeRoute,
  availableRoutes,
  onSelectRoute,
}) => {
  const [cameraMode, setCameraMode] = useState<'follow' | 'overview' | 'free'>('follow');
  const [is3dTilt, setIs3dTilt] = useState(false);
  const [tileStyle, setTileStyle] = useState<'streets' | 'dark'>('dark');

  // Convert points to Leaflet format
  const activePolylineCoords: [number, number][] = useMemo(() => {
    return activeRoute.path.map((p) => [p.lat, p.lng]);
  }, [activeRoute]);

  const originPoint = activeRoute.path[0];
  const destPoint = activeRoute.path[activeRoute.path.length - 1];

  return (
    <div className="relative w-full h-[460px] sm:h-[540px] rounded-3xl overflow-hidden border-2 border-slate-700/60 shadow-2xl bg-slate-950">
      {/* 3D Perspective Tilt Container */}
      <div
        className="w-full h-full transition-transform duration-700 ease-out"
        style={{
          transform: is3dTilt ? 'perspective(900px) rotateX(32deg) scale(1.08)' : 'none',
          transformOrigin: 'bottom center',
        }}
      >
        <MapContainer
          center={[currentLocation.lat, currentLocation.lng]}
          zoom={15}
          scrollWheelZoom={true}
          className="w-full h-full z-0"
          zoomControl={false}
        >
          <MapCameraController
            currentLocation={snappedLocation}
            cameraMode={cameraMode}
            routePath={activeRoute.path}
          />

          {/* Dynamic Map Tiles */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url={
              tileStyle === 'dark'
                ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
                : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            }
          />

          {/* Inactive Alternative Route Polylines */}
          {availableRoutes
            .filter((r) => r.id !== activeRoute.id)
            .map((altRoute) => {
              const altCoords: [number, number][] = altRoute.path.map((p) => [p.lat, p.lng]);
              return (
                <Polyline
                  key={altRoute.id}
                  positions={altCoords}
                  color="#94a3b8"
                  weight={5}
                  opacity={0.65}
                  dashArray="4, 8"
                  eventHandlers={{
                    click: () => onSelectRoute(altRoute.id),
                  }}
                />
              );
            })}

          {/* Active Flowing Route Polyline (Uber/Rapido Blue/Emerald) */}
          <Polyline
            positions={activePolylineCoords}
            color="#10b981"
            weight={7}
            opacity={0.9}
            lineCap="round"
            lineJoin="round"
          />

          {/* Inner Glow Stripe */}
          <Polyline
            positions={activePolylineCoords}
            color="#34d399"
            weight={3}
            opacity={0.95}
            dashArray="10, 14"
          />

          {/* Origin / Departure Pin */}
          <Marker position={[originPoint.lat, originPoint.lng]} icon={createPickupPinIcon()}>
            <Popup>
              <div className="p-1 font-sans">
                <p className="font-bold text-xs text-slate-800">Trip Departure Stage</p>
                <p className="text-[11px] text-slate-600">Guntur NTR Circle Bus Terminal</p>
              </div>
            </Popup>
          </Marker>

          {/* Destination Campus Terminal Pin */}
          <Marker position={[destPoint.lat, destPoint.lng]} icon={createDestinationPinIcon()}>
            <Popup>
              <div className="p-1 font-sans">
                <p className="font-bold text-xs text-purple-700">VFSTR University Central Terminal</p>
                <p className="text-[11px] text-slate-600">Main Campus Transit Plaza & EV Bay</p>
              </div>
            </Popup>
          </Marker>

          {/* Live Snapped Vehicle Marker */}
          <Marker
            position={[snappedLocation.lat, snappedLocation.lng]}
            icon={createVehicleMarkerIcon(bearing, speedKmh)}
            zIndexOffset={1000}
          />
        </MapContainer>
      </div>

      {/* Floating Map Control Bar (Uber Cockpit Controls) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setCameraMode(cameraMode === 'follow' ? 'overview' : 'follow')}
          className={`h-9 px-3 rounded-xl shadow-lg border backdrop-blur-md transition-all ${
            cameraMode === 'follow'
              ? 'bg-emerald-600 text-white border-emerald-400 font-bold'
              : 'bg-slate-900/90 text-slate-200 border-slate-700'
          }`}
          title="Toggle Cockpit Follow Camera"
        >
          {cameraMode === 'follow' ? (
            <>
              <LocateFixed className="h-4 w-4 mr-1.5 animate-pulse text-white" />
              Follow
            </>
          ) : (
            <>
              <Maximize2 className="h-4 w-4 mr-1.5" />
              Overview
            </>
          )}
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIs3dTilt(!is3dTilt)}
          className={`h-9 px-3 rounded-xl shadow-lg border backdrop-blur-md ${
            is3dTilt
              ? 'bg-purple-600 text-white border-purple-400 font-bold'
              : 'bg-slate-900/90 text-slate-200 border-slate-700'
          }`}
          title="Toggle 3D Perspective Pitch View"
        >
          <Compass className="h-4 w-4 mr-1.5" />
          {is3dTilt ? '3D Cockpit' : '2D Flat'}
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setTileStyle(tileStyle === 'dark' ? 'streets' : 'dark')}
          className="h-9 px-3 rounded-xl shadow-lg border bg-slate-900/90 text-slate-200 border-slate-700 backdrop-blur-md"
          title="Toggle Carto / OpenStreetMap Tile Style"
        >
          <Layers className="h-4 w-4 mr-1.5" />
          {tileStyle === 'dark' ? 'Voyager' : 'Classic'}
        </Button>
      </div>

      {/* Alternative Routes Floating Selector Pills */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pointer-events-auto max-w-full">
        {availableRoutes.map((route) => {
          const isSelected = route.id === activeRoute.id;
          return (
            <button
              key={route.id}
              onClick={() => onSelectRoute(route.id)}
              className={`px-3 py-1.5 sm:py-2 rounded-xl text-left transition-all border backdrop-blur-md shadow-lg shrink-0 ${
                isSelected
                  ? 'bg-slate-900/95 border-emerald-500 text-white ring-2 ring-emerald-500/30'
                  : 'bg-slate-900/80 border-slate-700/80 text-slate-300 hover:bg-slate-800/90'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                <span className="font-bold text-xs whitespace-nowrap">{route.name}</span>
                {route.isFastest && (
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[9px] px-1 py-0 shrink-0">
                    Fastest
                  </Badge>
                )}
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-400 font-mono mt-0.5 ml-4 whitespace-nowrap">
                {route.totalDurationMinutes} min • {route.totalDistanceKm} km
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
