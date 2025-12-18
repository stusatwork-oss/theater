
import { VibeVector } from '../types';
import { VariantKey, TEMPERATURES, CONDITIONS } from './catalog';

// Map VibeVector to variant key
export function getVariantKey(vibe: VibeVector, condition: string): VariantKey {
  const temp = vibe.warmth < 0.33 ? 'cool' : vibe.warmth > 0.66 ? 'warm' : 'neutral';
  const cond = CONDITIONS.includes(condition as any) ? (condition as any) : 'modern';
  return `${temp}-${cond}` as VariantKey;
}

// Generate material parameters from VibeVector
export interface MaterialParams {
  baseColor: string;
  emissive: string;
  emissiveIntensity: number;
  roughness: number;
  metalness: number;
  opacity: number;
}

export function getMaterialParams(vibe: VibeVector, condition: string): MaterialParams {
  const condIdx = CONDITIONS.indexOf(condition as any);
  const entropyFactor = Math.max(vibe.entropy, condIdx / (CONDITIONS.length - 1));
  
  return {
    baseColor: vibe.palette[0],
    emissive: vibe.palette[2],
    emissiveIntensity: vibe.bloom * 2.0,
    roughness: 0.2 + entropyFactor * 0.8,
    metalness: 0.1 * (1 - entropyFactor),
    opacity: 1.0 - (vibe.fog * 0.5)
  };
}
