
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
      // No walls in intersection
      break;
    case TileType.DOOR_FRAME:
      // Door frames are hallway segments with a specific opening.
      // We render two side walls, assuming the 'door' is on one of the other faces.
      addWall(-halfSize, -halfSize, -halfSize, halfSize); // West
      addWall(halfSize, halfSize, halfSize, -halfSize);  // East
      // Add a small lintel above where the door would be (North face)
      const lintelY = 2.2;
      addWall(-halfSize, halfSize, halfSize, halfSize); // North wall, but we'll manually adjust vertices for a cutout next
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
