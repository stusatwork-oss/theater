
import * as THREE from 'three';
import { checkCollision } from '../physics/collision';
import { HallwayTile } from '../types';
import { useLabyrinthStore } from '../store/labyrinthStore';

export const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);

// Initialize position from store if possible
const initialPos = useLabyrinthStore.getState().currentPosition;
camera.position.set(initialPos.x, initialPos.y, initialPos.z);

export interface ControlState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
}

const moveState: ControlState = {
  forward: false,
  backward: false,
  left: false,
  right: false,
};

const rotation = new THREE.Euler(0, 0, 0, 'YXZ');
const moveVector = new THREE.Vector3();
const targetPos = new THREE.Vector3();

export function setupControls(canvas: HTMLCanvasElement): void {
  canvas.addEventListener('click', (e) => {
    if (document.pointerLockElement !== canvas) {
      canvas.requestPointerLock();
    }
  });

  window.addEventListener('keydown', (e) => {
    switch (e.code) {
      case 'KeyW': moveState.forward = true; break;
      case 'KeyS': moveState.backward = true; break;
      case 'KeyA': moveState.left = true; break;
      case 'KeyD': moveState.right = true; break;
    }
  });

  window.addEventListener('keyup', (e) => {
    switch (e.code) {
      case 'KeyW': moveState.forward = false; break;
      case 'KeyS': moveState.backward = false; break;
      case 'KeyA': moveState.left = false; break;
      case 'KeyD': moveState.right = false; break;
    }
  });

  window.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement === canvas) {
      rotation.y -= e.movementX * 0.002;
      rotation.x -= e.movementY * 0.002;
      rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotation.x));
      camera.quaternion.setFromEuler(rotation);
    }
  });
}

export function updateCamera(delta: number, tiles: Record<string, HallwayTile>): void {
  const speed = 5.0;
  moveVector.set(0, 0, 0);

  if (moveState.forward) moveVector.z -= 1;
  if (moveState.backward) moveVector.z += 1;
  if (moveState.left) moveVector.x -= 1;
  if (moveState.right) moveVector.x += 1;

  if (moveVector.lengthSq() > 0) {
    moveVector.normalize().multiplyScalar(speed * delta);
    moveVector.applyQuaternion(camera.quaternion);
    moveVector.y = 0; // Maintain height

    targetPos.copy(camera.position).add(moveVector);

    const collision = checkCollision(camera.position, targetPos, tiles);
    camera.position.copy(collision.adjustedPosition as any);
  }
}
