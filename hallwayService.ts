
import { TheaterRoom, Edge, HallwayTile, TileType, Direction, VibeVector } from './types';

const getGridId = (x: number, y: number) => `${x}-${y}`;
const parseGridId = (id: string) => id.split('-').map(Number);
const DIRS: Direction[] = ['N', 'E', 'S', 'W'];

function getVariantFromVibe(v: VibeVector | undefined): string {
  if (!v) return "neutral-clean";
  const temp = v.warmth > 0.5 ? "warm" : "cool";
  const texture = v.entropy > 0.5 ? "decay" : "clean";
  return `${temp}-${texture}`;
}

export function generateLabyrinthLayout(
  rooms: Record<string, TheaterRoom>,
  edges: Record<string, Edge>,
  gridSize: number
): Record<string, HallwayTile> {
  
  const layout: Record<string, HallwayTile> = {};
  const activeCells = new Set<string>();
  const cellTraffic: Record<string, number> = {};
  const influenceMap: Record<string, VibeVector> = {};

  // --- SAFE ZONE GENERATION ---
  // Ensure a 3x3 cross around (0,0) exists so the player isn't in a void
  const safeZone = ['0-0', '1-0', '-1-0', '0-1', '0-1'];
  safeZone.forEach(id => {
    activeCells.add(id);
    cellTraffic[id] = 0.1;
  });

  // 1. All defined rooms are active points
  Object.values(rooms).forEach(room => {
    activeCells.add(room.id);
    cellTraffic[room.id] = (room.owner ? 1.0 : 0.3);
    if (room.vibeVector) {
      influenceMap[room.id] = room.vibeVector;
    }
  });

  // 2. Register Edges (Traffic Paths)
  Object.values(edges).forEach(edge => {
    const [x1, y1] = parseGridId(edge.from);
    const [x2, y2] = parseGridId(edge.to);
    
    const startVibe = rooms[edge.from]?.vibeVector;
    const endVibe = rooms[edge.to]?.vibeVector;
    const dominantVibe = endVibe || startVibe;

    let cx = x1, cy = y1;
    activeCells.add(getGridId(cx, cy));
    
    while (cx !== x2) {
      cx += (cx < x2 ? 1 : -1);
      const id = getGridId(cx, cy);
      activeCells.add(id);
      cellTraffic[id] = Math.max(cellTraffic[id] || 0, 0.2 + edge.traffic);
      if (dominantVibe && !influenceMap[id]) influenceMap[id] = dominantVibe;
    }
    while (cy !== y2) {
      cy += (cy < y2 ? 1 : -1);
      const id = getGridId(cx, cy);
      activeCells.add(id);
      cellTraffic[id] = Math.max(cellTraffic[id] || 0, 0.2 + edge.traffic);
      if (dominantVibe && !influenceMap[id]) influenceMap[id] = dominantVibe;
    }
  });

  // 3. Resolve Tiles
  for (let x = -gridSize/2; x < gridSize/2; x++) {
    for (let y = -gridSize/2; y < gridSize/2; y++) {
      const id = getGridId(x, y);
      if (!activeCells.has(id)) {
        layout[id] = { id, x, y, type: TileType.VOID, rotation: 0, connections: { N: false, E: false, S: false, W: false }, trafficStrength: 0, variant: 'neutral-clean' };
        continue;
      }

      const room = rooms[id];
      const traffic = cellTraffic[id] || 0;
      const vibe = influenceMap[id];
      
      const connections: Record<Direction, boolean> = { N: false, E: false, S: false, W: false };
      let count = 0;
      DIRS.forEach(dir => {
        const nId = getNeighborId(x, y, dir);
        if (activeCells.has(nId)) {
          connections[dir] = true;
          count++;
        }
      });

      let type = TileType.STRAIGHT;
      let rotation = 0;

      if (room) {
        type = TileType.DOOR_FRAME;
        if (connections.S) rotation = 0;
        else if (connections.N) rotation = 180;
        else if (connections.E) rotation = 270;
        else if (connections.W) rotation = 90;
      } else {
        if (count === 4) type = TileType.X;
        else if (count === 3) { 
          type = TileType.T; 
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
            else if (connections.E && connections.S) rotation = 90;
            else if (connections.S && connections.W) rotation = 180;
            else if (connections.W && connections.N) rotation = 270;
          }
        } else {
          type = TileType.HALL_END;
          if (connections.N) rotation = 0;
          else if (connections.E) rotation = 90;
          else if (connections.S) rotation = 180;
          else if (connections.W) rotation = 270;
        }
      }

      layout[id] = {
        id, x, y, type, rotation, connections,
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
