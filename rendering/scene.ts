
import * as THREE from 'three';
import { VibeVector } from '../types';

export const scene = new THREE.Scene();

export function setupScene(vibe?: VibeVector): void {
  scene.clear();
  
  const fogColor = vibe ? vibe.palette[4] : '#0d1117';
  scene.fog = new THREE.FogExp2(fogColor, vibe ? 0.02 + vibe.fog * 0.15 : 0.08);
  scene.background = new THREE.Color(fogColor);

  const ambient = new THREE.AmbientLight(0xffffff, vibe ? 0.1 + (1 - vibe.contrast) * 0.2 : 0.2);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(vibe ? vibe.palette[2] : 0xffffff, 0.4);
  dirLight.position.set(5, 10, 7.5);
  scene.add(dirLight);

  // Add flickering light if vibe exists
  if (vibe && vibe.flicker > 0.3) {
    const flickerLight = new THREE.PointLight(vibe.palette[0], 0.5, 20);
    flickerLight.position.set(0, 3, 0);
    scene.add(flickerLight);
    
    // Simple flicker logic update
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

export function clearScene(): void {
  scene.clear();
}
