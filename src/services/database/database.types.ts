/**
 * VFSTR Smart Transport Database TypeScript Models
 */

export type BusOperationalStatus =
  | 'ACTIVE_ON_TRIP'
  | 'STANDBY_AT_CAMPUS'
  | 'IN_MAINTENANCE'
  | 'OFF_DUTY'
  | 'EMERGENCY_HALT';

export type TelemetrySourceType =
  | 'HARDWARE_AIS140_GPS'
  | 'DRIVER_DEVICE_GEOLOCATION'
  | 'HIGHWAY_SIMULATOR';

export type GeofenceEventType =
  | 'GEOFENCE_ENTER'
  | 'GEOFENCE_EXIT'
  | 'SPEED_LIMIT_EXCEEDED'
  | 'UNAUTHORIZED_STOP';

export type TransitFleetMode =
  | 'REGULAR_ROUTE_BUS'
  | 'EXPRESS_CAMPUS_BUS'
  | 'FACULTY_SPECIAL_BUS';

export interface TransportCorridorEntity {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface TransitRouteEntity {
  id: string;
  routeNumber: number;
  routeCode: string;
  corridorId: string;
  finalTerminal: string;
  direction: string;
  totalDistanceKm: number;
  estimatedTravelTimeMins: number;
  annualFeeInr: number;
  transitPathRaw: string;
  isActive: boolean;
}

export interface RouteStopEntity {
  id: string;
  routeId: string;
  sequenceNo: number;
  stopName: string;
  landmark?: string;
  district: string;
  morningPickupTime?: string;
  latitude: number;
  longitude: number;
  isCampus: boolean;
  isTerminal: boolean;
}

export interface BusFleetEntity {
  id: string;
  registrationNo: string;
  fleetCode: string;
  seatingCapacity: number;
  assignedRouteId?: string;
  fleetMode: TransitFleetMode;
  driverName: string;
  driverPhone: string;
  driverExperienceYears: number;
  operationalStatus: BusOperationalStatus;
  speedGovernorLimitKmh: number;
  hasEmergencyExit: boolean;
  hasFirstAidKit: boolean;
  hasCctvSurveillance: boolean;
  hasHardwareGps: boolean;
}

export interface GpsTelemetryLogEntity {
  id: number;
  busId: string;
  busRegNo: string;
  recordedAt: string;
  rawLatitude: number;
  rawLongitude: number;
  snappedLatitude: number;
  snappedLongitude: number;
  speedKmh: number;
  headingDeg: number;
  altitudeMeters: number;
  accuracyMeters: number;
  crossTrackDeviationMeters: number;
  isOffRoute: boolean;
  currentStopName: string;
  nextStopName: string;
  progressPercentage: number;
  source: TelemetrySourceType;
}

export interface ActiveVehicleStateEntity {
  busId: string;
  busRegNo: string;
  lastTelemetryId: number;
  currentLatitude: number;
  currentLongitude: number;
  speedKmh: number;
  headingDeg: number;
  currentStopName: string;
  nextStopName: string;
  etaMins: number;
  updatedAt: string;
}

export interface GeofenceZoneEntity {
  id: string;
  name: string;
  zoneType: 'CAMPUS_GATE' | 'SPEED_CALMED' | 'TERMINAL_BAY';
  centerLatitude: number;
  centerLongitude: number;
  radiusMeters: number;
  speedLimitKmh: number;
}

export interface GeofenceEventEntity {
  id: number;
  busId: string;
  geofenceId?: string;
  geofenceName: string;
  eventType: GeofenceEventType;
  speedKmh: number;
  speedLimitKmh: number;
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface StudentBoardingRecordEntity {
  id: string;
  studentRegNo: string;
  studentName: string;
  busRegNo: string;
  routeNumber: number;
  stopSequence: number;
  stopName: string;
  boardedAt: string;
  latitude?: number;
  longitude?: number;
  verifiedByDriver: string;
  verificationHash: string;
}

export interface EmergencySosEntity {
  id: string;
  busRegNo: string;
  routeNumber?: number;
  triggeredByRole: 'DRIVER' | 'STUDENT';
  userId: string;
  userName: string;
  phoneNumber: string;
  latitude: number;
  longitude: number;
  speedKmh: number;
  nearestLandmark?: string;
  emergencyType: 'GENERAL_EMERGENCY' | 'MEDICAL' | 'ACCIDENT' | 'BREAKDOWN' | 'SECURITY';
  status: 'TRIGGERED' | 'DISPATCHED' | 'RESOLVED';
  dispatchedAt: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

export interface BusOccupancyEntity {
  busRegNo: string;
  routeNumber: number;
  currentOccupancy: number;
  totalCapacity: number;
  availableSeats: number;
  lastScannedStop?: string;
  lastScanTimestamp: string;
  updatedAt: string;
}

export interface ProximityAlertSubscriptionEntity {
  id: string;
  studentRegNo: string;
  busRegNo: string;
  boardingStopName: string;
  boardingLatitude: number;
  boardingLongitude: number;
  proximityThresholdMeters: number;
  isTriggered: boolean;
  lastAlertSentAt?: string;
  createdAt: string;
}

export interface OfflinePassWalletEntity {
  studentRegNo: string;
  studentName: string;
  routeNumber: number;
  routeName: string;
  boardingStop: string;
  seatAssigned: string;
  academicYear: string;
  validUntil: string;
  cryptographicSignature: string;
  cachedOfflineAt: string;
}

export interface DatabaseStats {
  totalTelemetryLogs: number;
  activeBusesCount: number;
  totalGeofenceAlerts: number;
  totalBoardingsToday: number;
  activeEmergencySosCount: number;
  latestPingTimestamp?: string;
  dbStorageEngine: 'IndexedDB + Supabase Realtime' | 'LocalStorage Fallback';
}

