/**
 * Outscape - Geolocation & Trail Simulation Tracker
 * Supports both real outdoor GPS tracking and desktop walking simulation.
 */

export class OutscapeGeoTracker {
  constructor() {
    this.currentCoords = null;
    this.activeBiome = null;
    this.currentWaypointIndex = 0;
    this.isSimulating = false;
    this.simulationTimer = null;
    this.simulationSpeed = 1; // 1x, 2x, 4x
    this.watchId = null;
    this.isRealGps = false;

    // Outdoor session metrics
    this.distanceMeters = 0;
    this.steps = 0;
    this.startTime = null;
    this.elapsedSeconds = 0;
    this.timerInterval = null;
    this.visitedWaypoints = new Set();

    this.listeners = new Set();
  }

  setBiome(biome) {
    this.activeBiome = biome;
    this.currentWaypointIndex = 0;
    this.visitedWaypoints.clear();
    this.distanceMeters = 0;
    this.steps = 0;
    this.elapsedSeconds = 0;

    if (biome && biome.waypoints.length > 0) {
      this.currentCoords = [...biome.waypoints[0].coords];
    }

    this.notify({
      type: 'biome-selected',
      biome: this.activeBiome,
      coords: this.currentCoords
    });
  }

  startSession() {
    this.startTime = Date.now();
    this.stopSessionTimers();

    this.timerInterval = setInterval(() => {
      this.elapsedSeconds++;
      this.notify({
        type: 'session-tick',
        elapsedSeconds: this.elapsedSeconds,
        distanceMeters: Math.round(this.distanceMeters),
        steps: this.steps
      });
    }, 1000);

    if (this.isRealGps) {
      this.startRealGps();
    } else {
      this.startSimulation();
    }
  }

  pauseSession() {
    this.stopSessionTimers();
    this.isSimulating = false;
    this.notify({ type: 'session-paused' });
  }

  stopSessionTimers() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.simulationTimer) clearInterval(this.simulationTimer);
  }

  setGpsMode(useRealGps) {
    this.isRealGps = useRealGps;
    if (useRealGps) {
      this.stopSimulation();
      this.startRealGps();
    } else {
      this.stopRealGps();
    }
    this.notify({ type: 'mode-changed', isRealGps: this.isRealGps });
  }

  startRealGps() {
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported, staying in simulation mode.');
      this.isRealGps = false;
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const newCoords = [latitude, longitude];

        if (this.currentCoords) {
          const deltaM = this.calculateDistanceMeters(this.currentCoords, newCoords);
          if (deltaM > 1 && deltaM < 100) { // filter GPS jitter
            this.distanceMeters += deltaM;
            this.steps += Math.round(deltaM * 1.35);
          }
        }

        this.currentCoords = newCoords;
        this.checkProximityToWaypoints();

        this.notify({
          type: 'position-updated',
          coords: this.currentCoords,
          accuracy,
          isRealGps: true
        });
      },
      (err) => {
        console.warn('GPS position error:', err);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
  }

  stopRealGps() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  startSimulation() {
    if (!this.activeBiome || this.activeBiome.waypoints.length === 0) return;
    this.isSimulating = true;

    const waypoints = this.activeBiome.waypoints;
    let targetWpIndex = (this.currentWaypointIndex + 1) % waypoints.length;
    let startCoords = [...this.currentCoords];
    let endCoords = waypoints[targetWpIndex].coords;
    let progress = 0;

    this.notify({ type: 'simulation-started' });

    // Move in increments every 250ms
    this.simulationTimer = setInterval(() => {
      if (!this.isSimulating) return;

      progress += 0.035 * this.simulationSpeed;

      if (progress >= 1) {
        progress = 0;
        this.currentCoords = [...endCoords];
        this.currentWaypointIndex = targetWpIndex;

        // Waypoint reached
        const reachedWp = waypoints[targetWpIndex];
        this.onWaypointReached(reachedWp);

        // Prep next leg
        targetWpIndex = (targetWpIndex + 1) % waypoints.length;
        startCoords = [...this.currentCoords];
        endCoords = waypoints[targetWpIndex].coords;
      } else {
        const lat = startCoords[0] + (endCoords[0] - startCoords[0]) * progress;
        const lng = startCoords[1] + (endCoords[1] - startCoords[1]) * progress;
        this.currentCoords = [lat, lng];
      }

      // Increment distance & steps smoothly
      const stepIncrement = 3.2 * this.simulationSpeed;
      this.distanceMeters += 2.4 * this.simulationSpeed;
      this.steps += Math.round(stepIncrement);

      this.notify({
        type: 'position-updated',
        coords: this.currentCoords,
        isRealGps: false
      });
    }, 300);
  }

  stopSimulation() {
    this.isSimulating = false;
    if (this.simulationTimer) {
      clearInterval(this.simulationTimer);
      this.simulationTimer = null;
    }
  }

  setSimulationSpeed(speed) {
    this.simulationSpeed = speed;
  }

  onWaypointReached(waypoint) {
    if (!this.visitedWaypoints.has(waypoint.id)) {
      this.visitedWaypoints.add(waypoint.id);
      this.notify({
        type: 'waypoint-reached',
        waypoint,
        totalVisited: this.visitedWaypoints.size,
        totalWaypoints: this.activeBiome.waypoints.length
      });
    }
  }

  checkProximityToWaypoints() {
    if (!this.activeBiome || !this.currentCoords) return;

    for (const wp of this.activeBiome.waypoints) {
      const dist = this.calculateDistanceMeters(this.currentCoords, wp.coords);
      if (dist <= 35 && !this.visitedWaypoints.has(wp.id)) {
        this.onWaypointReached(wp);
        break;
      }
    }
  }

  calculateDistanceMeters(coords1, coords2) {
    const [lat1, lon1] = coords1;
    const [lat2, lon2] = coords2;
    const R = 6371e3; // Earth radius in meters
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const deltaPhi = (lat2 - lat1) * Math.PI / 180;
    const deltaLambda = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(event) {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('GeoTracker listener error:', err);
      }
    }
  }
}
