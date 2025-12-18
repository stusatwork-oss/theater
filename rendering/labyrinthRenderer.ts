
import * as THREE from 'three';
import { HallwayTile, TheaterRoom, VibeVector } from '../types';
import { createTileGeometry } from './geometryFactory';
import { getTileMaterials } from './materialFactory';
import { scene } from './scene';
import { TILE_SIZE } from './constants';

const tileInstances = new Map<string, THREE.Group>();

const FALLBACK_VIBE: VibeVector = {
  palette: ['#1e293b', '#334155', '#475569', '#64748b', '#0f172a'],
  warmth: 0.2,
  saturation: 0.1,
  contrast: 0.5,
  entropy: 0.1,
  flicker: 0.1,
  fog: 0.2,
  grain: 0.1,
  bloom: 0.2,
  moodTag: 'default-liminal'
};

export function renderLabyrinth(
  tiles: Record<string, HallwayTile>,
  rooms: Record<string, TheaterRoom>
): void {
  // Clear old instances
  for (const group of tileInstances.values()) {
    scene.remove(group);
  }
  tileInstances.clear();

  // Find a default vibe for hallways (from any claimed room or fallback)
  const roomList = Object.values(rooms);
  const defaultVibe = roomList.find(r => r.vibeVector)?.vibeVector || FALLBACK_VIBE;

  for (const tile of Object.values(tiles)) {
    if (tile.type === 'VOID') continue;

    const geometry = createTileGeometry(tile.type);
    if (!geometry) continue;

    const vibe = rooms[tile.id]?.vibeVector || defaultVibe;
    
    const materials = getTileMaterials(
      tile.variant as any,
      vibe,
      tile.trafficStrength
    );

    const group = new THREE.Group();
    group.add(new THREE.Mesh(geometry.floor, materials.floor));
    group.add(new THREE.Mesh(geometry.walls, materials.walls));
    group.add(new THREE.Mesh(geometry.ceiling, materials.ceiling));

    group.position.set(tile.x * TILE_SIZE, 0, tile.y * TILE_SIZE);
    group.rotation.y = (tile.rotation * Math.PI) / 180;

    scene.add(group);
    tileInstances.set(tile.id, group);
  }
}

export function clearLabyrinth(): void {
  for (const group of tileInstances.values()) {
    scene.remove(group);
  }
  tileInstances.clear();
}
