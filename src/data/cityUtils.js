import CITIES from './cities.json';

const validCities = CITIES.filter(c => c.value !== 'all' && c.lat && c.lng);

// Hebrew name → full city object
export const cityByName = Object.fromEntries(
  validCities.map(c => [c.name, c])
);

// Hebrew name → [lat, lng]  (drop-in replacement for cities_coords.json)
export const cityCoords = Object.fromEntries(
  validCities.map(c => [c.name, [c.lat, c.lng]])
);

// Hebrew name → countdown in seconds (fallback: 45)
export const cityCountdown = Object.fromEntries(
  CITIES.filter(c => c.value !== 'all').map(c => [c.name, c.countdown || 45])
);

// Zone Hebrew name → array of city objects
export const citiesByZone = validCities.reduce((acc, c) => {
  const zone = c.zone || 'אחר';
  if (!acc[zone]) acc[zone] = [];
  acc[zone].push(c);
  return acc;
}, {});
