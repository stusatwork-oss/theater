
import * as THREE from 'three';
import { VibeVector } from '../types';
// Fix: VariantKey is defined in catalog.ts, not variants.ts
import { VariantKey } from '../assets/catalog';
import { getMaterialParams } from '../assets/variants';

export interface TileMaterials {
  floor: THREE.Material;
  walls: THREE.Material;
  ceiling: THREE.Material;
}

const materialCache = new Map<string, TileMaterials>();

export function getTileMaterials(
  variantKey: VariantKey,
  vibe: VibeVector,
  trafficStrength: number
): TileMaterials {
  const cacheKey = `${variantKey}-${vibe.moodTag}-${trafficStrength.toFixed(1)}`;
  if (materialCache.has(cacheKey)) return materialCache.get(cacheKey)!;

  const params = getMaterialParams(vibe, variantKey.split('-')[1]);
  
  const floor = new THREE.MeshStandardMaterial({
    color: new THREE.Color(params.baseColor).multiplyScalar(0.8 - trafficStrength * 0.3),
    roughness: params.roughness,
    metalness: params.metalness,
    emissive: new THREE.Color(params.emissive),
    emissiveIntensity: params.emissiveIntensity * 0.1
  });

  const walls = new THREE.MeshStandardMaterial({
    color: new THREE.Color(vibe.palette[1]),
    roughness: params.roughness * 1.2,
    metalness: params.metalness,
    emissive: new THREE.Color(params.emissive),
    emissiveIntensity: params.emissiveIntensity * 0.2
  });

  const ceiling = new THREE.MeshStandardMaterial({
    color: new THREE.Color(vibe.palette[3]),
    roughness: 0.9,
    metalness: 0,
    emissive: new THREE.Color(params.emissive),
    emissiveIntensity: params.emissiveIntensity * 0.5
  });

  const result = { floor, walls, ceiling };
  materialCache.set(cacheKey, result);
  return result;
}

export function disposeMaterials(): void {
  for (const m of materialCache.values()) {
    m.floor.dispose();
    m.walls.dispose();
    m.ceiling.dispose();
  }
  materialCache.clear();
}
