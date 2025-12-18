
import { useLabyrinthStore } from '../store/labyrinthStore';
import { TILE_SIZE } from '../rendering/constants';

let lastTileId: string | null = null;

export function trackTraffic(pos: { x: number; z: number }) {
  const tx = Math.floor((pos.x + TILE_SIZE / 2) / TILE_SIZE);
  const ty = Math.floor((pos.z + TILE_SIZE / 2) / TILE_SIZE);
  const currentTileId = `${tx}-${ty}`;

  if (lastTileId && lastTileId !== currentTileId) {
    const store = useLabyrinthStore.getState();
    // Update traffic on the edge between tiles
    store.updateTraffic(lastTileId, currentTileId, 0.05);
  }
  
  lastTileId = currentTileId;
}

// Optional: Decay logic could be added here and called from the render loop
export function decayTraffic() {
  // To be implemented if we want paths to disappear over time
}
