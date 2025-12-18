
export type HexColor = `#${string}`;

export interface VibeVector {
  palette: [HexColor, HexColor, HexColor, HexColor, HexColor];
  warmth: number;      // 0..1 (0=cool/blue, 1=warm/orange)
  saturation: number;  // 0..1
  contrast: number;    // 0..1
  entropy: number;     // 0..1 (0=stable, 1=cursed/chaotic)
  flicker: number;     // 0..1 (intensity/probability)
  fog: number;         // 0..1
  grain: number;       // 0..1
  bloom: number;       // 0..1
  moodTag: string;     // Short slug e.g. "neon-calm"
}

export interface AssetMatch {
  originalObject: string;
  gameAsset: string;
  confidence: number;
}

export interface TheaterRoom {
  id: string;
  coords: { x: number; y: number };
  owner?: string;
  vibe?: string;
  vibeVector?: VibeVector;
  // dominantColor is used for the glow effect and extracted from the AI-generated palette
  dominantColor?: string;
  compositionKey?: string; // e.g. "1-2-0-3"
  condition?: 'pristine' | 'modern' | 'dusty' | 'abandoned' | 'fallout';
  assets?: AssetMatch[];
  lastContentUpdate?: number;
  imageUrl?: string;
  videoUrl?: string;
}

export interface Edge {
  from: string;
  to: string;
  traffic: number;
}

export interface LabyrinthState {
  currentRoomId: string | null;
  lastRoomId: string | null;
  rooms: Record<string, TheaterRoom>;
  edges: Record<string, Edge>; // key: "fromId->toId"
  discoveryQuestions: string[];
}

export function getCompositionKey(v: VibeVector) {
  return [
    Math.round(v.warmth * 4),
    Math.round(v.saturation * 4),
    Math.round(v.entropy * 4),
    Math.round(v.flicker * 4)
  ].join("-");
}

/* --- Hallway Physics Types --- */

export type Direction = "N" | "E" | "S" | "W";

export enum TileType {
  VOID = 'VOID',
  STRAIGHT = 'STRAIGHT',
  CORNER = 'CORNER',
  T = 'T',
  X = 'X',
  DOOR_FRAME = 'DOOR_FRAME', // A claimed room
  HALL_END = 'HALL_END'
}

export interface HallwayTile {
  id: string;
  x: number;
  y: number;
  type: TileType;
  rotation: number; // 0, 90, 180, 270
  connections: Record<Direction, boolean>;
  trafficStrength: number;
  variant: string; // e.g. "warm-gritty", "cool-clean"
}
