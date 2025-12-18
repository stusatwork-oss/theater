
// Tile geometry identifiers
export const TILE_GEOMETRIES = {
  STRAIGHT: 'tile_straight',
  CORNER: 'tile_corner',
  T: 'tile_t',
  X: 'tile_x',
  DOOR_FRAME: 'tile_door',
  HALL_END: 'tile_end',
} as const;

// Condition variants (maps to TheaterRoom.condition)
export const CONDITIONS = ['pristine', 'modern', 'dusty', 'abandoned', 'fallout'] as const;

// Temperature variants (derived from VibeVector.warmth)
export const TEMPERATURES = ['cool', 'neutral', 'warm'] as const;

// Complete variant key type
export type VariantKey = `${typeof TEMPERATURES[number]}-${typeof CONDITIONS[number]}`;

// Props that can spawn in rooms
export const ROOM_PROPS = {
  // Seating
  SEAT_THEATER_ROW: { category: 'seating', slots: 1, width: 3 },
  SEAT_SINGLE: { category: 'seating', slots: 1, width: 1 },
  BENCH_MALL: { category: 'seating', slots: 1, width: 2 },
  
  // Signage
  SIGN_NEON_01: { category: 'signage', slots: 1, wall: true },
  SIGN_EXIT: { category: 'signage', slots: 1, wall: true },
  SIGN_DIRECTORY: { category: 'signage', slots: 1, wall: true },
  
  // Electronics
  ARCADE_CABINET: { category: 'electronics', slots: 1, width: 1 },
  VENDING_MACHINE: { category: 'electronics', slots: 1, width: 1 },
  PAYPHONE: { category: 'electronics', slots: 1, wall: true },
  TV_CRT: { category: 'electronics', slots: 1, width: 1 },
  
  // Fixtures
  FOUNTAIN_SMALL: { category: 'fixture', slots: 4, width: 2 },
  PLANTER_MALL: { category: 'fixture', slots: 1, width: 1 },
  TRASH_CAN: { category: 'fixture', slots: 1, width: 1 },
  
  // Lighting
  LIGHT_FLUORESCENT: { category: 'lighting', ceiling: true },
  LIGHT_CHANDELIER: { category: 'lighting', ceiling: true },
  LAMP_FLOOR: { category: 'lighting', slots: 1, width: 1 },
} as const;

export type PropId = keyof typeof ROOM_PROPS;
