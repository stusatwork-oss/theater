
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

export function generateLabyrinthLayout(
  rooms: Record<string, TheaterRoom>,
  edges: Record<string, Edge>,
  gridSize: number
): Record<string, HallwayTile> {
  
  const layout: Record<string, HallwayTile> = {};
  const activeCells = new Set<string>();
  const cellTraffic: Record<string, number> = {};

  // 1. Identify "Active" nodes (Claimed Rooms)
  Object.values(rooms).forEach(room => {
    if (room.owner) {
      activeCells.add(room.id);
      cellTraffic[room.id] = 1.0; // Max presence
    }
  });

  // 2. Rasterize Traffic Edges to find Hallway cells
  // Simple Manhattan routing for "hallways" between nodes
  Object.values(edges).forEach(edge => {
    if (edge.traffic < 0.1) return; // Noise floor

    const [x1, y1] = parseGridId(edge.from);
    const [x2, y2] = parseGridId(edge.to);
    
    // Rasterize path (x-first then y-first mixed to be simple L-shapes)
    let cx = x1, cy = y1;
    while (cx !== x2 || cy !== y2) {
      // Normalize traffic contribution
      const id = getGridId(cx, cy);
      cellTraffic[id] = Math.min(1, (cellTraffic[id] || 0) + edge.traffic * 0.1);
      activeCells.add(id);

      if (cx !== x2) cx += (cx < x2 ? 1 : -1);
      else if (cy !== y2) cy += (cy < y2 ? 1 : -1);
    }
    // Add destination
    const endId = getGridId(x2, y2);
    cellTraffic[endId] = Math.min(1, (cellTraffic[endId] || 0) + edge.traffic * 0.1);
    activeCells.add(endId);
  });

  // 3. Generate Tiles for all grid positions
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      const id = getGridId(x, y);
      const room = rooms[id];
      const traffic = cellTraffic[id] || 0;
      
      // Default: VOID
      let type = TileType.VOID;
      const connections: Record<Direction, boolean> = { N: false, E: false, S: false, W: false };
      let rotation = 0;

      // Determine Vibe Influence (Weighted average of neighbors)
      // For now, if it's a room, it uses its own. If hallway, maybe blend? 
      // Keeping it simple: Hallways inherit nearest neighbor vibe later in render.

      if (room && room.owner) {
        type = TileType.DOOR_FRAME;
        // Doors connect to any active neighbor
        ['N', 'E', 'S', 'W'].forEach(dir => {
          const neighborId = getNeighborId(x, y, dir as Direction);
          if (activeCells.has(neighborId)) connections[dir as Direction] = true;
        });
      } else if (activeCells.has(id)) {
        // It's a hallway
        // Determine Connectivity based on Active Neighbors
        let connectionCount = 0;
        
        (['N', 'E', 'S', 'W'] as Direction[]).forEach(dir => {
          const nId = getNeighborId(x, y, dir);
          // Connect if neighbor is active
          if (activeCells.has(nId)) {
            connections[dir] = true;
            connectionCount++;
          }
        });

        // Autotile Logic (WFC-lite)
        const c = connections;
        if (connectionCount === 4) { type = TileType.X; }
        else if (connectionCount === 3) { 
          type = TileType.T; 
          if (!c.N) rotation = 180;
          if (!c.E) rotation = 270;
          if (!c.S) rotation = 0;
          if (!c.W) rotation = 90;
        }
        else if (connectionCount === 2) {
          if (c.N && c.S) { type = TileType.STRAIGHT; rotation = 0; }
          else if (c.E && c.W) { type = TileType.STRAIGHT; rotation = 90; }
          else {
            type = TileType.CORNER;
            if (c.N && c.E) rotation = 0;
            if (c.E && c.S) rotation = 90;
            if (c.S && c.W) rotation = 180;
            if (c.W && c.N) rotation = 270;
          }
        }
        else if (connectionCount === 1) {
          type = TileType.HALL_END;
          if (c.N) rotation = 0;
          if (c.E) rotation = 90;
          if (c.S) rotation = 180;
          if (c.W) rotation = 270;
        }
        else {
            // Isolated traffic blip?
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
        vibeRef: room?.vibeVector // Pass through existing vibe if present
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
