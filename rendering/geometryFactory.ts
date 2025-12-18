
import * as THREE from 'three';
import { TileType } from '../types';
import { TILE_SIZE, WALL_HEIGHT, WALL_THICKNESS } from './constants';

export interface TileGeometry {
  floor: THREE.BufferGeometry;
  walls: THREE.BufferGeometry;
  ceiling: THREE.BufferGeometry;
}

const geoCache = new Map<TileType, TileGeometry>();

export function createTileGeometry(type: TileType): TileGeometry | null {
  if (type === TileType.VOID) return null;
  if (geoCache.has(type)) return geoCache.get(type)!;

  const halfSize = TILE_SIZE / 2;
  const floor = new THREE.PlaneGeometry(TILE_SIZE, TILE_SIZE);
  floor.rotateX(-Math.PI / 2);

  const ceiling = new THREE.PlaneGeometry(TILE_SIZE, TILE_SIZE);
  ceiling.rotateX(Math.PI / 2);
  ceiling.translate(0, WALL_HEIGHT, 0);

  const walls = new THREE.BufferGeometry();
  const vertices: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];

  const addWall = (x1: number, z1: number, x2: number, z2: number) => {
    // Normal calculation (cross product of up and wall direction)
    const dx = x2 - x1;
    const dz = z2 - z1;
    const len = Math.sqrt(dx * dx + dz * dz);
    const nx = dz / len;
    const nz = -dx / len;

    // Triangle 1
    vertices.push(x1, 0, z1, x1, WALL_HEIGHT, z1, x2, WALL_HEIGHT, z2);
    // Triangle 2
    vertices.push(x1, 0, z1, x2, WALL_HEIGHT, z2, x2, 0, z2);

    for (let i = 0; i < 6; i++) {
      normals.push(nx, 0, nz);
    }
    
    uvs.push(0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0);
  };

  switch (type) {
    case TileType.STRAIGHT:
      addWall(-halfSize, -halfSize, -halfSize, halfSize); // West
      addWall(halfSize, halfSize, halfSize, -halfSize);  // East
      break;
    case TileType.CORNER:
      addWall(-halfSize, -halfSize, -halfSize, halfSize); // West
      addWall(-halfSize, -halfSize, halfSize, -halfSize); // North
      break;
    case TileType.T:
      addWall(-halfSize, -halfSize, halfSize, -halfSize); // North
      break;
    case TileType.X:
      // No walls
      break;
    case TileType.DOOR_FRAME:
      // West wall
      addWall(-halfSize, -halfSize, -halfSize, halfSize);
      // North wall
      addWall(-halfSize, -halfSize, halfSize, -halfSize);
      // East wall
      addWall(halfSize, halfSize, halfSize, -halfSize);
      break;
    case TileType.HALL_END:
      addWall(-halfSize, -halfSize, -halfSize, halfSize);
      addWall(-halfSize, -halfSize, halfSize, -halfSize);
      addWall(halfSize, halfSize, halfSize, -halfSize);
      break;
  }

  walls.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  walls.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  walls.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

  const result = { floor, walls, ceiling };
  geoCache.set(type, result);
  return result;
}
