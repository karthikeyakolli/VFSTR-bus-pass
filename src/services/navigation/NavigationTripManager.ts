/**
 * VFSTR Smart Transport — Real-Time Navigation Trip & Session Manager
 * Orchestrates live turn-by-turn navigation, audio voice prompts via Web Speech API,
 * dynamic progress simulation, off-route re-routing triggers, and telemetry synchronization.
 */

import {
  GeoPoint,
  NavigationSessionState,
  NavigationMode,
} from './navigation.types';
import { EnhancedRoutingEngine } from './EnhancedRoutingEngine';
import { TelemetryService } from '../TelemetryService';

type NavigationListener = (state: NavigationSessionState) => void;

export class NavigationTripManager {
  private static instance: NavigationTripManager | null = null;

  private state: NavigationSessionState;
  private listeners: Set<NavigationListener> = new Set();
  private simTimer: ReturnType<typeof setInterval> | null = null;
  private currentPathIndex = 0;
  private subProgress = 0; // interpolation between waypoints (0 to 1)
  private hasSpokenManeuvers: Set<number> = new Set();

  private constructor() {
    const routes = EnhancedRoutingEngine.computeRouteAlternatives();
    const activeRoute = routes[0];

    this.state = {
      status: 'IDLE',
      activeRoute,
      availableRoutes: routes,
      currentLocation: activeRoute.path[0],
      snappedLocation: activeRoute.path[0],
      bearing: 142,
      speedKmh: 45,
      currentManeuverIndex: 0,
      distanceToNextManeuverMeters: activeRoute.maneuvers[0]?.distanceMeters || 500,
      distanceRemainingKm: activeRoute.totalDistanceKm,
      etaRemainingMinutes: activeRoute.totalDurationMinutes,
      estimatedArrivalTime: this.computeArrivalTime(activeRoute.totalDurationMinutes),
      progressPercent: 0,
      mode: 'EXPRESS_CAMPUS_BUS',
      isOffRoute: false,
      voiceGuidanceEnabled: true,
      bilingualAudioEnabled: true,
      activeGeofence: null,
      rerouteCount: 0,
      simulated: true,
      simSpeedMultiplier: 1.5,
    };
  }

  static getInstance(): NavigationTripManager {
    if (!this.instance) {
      this.instance = new NavigationTripManager();
    }
    return this.instance;
  }

  getState(): NavigationSessionState {
    return { ...this.state };
  }

  subscribe(listener: NavigationListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const snapshot = this.getState();
    this.listeners.forEach((l) => l(snapshot));

    // Also broadcast to cross-tab telemetry
    TelemetryService.broadcastLocation({
      busRegNo: 'AP 07 TJ 4521',
      routeNumber: 'Route #14 Express',
      driverName: 'K. Venkateswarlu (Master Captain)',
      latitude: snapshot.snappedLocation.lat,
      longitude: snapshot.snappedLocation.lng,
      speedKmh: snapshot.speedKmh,
      headingDeg: snapshot.bearing,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      isLiveGps: true,
      currentStopName: snapshot.activeRoute.maneuvers[snapshot.currentManeuverIndex]?.roadName || 'NH-16 Corridor',
      nextStopName: 'VFSTR University Central Terminal',
      progressPercent: snapshot.progressPercent,
    });
  }

  /**
   * Starts turn-by-turn navigation session
   */
  startNavigation() {
    if (this.state.status === 'NAVIGATING') return;

    this.state.status = 'NAVIGATING';
    this.speakVoice('Starting navigation to VFSTR University. Follow highlighted route.');
    this.startSimulationLoop();
    this.notify();
  }

  /**
   * Pauses active navigation
   */
  pauseNavigation() {
    this.state.status = 'PAUSED';
    if (this.simTimer) {
      clearInterval(this.simTimer);
      this.simTimer = null;
    }
    this.notify();
  }

  /**
   * Resumes navigation
   */
  resumeNavigation() {
    if (this.state.status === 'NAVIGATING') return;
    this.state.status = 'NAVIGATING';
    this.startSimulationLoop();
    this.notify();
  }

  /**
   * Restarts trip back to start
   */
  resetTrip() {
    if (this.simTimer) clearInterval(this.simTimer);
    this.currentPathIndex = 0;
    this.subProgress = 0;
    this.hasSpokenManeuvers.clear();

    const route = this.state.activeRoute;
    this.state.status = 'IDLE';
    this.state.currentLocation = route.path[0];
    this.state.snappedLocation = route.path[0];
    this.state.bearing = 142;
    this.state.speedKmh = 45;
    this.state.currentManeuverIndex = 0;
    this.state.distanceRemainingKm = route.totalDistanceKm;
    this.state.etaRemainingMinutes = route.totalDurationMinutes;
    this.state.estimatedArrivalTime = this.computeArrivalTime(route.totalDurationMinutes);
    this.state.progressPercent = 0;
    this.state.isOffRoute = false;
    this.state.rerouteCount = 0;

    this.notify();
  }

  /**
   * Switch route alternative (e.g. user selects bypass route)
   */
  selectRouteAlternative(routeId: string) {
    const found = this.state.availableRoutes.find((r) => r.id === routeId);
    if (!found) return;

    this.state.activeRoute = found;
    this.state.distanceRemainingKm = found.totalDistanceKm;
    this.state.etaRemainingMinutes = found.totalDurationMinutes;
    this.state.estimatedArrivalTime = this.computeArrivalTime(found.totalDurationMinutes);
    this.currentPathIndex = 0;
    this.subProgress = 0;
    this.hasSpokenManeuvers.clear();
    this.state.currentLocation = found.path[0];
    this.state.snappedLocation = found.path[0];
    this.state.currentManeuverIndex = 0;
    this.notify();
    this.speakVoice(`Route switched to ${found.name}.`);
  }

  /**
   * Changes vehicle mode (Bus, Rapid Cab, Bike Taxi)
   */
  setNavigationMode(mode: NavigationMode) {
    this.state.mode = mode;
    this.notify();
  }

  /**
   * Sets simulation speed multiplier (1x, 2x, 4x)
   */
  setSpeedMultiplier(multiplier: number) {
    this.state.simSpeedMultiplier = multiplier;
    this.notify();
  }

  /**
   * Toggles voice navigation on/off
   */
  toggleVoiceGuidance() {
    this.state.voiceGuidanceEnabled = !this.state.voiceGuidanceEnabled;
    this.notify();
  }

  /**
   * Toggles bilingual audio announcements (English + Telugu)
   */
  toggleBilingualAudio() {
    this.state.bilingualAudioEnabled = !this.state.bilingualAudioEnabled;
    this.notify();
  }

  /**
   * Triggers an intentional off-route deviation to demonstrate real-time dynamic rerouting
   */
  simulateOffRouteDeviation() {
    this.state.status = 'REROUTING';
    this.state.isOffRoute = true;
    this.state.rerouteCount += 1;

    // Jitter position 120m away perpendicular
    const curr = this.state.currentLocation;
    const deviated: GeoPoint = {
      lat: curr.lat + 0.0018,
      lng: curr.lng - 0.0022,
    };
    this.state.currentLocation = deviated;

    this.speakVoice('Off route. Recalculating path to VFSTR University.');

    setTimeout(() => {
      const rerouted = EnhancedRoutingEngine.generateDynamicReroute(deviated, this.state.activeRoute);
      this.state.activeRoute = rerouted;
      this.state.availableRoutes = [rerouted, ...this.state.availableRoutes.slice(1)];
      this.currentPathIndex = 0;
      this.subProgress = 0;
      this.state.status = 'NAVIGATING';
      this.state.isOffRoute = false;
      this.state.snappedLocation = rerouted.path[0];
      this.speakVoice('New route found. Continue straight on Connecting Arterial.');
      this.notify();
    }, 1500);

    this.notify();
  }

  // --- PRIVATE SIMULATION ENGINE ---
  private startSimulationLoop() {
    if (this.simTimer) clearInterval(this.simTimer);

    const tickMs = 250; // 4 updates per second for ultra-fluid movement
    this.simTimer = setInterval(() => {
      if (this.state.status !== 'NAVIGATING') return;

      const path = this.state.activeRoute.path;
      if (this.currentPathIndex >= path.length - 1) {
        // Trip completed!
        this.state.status = 'ARRIVED';
        this.state.progressPercent = 100;
        this.state.speedKmh = 0;
        this.state.distanceRemainingKm = 0;
        this.state.etaRemainingMinutes = 0;
        if (this.simTimer) clearInterval(this.simTimer);
        this.speakVoice('You have reached VFSTR University Central Terminal. Have a great day!');
        this.notify();
        return;
      }

      const p1 = path[this.currentPathIndex];

      // Step progress increment based on speed multiplier
      const stepIncrement = 0.04 * this.state.simSpeedMultiplier;
      this.subProgress += stepIncrement;

      if (this.subProgress >= 1.0) {
        this.subProgress = 0;
        this.currentPathIndex += 1;
      }

      const safeNext = path[Math.min(this.currentPathIndex + 1, path.length - 1)];
      const interpLat = p1.lat + (safeNext.lat - p1.lat) * this.subProgress;
      const interpLng = p1.lng + (safeNext.lng - p1.lng) * this.subProgress;

      const currentRaw: GeoPoint = { lat: interpLat, lng: interpLng };
      const matched = EnhancedRoutingEngine.mapMatchPosition(currentRaw, path, this.state.speedKmh);

      // Bearing & Speed variation
      const bearing = EnhancedRoutingEngine.calculateBearing(p1, safeNext);
      const targetSpeed = Math.round(45 + Math.sin(Date.now() / 3000) * 12);

      // Calculate progress and remaining distance
      const totalPoints = path.length;
      const progressPercent = Math.min(
        100,
        Math.round(((this.currentPathIndex + this.subProgress) / (totalPoints - 1)) * 100)
      );

      const remainingFraction = 1 - progressPercent / 100;
      const distRemaining = Math.max(0, Math.round(this.state.activeRoute.totalDistanceKm * remainingFraction * 10) / 10);
      const etaRemaining = Math.max(1, Math.round(this.state.activeRoute.totalDurationMinutes * remainingFraction));

      // Calculate active maneuver step
      const maneuvers = this.state.activeRoute.maneuvers;
      const currentManeuverIdx = Math.min(
        Math.floor((progressPercent / 100) * maneuvers.length),
        maneuvers.length - 1
      );
      const activeManeuver = maneuvers[currentManeuverIdx];

      // Distance to next turn
      const distanceToNextManeuver = Math.max(
        40,
        Math.round((1 - this.subProgress) * (activeManeuver?.distanceMeters || 350))
      );

      // Voice alert triggers when approaching within 200m of turn
      if (!this.hasSpokenManeuvers.has(currentManeuverIdx) && distanceToNextManeuver <= 250) {
        this.hasSpokenManeuvers.add(currentManeuverIdx);
        if (activeManeuver) {
          this.speakVoice(activeManeuver.voicePrompt);
        }
      }

      // Check geofences
      const activeGeofence = EnhancedRoutingEngine.GEOFENCE_ZONES.find((zone) => {
        return EnhancedRoutingEngine.haversineDistanceMeters(matched.snappedGps, zone.center) <= zone.radiusMeters;
      }) || null;

      this.state.currentLocation = currentRaw;
      this.state.snappedLocation = matched.snappedGps;
      this.state.bearing = Math.round(bearing);
      this.state.speedKmh = targetSpeed;
      this.state.progressPercent = progressPercent;
      this.state.distanceRemainingKm = distRemaining;
      this.state.etaRemainingMinutes = etaRemaining;
      this.state.estimatedArrivalTime = this.computeArrivalTime(etaRemaining);
      this.state.currentManeuverIndex = currentManeuverIdx;
      this.state.distanceToNextManeuverMeters = distanceToNextManeuver;
      this.state.activeGeofence = activeGeofence;

      this.notify();
    }, tickMs);
  }

  private computeArrivalTime(minutesAhead: number): string {
    const target = new Date(Date.now() + minutesAhead * 60 * 1000);
    return target.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private speakVoice(text: string) {
    if (!this.state.voiceGuidanceEnabled) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel(); // cancel pending speech to prevent delay
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);

      // Bilingual Public Address (Telugu) announcement
      if (this.state.bilingualAudioEnabled) {
        let teluguText = '';
        if (text.includes('Budampadu')) teluguText = 'తదుపరి స్టాప్: బుడంపాడు జంక్షన్.';
        else if (text.includes('VFSTR') || text.includes('University') || text.includes('Terminal')) teluguText = 'విజ్ఞాన్ విశ్వవిద్యాలయం మెయిన్ క్యాంపస్.';
        else if (text.includes('NTR Circle') || text.includes('Guntur')) teluguText = 'గుంటూరు ఎన్టీఆర్ సర్కిల్ బస్ టెర్మినల్.';
        
        if (teluguText) {
          const teluguUtterance = new SpeechSynthesisUtterance(teluguText);
          teluguUtterance.rate = 1.0;
          teluguUtterance.lang = 'te-IN';
          window.speechSynthesis.speak(teluguUtterance);
        }
      }
    } catch {
      // ignore browser audio limitations
    }
  }
}
