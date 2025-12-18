
import { HallwayTile, TileType, Direction } from '../types';
import { TILE_SIZE, WALL_THICKNESS } from '../rendering/constants';

export interface CollisionResult {
  allowed: boolean;
  adjustedPosition: { x: number; y: number; z: number };
}

export function checkCollision(
  currentPos: { x: number; y: number; z: number },
  targetPos: { x: number; y: number; z: number },
  tiles: Record<string, HallwayTile>,
  playerRadius: number = 0.4
): CollisionResult {
  // Determine tile coordinate
  const tx = Math.floor((targetPos.x + TILE_SIZE / 2) / TILE_SIZE);
  const ty = Math.floor((targetPos.z + TILE_SIZE / 2) / TILE_SIZE);
  const tileId = `${tx}-${ty}`;
  const tile = tiles[tileId];

  if (!tile || tile.type === TileType.VOID) {
    return { allowed: false, adjustedPosition: currentPos };
  }

  // Check walls of the current tile
  const localX = ((targetPos.x + TILE_SIZE / 2) % TILE_SIZE) - TILE_SIZE / 2;
  const localZ = ((targetPos.z + TILE_SIZE / 2) % TILE_SIZE) - TILE_SIZE / 2;
  const limit = TILE_SIZE / 2 - playerRadius;

  let finalX = targetPos.x;
  let finalZ = targetPos.z;
  let allowed = true;

  // Collision with North Wall (negative Z)
  if (!tile.connections['N'] && localZ < -limit) {
    finalZ = ty * TILE_SIZE - limit;
    allowed = false;
  }
  // Collision with South Wall (positive Z)
  if (!tile.connections['S'] && localZ > limit) {
    finalZ = ty * TILE_SIZE + limit;
    allowed = false;
  }
  // Collision with West Wall (negative X)
  if (!tile.connections['W'] && localX < -limit) {
    finalX = tx * TILE_SIZE - limit;
    allowed = false;
  }
  // Collision with East Wall (positive X)
  if (!tile.connections['E'] && localX > limit) {
    finalX = tx * TILE_SIZE + limit;
    allowed = false;
  }

  return {
    allowed,
    adjustedPosition: { x: finalX, y: targetPos.y, z: finalZ }
  };
}
