
import { useState } from 'react';
import { useLabyrinthStore } from '../store/labyrinthStore';
import { analyzeFlavor, generateRoomImage } from '../geminiService';

export function useClaimRoom() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const claimRoom = useLabyrinthStore((s) => s.claimRoom);

  const claim = async (roomId: string, prompt: string, imageBase64?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const flavor = await analyzeFlavor(prompt, imageBase64);
      const imageUrl = await generateRoomImage(flavor.vibeVector, flavor.condition);

      claimRoom(roomId, {
        vibe: flavor.vibeVector.moodTag,
        vibeVector: flavor.vibeVector,
        dominantColor: flavor.vibeVector.palette[0],
        condition: flavor.condition,
        assets: flavor.assets,
        imageUrl: imageUrl || undefined,
        lastContentUpdate: Date.now(),
      });
      
      return flavor;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Claim failed';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { claim, isLoading, error };
}
