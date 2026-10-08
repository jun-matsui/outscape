/**
 * Outscape - Local Nature Knowledge & Biome Database
 * Curated datasets for offline resilience and trail generation.
 */

export const BIOMES = [
  {
    id: 'autumn-forest',
    name: 'Maple & Oak Ridge Trail',
    subtitle: 'Fall Foliage & Woodland Corridor',
    icon: '🍂',
    color: '#d97706',
    ambientType: 'woodland-breeze',
    distanceKm: 2.8,
    estMinutes: 38,
    elevationGainM: 42,
    waypoints: [
      {
        id: 'wp-1',
        name: 'The Scarlet Oak Stand',
        coords: [40.785091, -73.968285],
        category: 'flora',
        icon: '🍁',
        title: 'Anthocyanins in Scarlet Oak',
        audioText: 'Take a breath and look up. These vibrant red and copper leaves owe their color to anthocyanins, sun-protecting pigments produced when autumn nights turn crisp. Listen to the gentle rustle of the canopy above.',
        mindfulTip: 'Pause for 10 seconds. Notice the temperature of the air on your skin.'
      },
      {
        id: 'wp-2',
        name: 'Old Stone Hollow',
        coords: [40.783610, -73.966540],
        category: 'geology',
        icon: '🪨',
        title: 'Glacial Schist & Ancient Bedrock',
        audioText: 'You are passing bedrock smoothed over twelve thousand years ago during the last glacial retreat. Notice how soft moss and lichen carpet the northern rock face, slowly turning mineral into fertile soil.',
        mindfulTip: 'Touch the stone if you can reach it safely. Feel the cool density of earth history.'
      },
      {
        id: 'wp-3',
        name: 'Songbird Thicket',
        coords: [40.782180, -73.965200],
        category: 'fauna',
        icon: '🐦',
        title: 'Autumn Songbird Refueling Stop',
        audioText: 'Listen closely into the briars. You might hear the crisp chip notes of migrating sparrows and thrushes, foraging for winter berries. They travel thousands of miles guided by celestial constellations and earth magnetism.',
        mindfulTip: 'Close your eyes for three deep breaths. How many distinct bird sounds can you identify?'
      },
      {
        id: 'wp-4',
        name: 'Fallen Pine Needle Clearing',
        coords: [40.780950, -73.963900],
        category: 'flora',
        icon: '🌲',
        title: 'Pine Phytoncides & Forest Bathing',
        audioText: 'The soft ground beneath your footsteps is cushioned by pine needles. Conifers emit phytoncides, natural airborne antimicrobial compounds that studies show reduce stress hormones and lower blood pressure.',
        mindfulTip: 'Inhale deeply through your nose. Take in the earthy cedar and pine scent.'
      }
    ]
  },
  {
    id: 'urban-park',
    name: 'Emerald City Greenbelt',
    subtitle: 'Urban Biodiversity & Pollinator Haven',
    icon: '🌿',
    color: '#10b981',
    ambientType: 'park-birds',
    distanceKm: 1.9,
    estMinutes: 25,
    elevationGainM: 14,
    waypoints: [
      {
        id: 'up-1',
        name: 'Native Pollinator Meadow',
        coords: [40.781200, -73.971000],
        category: 'flora',
        icon: '🌸',
        title: 'Goldenrod & Late Season Wildflowers',
        audioText: 'Notice the clusters of yellow goldenrod along the edge of the path. Contrary to myth, heavy goldenrod pollen is insect-borne, not windblown. It provides vital nectar for late-season bumblebees preparing for winter.',
        mindfulTip: 'Observe a single flower for five seconds. See if any tiny pollinators are at work.'
      },
      {
        id: 'up-2',
        name: 'Willow Pond Overlook',
        coords: [40.779800, -73.969200],
        category: 'aquatic',
        icon: '💧',
        title: 'Riparian Oasis & Dragonflies',
        audioText: 'The weeping willows arching over the water act as nature’s biofilters, anchoring the shoreline with deep fibrous roots. Listen to the gentle lapping of ripples and the breeze through narrow leaves.',
        mindfulTip: 'Gaze into the water reflections. Let your gaze soften away from digital sharpness.'
      },
      {
        id: 'up-3',
        name: 'Ancient Ginkgo Promenade',
        coords: [40.778400, -73.967800],
        category: 'flora',
        icon: '🍃',
        title: 'Living Fossils: The Ginkgo Biloba',
        audioText: 'These fan-shaped leaves belong to one of Earth’s oldest surviving tree species, virtually unchanged for over two hundred million years. In late autumn, their entire canopy turns a radiant, uniform gold.',
        mindfulTip: 'Look up at the golden canopy. Imagine this species thriving when dinosaurs roamed.'
      }
    ]
  },
  {
    id: 'creek-trail',
    name: 'Whispering Brook Path',
    subtitle: 'Creekbed, Ferns & Moisture Ecosystem',
    icon: '🌊',
    color: '#06b6d4',
    ambientType: 'flowing-water',
    distanceKm: 3.4,
    estMinutes: 45,
    elevationGainM: 28,
    waypoints: [
      {
        id: 'cp-1',
        name: 'Rushing Shallows',
        coords: [40.787100, -73.964100],
        category: 'aquatic',
        icon: '💦',
        title: 'Sound of Moving Water',
        audioText: 'Moving water produces gentle pink noise that synchronizes natural brainwaves toward relaxation. The oxygenated spray here feeds delicate maidenhair ferns clinging to the shaded wet rocks.',
        mindfulTip: 'Match your walking rhythm to the sound of the stream.'
      },
      {
        id: 'cp-2',
        name: 'Fallen Birch Sanctuary',
        coords: [40.788500, -73.962500],
        category: 'fungi',
        icon: '🍄',
        title: 'Nurse Logs & The Fungal Network',
        audioText: 'This fallen birch is not gone, it is a nurse log. A hidden underground mycorrhizal fungal network is recycling nutrients to feed surrounding young saplings. An entire hidden forest internet lives beneath your shoes.',
        mindfulTip: 'Observe how life regenerates. Nature recycles everything and wastes nothing.'
      },
      {
        id: 'cp-3',
        name: 'Canyon Fern Grotto',
        coords: [40.789900, -73.960800],
        category: 'flora',
        icon: '🌿',
        title: 'Ancient Fern Fronds',
        audioText: 'Ferns reproduce through microscopic spores on the underside of their fronds rather than seeds or flowers. They have thrived in humid forest pockets for more than three hundred million years.',
        mindfulTip: 'Take a slow, deep breath of the damp, rich earth air.'
      }
    ]
  }
];

export const NATURE_OBSERVATION_PROMPTS = [
  "Look at the bark of the nearest mature tree. Is it furrowed, smooth, or peeling?",
  "Feel the air temperature around your knuckles and face. Is there a humidity shift near the vegetation?",
  "Listen for bird activity. Are they high in the canopy or foraging in the ground brush?",
  "Notice the shadows cast by the branches on your pathway.",
  "Unclench your shoulders, let your arms swing naturally, and look ahead at the horizon."
];
