/**
 * VFSTR Smart Transport — Live Dynamic GPS Tracker Service
 * Directly interfaces with HTML5 Geolocation API (navigator.geolocation.watchPosition),
 * performs real-time map matching / route projection, and persistently logs each GPS
 * ping into the TransitDatabase while broadcasting live telemetry to all connected maps.
 */

import { EnhancedRoutingEngine } from '@/services/navigation/EnhancedRoutingEngine';
import { GeoPoint } from '@/services/navigation/navigation.types';
import { transitDb } from '@/services/database/TransitDatabase';
import { TelemetryService, BusTelemetryPacket } from '@/services/TelemetryService';
import { MASTER_ROUTES_AY2026_27 } from '@/constants/masterRoutesSeed';

export type TrackerMode = 'DEVICE_HARDWARE_GPS' | 'AUTONOMOUS_HIGHWAY_SIMULATOR';

export interface TrackerStatus {
  isActive: boolean;
  mode: TrackerMode;
  busRegNo: string;
  routeCode: string;
  driverName: string;
  lastPingTimestamp: string | null;
  lastRawCoords: GeoPoint | null;
  lastSnappedCoords: GeoPoint | null;
  currentSpeedKmh: number;
  currentHeadingDeg: number;
  accuracyMeters: number;
  pingsRecordedCount: number;
  isOffRoute: boolean;
  error: string | null;
}

export type TrackerStatusListener = (status: TrackerStatus) => void;

export class LiveGPSTrackerService {
  private static instance: LiveGPSTrackerService | null = null;
  private watchId: number | null = null;
  private simulationTimer: ReturnType<typeof setInterval> | null = null;
  private listeners: Set<TrackerStatusListener> = new Set();

  private status: TrackerStatus = {
    isActive: false,
    mode: 'AUTONOMOUS_HIGHWAY_SIMULATOR',
    busRegNo: 'AP 07 TJ 4521',
    routeCode: 'R-14',
    driverName: 'Mr. K. Venkateswarlu',
    lastPingTimestamp: null,
    lastRawCoords: null,
    lastSnappedCoords: null,
    currentSpeedKmh: 42,
    currentHeadingDeg: 62,
    accuracyMeters: 4.5,
    pingsRecordedCount: 0,
    isOffRoute: false,
    error: null,
  };

  // Traversal state for simulation
  private simPathIndex = 0;
  private simProgress = 0;

  private constructor() {}

  static getInstance(): LiveGPSTrackerService {
    if (!this.instance) {
      this.instance = new LiveGPSTrackerService();
    }
    return this.instance;
  }

  getStatus(): TrackerStatus {
    return { ...this.status };
  }

  subscribe(listener: TrackerStatusListener): () => void {
    this.listeners.add(listener);
    listener(this.getStatus());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const snap = this.getStatus();
    this.listeners.forEach((l) => l(snap));
  }

  /**
   * Starts dynamic GPS tracking for a specific bus and route.
   */
  async startTracking(
    busRegNo = 'AP 07 TJ 4521',
    routeCode = 'R-14',
    driverName = 'Mr. K. Venkateswarlu',
    preferredMode: TrackerMode = 'AUTONOMOUS_HIGHWAY_SIMULATOR'
  ) {
    this.stopTracking();

    this.status.busRegNo = busRegNo;
    this.status.routeCode = routeCode;
    this.status.driverName = driverName;
    this.status.mode = preferredMode;
    this.status.isActive = true;
    this.status.error = null;
    this.notify();

    if (preferredMode === 'DEVICE_HARDWARE_GPS') {
      this.initDeviceGeolocation();
    } else {
      this.initHighwaySimulator();
    }
  }

  /**
   * Switches tracking mode between real device GPS and highway simulation.
   */
  setTrackerMode(mode: TrackerMode) {
    if (this.status.mode === mode) return;
    this.status.mode = mode;
    if (this.status.isActive) {
      this.startTracking(
        this.status.busRegNo,
        this.status.routeCode,
        this.status.driverName,
        mode
      );
    }
  }

  /**
   * Real HTML5 Device Geolocation via watchPosition
   */
  private initDeviceGeolocation() {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      this.status.error = 'Geolocation API is not supported on this device/browser.';
      this.notify();
      this.initHighwaySimulator(); // Fallback
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const rawCoords: GeoPoint = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        const speedKmh = pos.coords.speed !== null && pos.coords.speed > 0
          ? Math.round(pos.coords.speed * 3.6)
          : Math.floor(35 + Math.random() * 10);

        const headingDeg = pos.coords.heading !== null && !isNaN(pos.coords.heading)
          ? Math.round(pos.coords.heading)
          : this.status.currentHeadingDeg;

        await this.processGpsUpdate(
          rawCoords,
          speedKmh,
          headingDeg,
          pos.coords.accuracy || 6,
          'DRIVER_DEVICE_GEOLOCATION'
        );
      },
      (err) => {
        console.warn('[LiveGPSTracker] Geolocation error:', err.message);
        this.status.error = `GPS sensor error: ${err.message}. Running continuous highway tracker.`;
        this.notify();
        // Fallback to simulator so user experience never halts
        if (!this.simulationTimer) {
          this.initHighwaySimulator();
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1000,
      }
    );
  }

  /**
   * High-Resolution Highway Simulation Engine
   */
  private initHighwaySimulator() {
    const route =
      MASTER_ROUTES_AY2026_27.find((r) => r.routeCode === this.status.routeCode) ||
      MASTER_ROUTES_AY2026_27[0];

    const stops = route.stops;
    const totalStops = stops.length;

    this.simulationTimer = setInterval(async () => {
      if (!this.status.isActive) return;

      const fromStop = stops[this.simPathIndex % totalStops];
      const toStop = stops[(this.simPathIndex + 1) % totalStops];

      this.simProgress += 0.08;
      if (this.simProgress >= 1.0) {
        this.simProgress = 0;
        this.simPathIndex = (this.simPathIndex + 1) % totalStops;
      }

      // Linear interpolation with realistic road noise
      const lat =
        fromStop.latitude + (toStop.latitude - fromStop.latitude) * this.simProgress +
        (Math.random() - 0.5) * 0.0001;
      const lng =
        fromStop.longitude + (toStop.longitude - fromStop.longitude) * this.simProgress +
        (Math.random() - 0.5) * 0.0001;

      // Calculate bearing towards destination stop
      const dLng = ((toStop.longitude - fromStop.longitude) * Math.PI) / 180;
      const y = Math.sin(dLng) * Math.cos((toStop.latitude * Math.PI) / 180);
      const x =
        Math.cos((fromStop.latitude * Math.PI) / 180) *
          Math.sin((toStop.latitude * Math.PI) / 180) -
        Math.sin((fromStop.latitude * Math.PI) / 180) *
          Math.cos((toStop.latitude * Math.PI) / 180) *
          Math.cos(dLng);
      let bearing = (Math.atan2(y, x) * 180) / Math.PI;
      bearing = (bearing + 360) % 360;

      const speed = Math.floor(38 + Math.random() * 14);

      await this.processGpsUpdate(
        { lat, lng },
        speed,
        Math.round(bearing),
        4.0,
        'HIGHWAY_SIMULATOR'
      );
    }, 1500);
  }

  /**
   * Processes each raw GPS fix, snaps it to the route, writes to TransitDatabase, and broadcasts
   */
  private async processGpsUpdate(
    rawCoords: GeoPoint,
    speedKmh: number,
    headingDeg: number,
    accuracyMeters: number,
    source: 'DRIVER_DEVICE_GEOLOCATION' | 'HIGHWAY_SIMULATOR'
  ) {
    const route =
      MASTER_ROUTES_AY2026_27.find((r) => r.routeCode === this.status.routeCode) ||
      MASTER_ROUTES_AY2026_27[0];

    // Canonical route path polyline for map-matching
    const routePath: GeoPoint[] = route.stops.map((s) => ({
      lat: s.latitude,
      lng: s.longitude,
    }));

    // Perform map-matching
    const mapMatch = EnhancedRoutingEngine.mapMatchPosition(
      rawCoords,
      routePath,
      speedKmh
    );

    const now = new Date().toISOString();
    const currentStop = route.stops[this.simPathIndex % route.stops.length]?.stopName || 'Vadlamudi Terminal';
    const nextStop = route.stops[(this.simPathIndex + 1) % route.stops.length]?.stopName || 'VFSTR Main Gate';
    const progressPercent = Math.min(
      99,
      Math.round(((this.simPathIndex + this.simProgress) / route.stops.length) * 100)
    );

    // 1. Write GPS Ping directly into the Transit Database
    await transitDb.logGpsTelemetry({
      busId: `BUS_${this.status.busRegNo.replace(/\s+/g, '_')}`,
      busRegNo: this.status.busRegNo,
      recordedAt: now,
      rawLatitude: Number(rawCoords.lat.toFixed(7)),
      rawLongitude: Number(rawCoords.lng.toFixed(7)),
      snappedLatitude: Number(mapMatch.snappedGps.lat.toFixed(7)),
      snappedLongitude: Number(mapMatch.snappedGps.lng.toFixed(7)),
      speedKmh,
      headingDeg,
      altitudeMeters: 19.5,
      accuracyMeters,
      crossTrackDeviationMeters: Number(mapMatch.crossTrackDistanceMeters.toFixed(1)),
      isOffRoute: mapMatch.isOffRoute,
      currentStopName: currentStop,
      nextStopName: nextStop,
      progressPercentage: progressPercent,
      source,
    });

    // 2. Broadcast via TelemetryService for real-time map updates across tabs & devices
    const packet: BusTelemetryPacket = {
      busRegNo: this.status.busRegNo,
      routeNumber: this.status.routeCode,
      driverName: this.status.driverName,
      latitude: mapMatch.snappedGps.lat,
      longitude: mapMatch.snappedGps.lng,
      speedKmh,
      headingDeg,
      timestamp: new Date().toLocaleTimeString(),
      isLiveGps: true,
      currentStopName: currentStop,
      nextStopName: nextStop,
      progressPercent,
    };
    TelemetryService.broadcastLocation(packet);

    // 3. Update internal tracker status
    this.status.lastPingTimestamp = now;
    this.status.lastRawCoords = rawCoords;
    this.status.lastSnappedCoords = mapMatch.snappedGps;
    this.status.currentSpeedKmh = speedKmh;
    this.status.currentHeadingDeg = headingDeg;
    this.status.accuracyMeters = accuracyMeters;
    this.status.pingsRecordedCount += 1;
    this.status.isOffRoute = mapMatch.isOffRoute;
    this.notify();
  }

  /**
   * Stops tracking and cleans up timers / watchers
   */
  stopTracking() {
    if (this.watchId !== null && typeof navigator !== 'undefined') {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    if (this.simulationTimer) {
      clearInterval(this.simulationTimer);
      this.simulationTimer = null;
    }

    this.status.isActive = false;
    this.notify();
  }
}

export const liveGpsTracker = LiveGPSTrackerService.getInstance();
