
import { TheaterRoom, Edge, HallwayTile, TileType, Direction, VibeVector } from './types';

// Deterministic Pseudo-Random Number Generator (seeded)
class PRNG {
  private seed: number;
  constructor(seed: number) { this.seed = seed; }
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

const getGridId = (x: number, y: number) => `${x}-${y}`;
const parseGridId = (id: string) => id.split('-').map(Number);
const DIRS: Direction[] = ['N', 'E', 'S', 'W'];

/**
 * Adjacency Validator: Checks if two tiles can physically connect.
 * Note: In this generated system, we ensure this by construction, but this 
 * validates the model's integrity.
 */
export function canNeighbor(t1: HallwayTile, dir: Direction, t2: HallwayTile): boolean {
  const opp = getOppositeDir(dir);
  return t1.connections[dir] === t2.connections[opp];
}

function getOppositeDir(dir: Direction): Direction {
  switch(dir) {
    case 'N': return 'S';
    case 'E': return 'W';
    case 'S': return 'N';
    case 'W': return 'E';
  }
}

/**
 * Derives a deterministic variant key from a VibeVector.
 * This is the "Flavor" logic mapped to "Physics" constraints.
 */
function getVariantFromVibe(v: VibeVector | undefined): string {
  if (!v) return "neutral-void";
  const temp = v.warmth > 0.5 ? "warm" : "cool";
  const texture = v.entropy > 0.5 ? "decay" : "clean";
  return `${temp}-${texture}`;
}

/**
 * The Core Generator.
 * Pure function. Input: World State. Output: Physical Layout.
 * No AI calls. No prose.
 */
export function generateLabyrinthLayout(
  rooms: Record<string, TheaterRoom>,
  edges: Record<string, Edge>,
  gridSize: number
): Record<string, HallwayTile> {
  
  const layout: Record<string, HallwayTile> = {};
  const activeCells = new Set<string>();
  const cellTraffic: Record<string, number> = {};
  const influenceMap: Record<string, VibeVector> = {}; // Tracks dominant vibe per cell

  // 1. Register Door Nodes (Theaters)
  Object.values(rooms).forEach(room => {
    if (room.owner) {
      activeCells.add(room.id);
      cellTraffic[room.id] = 1.0;
      if (room.vibeVector) {
        influenceMap[room.id] = room.vibeVector;
      }
    }
  });

  // 2. Rasterize Edges (Traffic Physics)
  Object.values(edges).forEach(edge => {
    if (edge.traffic < 0.1) return;

    const [x1, y1] = parseGridId(edge.from);
    const [x2, y2] = parseGridId(edge.to);
    
    // Find rooms to blend vibes from
    const startVibe = rooms[edge.from]?.vibeVector;
    const endVibe = rooms[edge.to]?.vibeVector;
    const dominantVibe = (edge.traffic > 5 && endVibe) ? endVibe : (startVibe || endVibe);

    // Manhattan Routing
    let cx = x1, cy = y1;
    const steps = [];
    
    // X-axis move
    while (cx !== x2) {
      cx += (cx < x2 ? 1 : -1);
      steps.push(getGridId(cx, cy));
    }
    // Y-axis move
    while (cy !== y2) {
      cy += (cy < y2 ? 1 : -1);
      steps.push(getGridId(cx, cy));
    }

    // Apply stats to cells
    steps.forEach(id => {
      cellTraffic[id] = Math.min(1, (cellTraffic[id] || 0) + edge.traffic * 0.15);
      activeCells.add(id);
      
      // Propagate influence if this edge is heavily trafficked
      if (dominantVibe && !influenceMap[id]) {
        influenceMap[id] = dominantVibe;
      }
    });
  });

  // 3. Resolve Tiles
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      const id = getGridId(x, y);
      const room = rooms[id];
      const traffic = cellTraffic[id] || 0;
      const vibe = influenceMap[id];
      
      let type = TileType.VOID;
      const connections: Record<Direction, boolean> = { N: false, E: false, S: false, W: false };
      let rotation = 0;

      // Logic: A tile exists if it is a Room OR if it has traffic/neighbors
      if (room && room.owner) {
        type = TileType.DOOR_FRAME;
        // Doors connect to any active neighbor
        DIRS.forEach(dir => {
          const nId = getNeighborId(x, y, dir);
          if (activeCells.has(nId)) connections[dir] = true;
        });
      } else if (activeCells.has(id)) {
        // Hallway Logic: Connect to active neighbors
        let count = 0;
        DIRS.forEach(dir => {
          const nId = getNeighborId(x, y, dir);
          if (activeCells.has(nId)) {
            connections[dir] = true;
            count++;
          }
        });

        // Auto-tile bitmasking logic
        if (count === 4) { type = TileType.X; }
        else if (count === 3) { 
          type = TileType.T; 
          // Rotate T to point away from the empty side
          if (!connections.N) rotation = 180;
          else if (!connections.E) rotation = 270;
          else if (!connections.S) rotation = 0;
          else if (!connections.W) rotation = 90;
        }
        else if (count === 2) {
          if (connections.N && connections.S) { type = TileType.STRAIGHT; rotation = 0; }
          else if (connections.E && connections.W) { type = TileType.STRAIGHT; rotation = 90; }
          else {
            type = TileType.CORNER;
            if (connections.N && connections.E) rotation = 0;
            if (connections.E && connections.S) rotation = 90;
            if (connections.S && connections.W) rotation = 180;
            if (connections.W && connections.N) rotation = 270;
          }
        }
        else if (count === 1) {
          type = TileType.HALL_END;
          if (connections.N) rotation = 0;
          if (connections.E) rotation = 90;
          if (connections.S) rotation = 180;
          if (connections.W) rotation = 270;
        } else {
           // Isolated traffic noise
           type = TileType.VOID;
        }
      }

      layout[id] = {
        id,
        x,
        y,
        type,
        rotation,
        connections,
        trafficStrength: traffic,
        variant: getVariantFromVibe(vibe)
      };
    }
  }

  return layout;
}

function getNeighborId(x: number, y: number, dir: Direction): string {
  switch (dir) {
    case 'N': return `${x}-${y - 1}`;
    case 'E': return `${x + 1}-${y}`;
    case 'S': return `${x}-${y + 1}`;
    case 'W': return `${x - 1}-${y}`;
  }
}
