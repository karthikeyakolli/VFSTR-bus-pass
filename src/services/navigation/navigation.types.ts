/**
 * VFSTR Smart Transport — Enhanced Navigation & Routing Engine Types
 * Inspired by Uber (ARES/Gurafu) and Rapido Captain Navigation architectures.
 */

export interface GeoPoint {
  lat: number;
  lng: number;
  altitude?: number;
}

export type ManeuverType =
  | 'depart'
  | 'turn-slight-left'
  | 'turn-left'
  | 'turn-sharp-left'
  | 'turn-slight-right'
  | 'turn-right'
  | 'turn-sharp-right'
  | 'u-turn'
  | 'keep-left'
  | 'keep-right'
  | 'roundabout-enter'
  | 'roundabout-exit'
  | 'straight'
  | 'flyover'
  | 'arrive';

export interface RouteManeuver {
  type: ManeuverType;
  instruction: string;
  roadName: string;
  distanceMeters: number;
  durationSeconds: number;
  location: GeoPoint;
  bearingBefore: number;
  bearingAfter: number;
  voicePrompt: string;
  secondaryInstruction?: string;
  laneInfo?: {
    totalLanes: number;
    recommendedLane: number;
  };
}

export type CongestionLevel = 'freeflow' | 'moderate' | 'heavy' | 'gridlock';

export interface RouteSegment {
  id: string;
  startPoint: GeoPoint;
  endPoint: GeoPoint;
  distanceMeters: number;
  normalDurationSeconds: number;
  currentDurationSeconds: number;
  congestion: CongestionLevel;
  speedLimitKmh: number;
  currentSpeedKmh: number;
  roadName: string;
  coordinates: GeoPoint[];
}

export interface RouteAlternative {
  id: string;
  name: string;
  tag: string;
  totalDistanceKm: number;
  totalDurationMinutes: number;
  trafficDelayMinutes: number;
  isFastest: boolean;
  tollRequired: boolean;
  path: GeoPoint[];
  maneuvers: RouteManeuver[];
  segments: RouteSegment[];
  summary: string;
}

export interface MapMatchedPosition {
  rawGps: GeoPoint;
  snappedGps: GeoPoint;
  bearing: number;
  accuracyMeters: number;
  crossTrackDistanceMeters: number;
  speedKmh: number;
  segmentIndex: number;
  isOffRoute: boolean;
}

export type NavigationMode = 'REGULAR_ROUTE_BUS' | 'EXPRESS_CAMPUS_BUS' | 'FACULTY_SPECIAL_BUS';

export interface GeofenceZone {
  id: string;
  name: string;
  center: GeoPoint;
  radiusMeters: number;
  type: 'CAMPUS_GATE' | 'STUDENT_PICKUP' | 'TERMINAL_BAY' | 'SPEED_CALMED_ZONE';
  speedLimitKmh: number;
}

export interface NavigationSessionState {
  status: 'IDLE' | 'ROUTING' | 'NAVIGATING' | 'REROUTING' | 'ARRIVED' | 'PAUSED';
  activeRoute: RouteAlternative;
  availableRoutes: RouteAlternative[];
  currentLocation: GeoPoint;
  snappedLocation: GeoPoint;
  bearing: number;
  speedKmh: number;
  currentManeuverIndex: number;
  distanceToNextManeuverMeters: number;
  distanceRemainingKm: number;
  etaRemainingMinutes: number;
  estimatedArrivalTime: string;
  progressPercent: number;
  mode: NavigationMode;
  isOffRoute: boolean;
  voiceGuidanceEnabled: boolean;
  bilingualAudioEnabled: boolean;
  activeGeofence: GeofenceZone | null;
  rerouteCount: number;
  simulated: boolean;
  simSpeedMultiplier: number;
}
