import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { RouteStopDesignItem } from './RouteStopsDesigner';

// Fix default leaflet icons safely
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
  // Gracefully continue with SVG/divIcon
}

// Custom marker icon helper
const createCustomIcon = (seq: number, isCampus?: boolean, isOrigin?: boolean) => {
  const bg = isCampus ? '#10b981' : isOrigin ? '#3b82f6' : '#6366f1';
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background-color: ${bg};
        color: white;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 11px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
        border: 2px solid white;
      ">
        ${isCampus ? '★' : seq}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

function ChangeMapView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, 11);
  return null;
}

interface InteractiveRouteMapProps {
  stops: RouteStopDesignItem[];
}

export const InteractiveRouteMap: React.FC<InteractiveRouteMapProps> = ({ stops }) => {
  if (!stops || stops.length === 0) return null;

  const positions: [number, number][] = stops.map((s) => [s.lat, s.lng]);
  const centerPos = positions[Math.floor(positions.length / 2)];

  return (
    <div className="w-full h-80 rounded-2xl overflow-hidden border-2 border-border shadow-inner relative z-0">
      <MapContainer center={centerPos} zoom={11} scrollWheelZoom={false} className="w-full h-full">
        <ChangeMapView center={centerPos} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Route Connecting Line */}
        <Polyline positions={positions} color="#3b82f6" weight={4} opacity={0.8} dashArray="6, 8" />

        {/* Stop Markers */}
        {stops.map((stop, idx) => {
          const isOrigin = idx === 0;
          const isCampus = stop.isCampusEndpoint;
          return (
            <Marker
              key={stop.id}
              position={[stop.lat, stop.lng]}
              icon={createCustomIcon(stop.seq, isCampus, isOrigin)}
            >
              <Popup>
                <div className="p-1 space-y-1">
                  <div className="font-bold text-xs flex items-center justify-between gap-2">
                    <span>{stop.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono">
                      #{stop.seq}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600">{stop.landmark}</p>
                  <p className="text-[10px] font-mono text-gray-500">Pickup: {stop.morningTime}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
