
import * as THREE from 'three';
import { VibeVector } from '../types';

export const scene = new THREE.Scene();

// Persistent player light
const playerLight = new THREE.PointLight(0xffffff, 0.5, 12);

export function setupScene(vibe?: VibeVector): void {
  scene.clear();
  
  const fogColor = vibe ? vibe.palette[4] : '#0a0c10';
  scene.fog = new THREE.FogExp2(fogColor, vibe ? 0.01 + vibe.fog * 0.05 : 0.03);
  scene.background = new THREE.Color(fogColor);

  const ambient = new THREE.AmbientLight(0xffffff, vibe ? 0.4 + (1 - vibe.contrast) * 0.4 : 0.7);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(vibe ? vibe.palette[2] : 0xffffff, 0.5);
  dirLight.position.set(5, 10, 7.5);
  scene.add(dirLight);

  // Re-add player light
  scene.add(playerLight);

  if (vibe && vibe.flicker > 0.3) {
    const flickerLight = new THREE.PointLight(vibe.palette[0], 0.5, 20);
    flickerLight.position.set(0, 3, 0);
    scene.add(flickerLight);
    
    const updateFlicker = () => {
      if (Math.random() < vibe.flicker * 0.5) {
        flickerLight.intensity = Math.random() * 2;
      } else {
        flickerLight.intensity = 0.5;
      }
      setTimeout(updateFlicker, 50 + Math.random() * 200);
    };
    updateFlicker();
  }
}

export function updatePlayerLight(position: THREE.Vector3) {
  playerLight.position.copy(position);
  playerLight.position.y += 0.5; // Slightly above eye level
}

export function clearScene(): void {
  scene.clear();
}
