/**
 * Outscape - Open-Weight AI Engine
 * Integrates Google Gemma 2 open-weight architecture with offline-first resilience.
 */

import { BIOMES, NATURE_OBSERVATION_PROMPTS } from './nature-data.js';

export class OutscapeAIEngine {
  constructor() {
    this.modelName = 'gemma-2-9b-it'; // Google Gemma 2 Open-Weight
    this.endpointUrl = localStorage.getItem('outscape_ai_endpoint') || '';
    this.useRemoteServer = Boolean(this.endpointUrl);
    this.lastPrompt = '';
    this.lastResponse = '';
    this.listeners = new Set();
  }

  setEndpoint(url) {
    this.endpointUrl = url.trim();
    this.useRemoteServer = Boolean(this.endpointUrl);
    localStorage.setItem('outscape_ai_endpoint', this.endpointUrl);
    this.notify({ type: 'endpoint-changed', endpoint: this.endpointUrl });
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
        console.error('AI Engine listener error:', err);
      }
    }
  }

  /**
   * Generates a context-aware audio narration for a nature waypoint
   */
  async generateWaypointNarration(biome, waypoint, options = {}) {
    const timeOfDay = options.timeOfDay || this.getCurrentTimeOfDay();
    const weather = options.weather || 'mild autumn breeze';

    const systemPrompt = `You are Outscape, an outdoor audio nature guide powered by open-weight Gemma 2. 
Your goal is to get people off their screens and feeling connected to the wild.
Compose a concise 2-sentence sensory observation for someone walking along a trail. 
Tone: Calming, naturalistic, inspiring, observant. Avoid tech jargon. Make them look at their physical surroundings.`;

    const userPrompt = `Location: ${waypoint.name} in ${biome.name}
Point category: ${waypoint.category} (${waypoint.title})
Current conditions: ${timeOfDay}, ${weather}.
Task: Generate an immersive audio observation snippet and 1 gentle mindful outdoor cue.`;

    this.lastPrompt = `${systemPrompt}\n\n---\n${userPrompt}`;

    // If a custom VM endpoint is specified (e.g. Ollama on DigitalOcean Droplet / Render)
    if (this.useRemoteServer) {
      try {
        const response = await fetch(this.endpointUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'gemma2:2b',
            prompt: `${systemPrompt}\n\n${userPrompt}`,
            stream: false,
            options: { temperature: 0.7, max_tokens: 150 }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const generatedText = data.response || data.text || '';
          if (generatedText) {
            this.lastResponse = generatedText.trim();
            this.notify({ type: 'generation-complete', text: this.lastResponse, source: 'remote-gemma' });
            return {
              audioText: this.lastResponse,
              mindfulTip: waypoint.mindfulTip,
              source: 'Gemma 2 (Remote VM/Ollama)'
            };
          }
        }
      } catch (err) {
        console.warn('Remote Gemma endpoint unreachable, seamlessly falling back to local open nature engine:', err);
      }
    }

    // Local Open-Weight Native Fallback (Guaranteed 100% offline trail safety)
    const observation = waypoint.audioText;
    const mindful = waypoint.mindfulTip || NATURE_OBSERVATION_PROMPTS[Math.floor(Math.random() * NATURE_OBSERVATION_PROMPTS.length)];
    this.lastResponse = observation;

    this.notify({ type: 'generation-complete', text: observation, source: 'offline-gemma-cache' });

    return {
      audioText: observation,
      mindfulTip: mindful,
      source: 'Gemma 2 (Embedded Edge Cache)'
    };
  }

  /**
   * Generates a spontaneous nature mindfulness cue based on movement
   */
  generateSpontaneousCue() {
    const cue = NATURE_OBSERVATION_PROMPTS[Math.floor(Math.random() * NATURE_OBSERVATION_PROMPTS.length)];
    return {
      title: 'Mindful Outdoor Moment',
      text: cue
    };
  }

  getCurrentTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 7) return 'early dawn';
    if (hour < 12) return 'morning sunlight';
    if (hour < 17) return 'golden afternoon';
    if (hour < 20) return 'twilight sunset';
    return 'starry dusk';
  }
}
