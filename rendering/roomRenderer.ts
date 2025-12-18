
import * as THREE from 'three';
import { TheaterRoom, VibeVector } from '../types';
import { TILE_SIZE, WALL_HEIGHT } from './constants';
import { ROOM_PROPS, PropId } from '../assets/catalog';

export interface RoomLayout {
  group: THREE.Group;
  dispose: () => void;
}

export function generateRoomLayout(room: TheaterRoom): RoomLayout {
  const group = new THREE.Group();
  const size = TILE_SIZE * 3;
  const half = size / 2;
  const vibe = room.vibeVector!;

  // Materials
  const floorMat = new THREE.MeshStandardMaterial({ 
    color: vibe.palette[0],
    roughness: 0.8,
    metalness: 0.1
  });
  const wallMat = new THREE.MeshStandardMaterial({ 
    color: vibe.palette[1],
    roughness: 0.9 
  });
  const ceilingMat = new THREE.MeshStandardMaterial({ 
    color: vibe.palette[4],
    roughness: 1 
  });

  // Shell
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(size, size), floorMat);
  floor.rotateX(-Math.PI / 2);
  group.add(floor);

  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(size, size), ceilingMat);
  ceiling.rotateX(Math.PI / 2);
  ceiling.position.y = WALL_HEIGHT;
  group.add(ceiling);

  // Walls (North, South, West)
  const createWall = (w: number, h: number, x: number, y: number, z: number, ry: number) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wallMat);
    mesh.position.set(x, y, z);
    mesh.rotation.y = ry;
    group.add(mesh);
    return mesh;
  };

  createWall(size, WALL_HEIGHT, 0, WALL_HEIGHT / 2, -half, 0); // North
  createWall(size, WALL_HEIGHT, -half, WALL_HEIGHT / 2, 0, Math.PI / 2); // West
  createWall(size, WALL_HEIGHT, half, WALL_HEIGHT / 2, 0, -Math.PI / 2); // East

  // South wall has a door opening (simplified as two segments)
  const segmentWidth = (size - 2) / 2;
  createWall(segmentWidth, WALL_HEIGHT, -half + segmentWidth / 2, WALL_HEIGHT / 2, half, Math.PI);
  createWall(segmentWidth, WALL_HEIGHT, half - segmentWidth / 2, WALL_HEIGHT / 2, half, Math.PI);

  // Backdrop Image
  if (room.imageUrl) {
    const loader = new THREE.TextureLoader();
    const texture = loader.load(room.imageUrl);
    const backdropMat = new THREE.MeshBasicMaterial({ map: texture });
    const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(size * 0.8, WALL_HEIGHT * 0.8), backdropMat);
    backdrop.position.set(0, WALL_HEIGHT / 2, -half + 0.05);
    group.add(backdrop);
  }

  // Lights
  const pointLight = new THREE.PointLight(vibe.palette[2], 1, 15);
  pointLight.position.set(0, WALL_HEIGHT - 0.5, 0);
  group.add(pointLight);

  // Procedural Props
  if (room.assets) {
    room.assets.forEach((asset, i) => {
      const propId = asset.gameAsset as PropId;
      const config = ROOM_PROPS[propId];
      if (!config) return;

      const propObj = createPlaceholderProp(propId, vibe.palette[3]);
      
      // Simple placement logic: along the walls
      const angle = (i / room.assets!.length) * Math.PI * 1.5 - Math.PI * 0.75;
      const radius = half - 1;
      propObj.position.set(Math.sin(angle) * radius, 0, Math.cos(angle) * radius);
      propObj.rotation.y = -angle;
      group.add(propObj);
    });
  }

  return {
    group,
    dispose: () => {
      floorMat.dispose();
      wallMat.dispose();
      ceilingMat.dispose();
    }
  };
}

function createPlaceholderProp(id: string, color: string): THREE.Group {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color });
  
  if (id.includes('SEAT')) {
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.8), mat);
    base.position.y = 0.25;
    group.add(base);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.2), mat);
    back.position.set(0, 0.6, -0.3);
    group.add(back);
  } else if (id.includes('SIGN')) {
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.5), new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }));
    sign.position.y = 2;
    group.add(sign);
  } else {
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.2, 0.6), mat);
    box.position.y = 0.6;
    group.add(box);
  }

  return group;
}
