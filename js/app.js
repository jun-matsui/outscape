/**
 * Outscape - Main Application Controller
 * Orchestrates AI generation, audio guidance, geolocation, and interactive map UI.
 */

import { BIOMES } from './nature-data.js';
import { OutscapeAIEngine } from './ai-engine.js';
import { OutscapeAudioGuide } from './audio-guide.js';
import { OutscapeGeoTracker } from './geo-tracker.js';

class OutscapeApp {
  constructor() {
    this.aiEngine = new OutscapeAIEngine();
    this.audioGuide = new OutscapeAudioGuide();
    this.geoTracker = new OutscapeGeoTracker();

    this.activeBiome = BIOMES[0];
    this.isWalking = false;
    this.lastSpokenText = '';

    // Map instances
    this.map = null;
    this.walkerMarker = null;
    this.trailPolyline = null;
    this.poiMarkers = [];

    // Animation frames
    this.waveformAnimId = null;

    this.initElements();
    this.initMap();
    this.renderBiomeList();
    this.bindEvents();
    this.initWaveform();

    // Select default biome
    this.selectBiome(this.activeBiome);
  }

  initElements() {
    this.el = {
      biomeList: document.getElementById('biome-list-container'),
      btnToggleWalk: document.getElementById('btn-toggle-walk'),
      btnNextCue: document.getElementById('btn-next-cue'),
      btnPocketMode: document.getElementById('btn-pocket-mode'),
      btnExitPocket: document.getElementById('btn-exit-pocket'),
      pocketOverlay: document.getElementById('pocket-overlay'),
      btnOutdoorContrast: document.getElementById('btn-outdoor-contrast'),
      btnOpenAiModal: document.getElementById('btn-open-ai-modal'),
      btnCloseModal: document.getElementById('btn-close-modal'),
      aiModal: document.getElementById('ai-modal'),
      inputEndpoint: document.getElementById('input-endpoint'),
      btnSaveAi: document.getElementById('btn-save-ai'),
      modalPromptPreview: document.getElementById('modal-prompt-preview'),

      // Metrics
      metricSteps: document.getElementById('metric-steps'),
      metricDistance: document.getElementById('metric-distance'),
      metricTime: document.getElementById('metric-time'),
      metricPois: document.getElementById('metric-pois'),
      sessionStatusBadge: document.getElementById('session-status-badge'),

      // Overlays & Toggles
      currentBiomeBadge: document.getElementById('current-biome-badge'),
      gpsModeBadge: document.getElementById('gps-mode-badge'),
      btnToggleGps: document.getElementById('btn-toggle-gps'),
      gpsToggleLabel: document.getElementById('gps-toggle-label'),
      btnSimSpeed: document.getElementById('btn-sim-speed'),
      speedLabel: document.getElementById('speed-label'),

      // Audio Console
      audioPulse: document.getElementById('audio-pulse'),
      observingTitle: document.getElementById('observing-title'),
      observingSubtitle: document.getElementById('observing-subtitle'),
      narrationTranscript: document.getElementById('narration-transcript'),
      mindfulText: document.getElementById('mindful-text'),
      btnReplayAudio: document.getElementById('btn-replay-audio'),
      btnPauseAudio: document.getElementById('btn-pause-audio'),
      waveformCanvas: document.getElementById('waveform-canvas')
    };

    if (this.aiEngine.endpointUrl) {
      this.el.inputEndpoint.value = this.aiEngine.endpointUrl;
    }
  }

  initMap() {
    // Center initially on first biome's first waypoint
    const initialCoords = this.activeBiome.waypoints[0].coords;

    this.map = L.map('map', {
      zoomControl: true,
      attributionControl: false
    }).setView(initialCoords, 16);

    // OpenStreetMap tiles with sleek dark/contrast styling
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(this.map);

    // Create user walker marker
    const walkerIcon = L.divIcon({
      className: 'custom-walker-icon',
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    });
    this.walkerMarker = L.marker(initialCoords, { icon: walkerIcon }).addTo(this.map);
  }

  renderBiomeList() {
    this.el.biomeList.innerHTML = '';

    BIOMES.forEach(biome => {
      const card = document.createElement('div');
      card.className = `biome-card ${biome.id === this.activeBiome.id ? 'active' : ''}`;
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.id = `biome-${biome.id}`;

      card.innerHTML = `
        <div class="biome-icon" aria-hidden="true">${biome.icon}</div>
        <div class="biome-info">
          <h4>${biome.name}</h4>
          <p>${biome.subtitle}</p>
          <div class="biome-meta">
            <span>📏 ${biome.distanceKm} km</span>
            <span>⏱️ ~${biome.estMinutes} min</span>
            <span>📍 ${biome.waypoints.length} POIs</span>
          </div>
        </div>
      `;

      card.addEventListener('click', () => this.selectBiome(biome));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.selectBiome(biome);
        }
      });

      this.el.biomeList.appendChild(card);
    });
  }

  selectBiome(biome) {
    this.activeBiome = biome;
    this.geoTracker.setBiome(biome);

    // Update active card styling
    document.querySelectorAll('.biome-card').forEach(c => c.classList.remove('active'));
    const activeEl = document.getElementById(`biome-${biome.id}`);
    if (activeEl) activeEl.classList.add('active');

    // Update Badges
    this.el.currentBiomeBadge.textContent = `${biome.icon} ${biome.name}`;
    this.el.observingTitle.textContent = biome.name;
    this.el.observingSubtitle.textContent = `${biome.subtitle} (${biome.distanceKm} km)`;
    this.el.metricPois.textContent = `0 / ${biome.waypoints.length}`;

    // Update Map Route and POIs
    this.updateMapForBiome(biome);
  }

  updateMapForBiome(biome) {
    if (!this.map) return;

    // Remove existing POIs
    this.poiMarkers.forEach(m => this.map.removeLayer(m));
    this.poiMarkers = [];

    // Remove existing trail polyline
    if (this.trailPolyline) {
      this.map.removeLayer(this.trailPolyline);
    }

    const routeCoords = biome.waypoints.map(w => w.coords);

    // Draw scenic polyline
    this.trailPolyline = L.polyline(routeCoords, {
      color: biome.color || '#10b981',
      weight: 5,
      opacity: 0.8,
      dashArray: '8, 8',
      lineJoin: 'round'
    }).addTo(this.map);

    // Add POI markers
    biome.waypoints.forEach((wp, index) => {
      const poiIcon = L.divIcon({
        className: 'custom-poi-marker',
        html: `<span>${wp.icon}</span>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker(wp.coords, { icon: poiIcon })
        .addTo(this.map)
        .bindPopup(`<strong>${wp.icon} ${wp.name}</strong><br><small>${wp.title}</small>`);

      marker.on('click', () => {
        this.triggerWaypointAudio(wp);
      });

      this.poiMarkers.push(marker);
    });

    // Fit map bounds to whole route
    this.map.fitBounds(this.trailPolyline.getBounds(), { padding: [40, 40] });

    // Place walker at start
    if (routeCoords.length > 0) {
      this.walkerMarker.setLatLng(routeCoords[0]);
    }
  }

  bindEvents() {
    // Start / Pause Walk button
    this.el.btnToggleWalk.addEventListener('click', () => this.toggleWalk());

    // Spontaneous Nature Cue
    this.el.btnNextCue.addEventListener('click', () => this.triggerSpontaneousCue());

    // Pocket Mode Toggle
    this.el.btnPocketMode.addEventListener('click', () => this.togglePocketMode(true));
    this.el.btnExitPocket.addEventListener('click', () => this.togglePocketMode(false));

    // Outdoor High-Contrast Mode
    this.el.btnOutdoorContrast.addEventListener('click', () => {
      document.body.classList.toggle('outdoor-contrast');
    });

    // GPS vs Simulator Mode
    this.el.btnToggleGps.addEventListener('click', () => {
      const isNowRealGps = !this.geoTracker.isRealGps;
      this.geoTracker.setGpsMode(isNowRealGps);
      this.el.gpsToggleLabel.textContent = isNowRealGps ? 'Use Step Simulator' : 'Use Real GPS';
      this.el.gpsModeBadge.textContent = isNowRealGps ? '🛰️ Live Outdoor GPS' : 'Desktop Simulator Mode';
      this.el.gpsModeBadge.style.color = isNowRealGps ? 'var(--emerald-400)' : 'var(--amber-400)';
    });

    // Simulator Speed button (1x -> 2x -> 4x)
    let currentSpeed = 1;
    this.el.btnSimSpeed.addEventListener('click', () => {
      if (currentSpeed === 1) currentSpeed = 2;
      else if (currentSpeed === 2) currentSpeed = 4;
      else currentSpeed = 1;

      this.geoTracker.setSimulationSpeed(currentSpeed);
      this.el.speedLabel.textContent = `${currentSpeed}x`;
    });

    // Audio controls
    this.el.btnReplayAudio.addEventListener('click', () => {
      if (this.lastSpokenText) {
        this.audioGuide.speak(this.lastSpokenText);
      }
    });

    this.el.btnPauseAudio.addEventListener('click', () => {
      if (this.audioGuide.isSpeaking) {
        this.audioGuide.stop();
        this.el.btnPauseAudio.textContent = '🔈';
      } else if (this.lastSpokenText) {
        this.audioGuide.speak(this.lastSpokenText);
        this.el.btnPauseAudio.textContent = '🔊';
      }
    });

    // AI Modal Dialog
    this.el.btnOpenAiModal.addEventListener('click', () => {
      this.el.modalPromptPreview.textContent = this.aiEngine.lastPrompt || 
        "System: You are Outscape, an outdoor audio nature guide powered by open-weight Gemma 2.\nTask: Generate an immersive nature observation snippet.";
      this.el.aiModal.showModal();
    });

    this.el.btnCloseModal.addEventListener('click', () => {
      this.el.aiModal.close();
    });

    this.el.btnSaveAi.addEventListener('click', () => {
      const endpoint = this.el.inputEndpoint.value;
      this.aiEngine.setEndpoint(endpoint);
      this.el.aiModal.close();
    });

    // Tracker Events
    this.geoTracker.subscribe(event => this.handleTrackerEvent(event));

    // Audio Guide Events
    this.audioGuide.subscribe(event => {
      if (event.type === 'speech-start') {
        this.el.audioPulse.classList.add('active');
        this.el.btnPauseAudio.textContent = '🔊';
      } else if (event.type === 'speech-end') {
        this.el.audioPulse.classList.remove('active');
        this.el.btnPauseAudio.textContent = '🔈';
      }
    });
  }

  toggleWalk() {
    this.isWalking = !this.isWalking;

    if (this.isWalking) {
      this.geoTracker.startSession();
      this.el.btnToggleWalk.textContent = '⏸️ Pause Walk';
      this.el.btnToggleWalk.classList.remove('btn-primary');
      this.el.btnToggleWalk.classList.add('btn-secondary');
      this.el.sessionStatusBadge.textContent = 'Exploring';
      this.el.sessionStatusBadge.style.color = 'var(--emerald-400)';
      this.el.sessionStatusBadge.style.borderColor = 'var(--border-emerald)';

      // Trigger welcome observation
      const firstWp = this.activeBiome.waypoints[0];
      this.triggerWaypointAudio(firstWp);
    } else {
      this.geoTracker.pauseSession();
      this.el.btnToggleWalk.textContent = '🚶‍♂️ Resume Walk';
      this.el.btnToggleWalk.classList.add('btn-primary');
      this.el.btnToggleWalk.classList.remove('btn-secondary');
      this.el.sessionStatusBadge.textContent = 'Paused';
      this.el.sessionStatusBadge.style.color = 'var(--amber-400)';
    }
  }

  togglePocketMode(active) {
    if (active) {
      this.el.pocketOverlay.classList.add('active');
    } else {
      this.el.pocketOverlay.classList.remove('active');
    }
  }

  handleTrackerEvent(event) {
    if (event.type === 'session-tick') {
      const minutes = Math.floor(event.elapsedSeconds / 60).toString().padStart(2, '0');
      const seconds = (event.elapsedSeconds % 60).toString().padStart(2, '0');
      this.el.metricTime.textContent = `${minutes}:${seconds}`;

      const km = (event.distanceMeters / 1000).toFixed(2);
      this.el.metricDistance.textContent = km;
      this.el.metricSteps.textContent = event.steps.toLocaleString();
    } else if (event.type === 'position-updated') {
      if (this.walkerMarker && event.coords) {
        this.walkerMarker.setLatLng(event.coords);
      }
    } else if (event.type === 'waypoint-reached') {
      this.el.metricPois.textContent = `${event.totalVisited} / ${event.totalWaypoints}`;
      this.triggerWaypointAudio(event.waypoint);
    }
  }

  async triggerWaypointAudio(waypoint) {
    this.el.observingTitle.textContent = `${waypoint.icon} ${waypoint.name}`;
    this.el.observingSubtitle.textContent = `${waypoint.title} • Generating audio insight...`;

    // Query Gemma 2 Open-Weight Engine
    const result = await this.aiEngine.generateWaypointNarration(this.activeBiome, waypoint);

    this.lastSpokenText = `${waypoint.name}. ${result.audioText}`;
    this.el.narrationTranscript.textContent = `"${result.audioText}"`;
    this.el.observingSubtitle.textContent = `${waypoint.title} • Powered by ${result.source}`;

    if (result.mindfulTip) {
      this.el.mindfulText.textContent = result.mindfulTip;
    }

    // Speak audio narration hands-free
    this.audioGuide.speak(this.lastSpokenText);
  }

  triggerSpontaneousCue() {
    const cue = this.aiEngine.generateSpontaneousCue();
    this.el.observingTitle.textContent = `🌱 ${cue.title}`;
    this.el.observingSubtitle.textContent = 'Touch Grass Mindful Observation';
    this.el.narrationTranscript.textContent = `"${cue.text}"`;
    this.el.mindfulText.textContent = cue.text;

    this.lastSpokenText = cue.text;
    this.audioGuide.speak(cue.text);
  }

  /**
   * Smooth Waveform Visualizer on Canvas
   */
  initWaveform() {
    const canvas = this.el.waveformCanvas;
    const ctx = canvas.getContext('2d');
    let phase = 0;

    const render = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const isSpeaking = this.audioGuide.isSpeaking;
      const barCount = 48;
      const barWidth = canvas.width / barCount;

      ctx.fillStyle = isSpeaking ? '#10b981' : 'rgba(255, 255, 255, 0.15)';

      for (let i = 0; i < barCount; i++) {
        let height = 4;
        if (isSpeaking) {
          const wave = Math.sin((i * 0.3) + phase) * Math.cos((i * 0.1) - phase * 0.5);
          height = Math.max(4, Math.abs(wave) * (canvas.height * 0.85));
        }

        const x = i * barWidth;
        const y = (canvas.height - height) / 2;

        ctx.beginPath();
        ctx.roundRect(x + 1, y, barWidth - 2, height, 2);
        ctx.fill();
      }

      if (isSpeaking) {
        phase += 0.12;
      }

      this.waveformAnimId = requestAnimationFrame(render);
    };

    render();
  }
}

// Boot Outscape on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  window.outscape = new OutscapeApp();
});
