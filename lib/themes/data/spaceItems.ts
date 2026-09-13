// 48 real space-vocabulary words used identically for both board items and
// hand cards (Space theme is a 1:1 identical-match theme, same as Emoji).
// No invented/fictional names, and no decorative emoji — most of these
// (Betelgeuse, Quasar, Space Station...) have no natural emoji, so for
// consistency none of the 48 get one; the name alone is the card.
export interface SpaceItemDef {
  id: string;
  name: string;
}

export const SPACE_ITEMS: SpaceItemDef[] = [
  // Planets (9)
  { id: 'mercury', name: 'Mercury' },
  { id: 'venus', name: 'Venus' },
  { id: 'earth', name: 'Earth' },
  { id: 'mars', name: 'Mars' },
  { id: 'jupiter', name: 'Jupiter' },
  { id: 'saturn', name: 'Saturn' },
  { id: 'uranus', name: 'Uranus' },
  { id: 'neptune', name: 'Neptune' },
  { id: 'pluto', name: 'Pluto' },
  // Moons (7)
  { id: 'moon', name: 'Moon' },
  { id: 'europa', name: 'Europa' },
  { id: 'titan', name: 'Titan' },
  { id: 'io', name: 'Io' },
  { id: 'ganymede', name: 'Ganymede' },
  { id: 'callisto', name: 'Callisto' },
  { id: 'triton', name: 'Triton' },
  // Stars (6)
  { id: 'sun', name: 'Sun' },
  { id: 'sirius', name: 'Sirius' },
  { id: 'betelgeuse', name: 'Betelgeuse' },
  { id: 'polaris', name: 'Polaris' },
  { id: 'vega', name: 'Vega' },
  { id: 'rigel', name: 'Rigel' },
  // Phenomena (10)
  { id: 'comet', name: 'Comet' },
  { id: 'asteroid', name: 'Asteroid' },
  { id: 'meteor', name: 'Meteor' },
  { id: 'meteor-shower', name: 'Meteor Shower' },
  { id: 'nebula', name: 'Nebula' },
  { id: 'galaxy', name: 'Galaxy' },
  { id: 'black-hole', name: 'Black Hole' },
  { id: 'supernova', name: 'Supernova' },
  { id: 'quasar', name: 'Quasar' },
  { id: 'pulsar', name: 'Pulsar' },
  // Spacecraft / exploration (8)
  { id: 'rocket', name: 'Rocket' },
  { id: 'satellite', name: 'Satellite' },
  { id: 'space-station', name: 'Space Station' },
  { id: 'space-shuttle', name: 'Space Shuttle' },
  { id: 'rover', name: 'Rover' },
  { id: 'astronaut', name: 'Astronaut' },
  { id: 'telescope', name: 'Telescope' },
  { id: 'launch-pad', name: 'Launch Pad' },
  // Sci-fi / alien generic terms (8)
  { id: 'ufo', name: 'UFO' },
  { id: 'alien', name: 'Alien' },
  { id: 'martian', name: 'Martian' },
  { id: 'robot', name: 'Robot' },
  { id: 'flying-saucer', name: 'Flying Saucer' },
  { id: 'ray-gun', name: 'Ray Gun' },
  { id: 'spacesuit', name: 'Spacesuit' },
  { id: 'jetpack', name: 'Jetpack' },
];

if (SPACE_ITEMS.length !== 48) {
  throw new Error(`SPACE_ITEMS must contain exactly 48 items, got ${SPACE_ITEMS.length}`);
}
