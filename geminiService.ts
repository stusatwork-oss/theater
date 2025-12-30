
import { GoogleGenAI, Type } from "@google/genai";
import { VibeVector } from "./types";

// Always initialize GoogleGenAI with a named parameter for apiKey
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const MANAGER_FALLBACKS = [
  "THE MALL IS CLOSING. PLEASE MOVE TO THE NEAREST EXIT.",
  "EYES ON THE CARPET. FEET ON THE TILES.",
  "WE KNOW YOU'RE IN THERE. WE CAN HEAR THE HUM.",
  "DO NOT ATTEMPT TO OPEN THE UNMARKED DOORS.",
  "THE POPCORN IS FRESH. THE POPCORN IS ETERNAL.",
  "MANAGEMENT IS NOT RESPONSIBLE FOR LOST DIMENSIONS.",
  "KEEP WALKING. THE WALLS ARE BREATHING TODAY.",
  "YOUR PRESENCE HAS BEEN RECORDED. THANK YOU FOR SHOPPING.",
  "THE FOUNTAIN IS NOT FOR WISHING.",
  "LIMIT ONE REALITY PER CUSTOMER."
];

export const analyzeFlavor = async (prompt: string, base64Image?: string) => {
  const ai = getAI();
  
  const systemPrompt = `You are a Vibe Compiler for a Liminal Theater Labyrinth. 
  Extract a 4-layer vibe stack from the input.
  Layer 0: Palette & Warmth.
  Layer 1: Lighting personality (Flicker, Shadows).
  Layer 2: Post-processing (Grain, Bloom, Fog).
  Layer 3: Entropy (Stable vs Cursed).
  
  Output ONLY a single JSON object conforming to the following VibeVector schema.
  All numbers must be clamped between 0.0 and 1.0. 
  palette must contain exactly 5 hex colors.
  Match 3 abstract theater assets.
  Include a "condition" tag based on entropy: 0-0.2 (pristine), 0.2-0.4 (modern), 0.4-0.6 (dusty), 0.6-0.8 (abandoned), 0.8-1.0 (fallout).`;

  const contents = base64Image ? {
    parts: [
      { text: `${systemPrompt} Input: ${prompt}` },
      { inlineData: { data: base64Image, mimeType: "image/jpeg" } }
    ]
  } : {
    parts: [{ text: `${systemPrompt} Input: ${prompt}` }]
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            vibeVector: {
              type: Type.OBJECT,
              properties: {
                palette: { type: Type.ARRAY, items: { type: Type.STRING } },
                warmth: { type: Type.NUMBER },
                saturation: { type: Type.NUMBER },
                contrast: { type: Type.NUMBER },
                entropy: { type: Type.NUMBER },
                flicker: { type: Type.NUMBER },
                fog: { type: Type.NUMBER },
                grain: { type: Type.NUMBER },
                bloom: { type: Type.NUMBER },
                moodTag: { type: Type.STRING }
              },
              required: ["palette", "warmth", "saturation", "contrast", "entropy", "flicker", "fog", "grain", "bloom", "moodTag"]
            },
            condition: { type: Type.STRING },
            assets: {
              // Fix: Changed Record<string, any> to Type.ARRAY as Record is a type, not a value.
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  originalObject: { type: Type.STRING },
                  gameAsset: { type: Type.STRING },
                  confidence: { type: Type.NUMBER }
                },
                required: ["originalObject", "gameAsset", "confidence"]
              }
            }
          },
          required: ["vibeVector", "condition", "assets"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (e) {
    console.error("Flavor Analysis failed:", e);
    throw e;
  }
};

export const generateRoomImage = async (vector: VibeVector, condition: string, direction: 'front' | 'left' | 'right' | 'behind' = 'front') => {
  const ai = getAI();
  
  const orientationMap = {
    front: "Centered wide-angle perspective looking directly at the main cinema screen and plush velvet curtains.",
    left: "Wide-angle side view looking 90 degrees left, focusing on exit doors, wall sconces, and architectural paneling.",
    right: "Wide-angle side view looking 90 degrees right, focusing on emergency aisles, carpets, and side-wall fixtures.",
    behind: "Wide-angle reverse view looking 180 degrees back at the elevated projector booth and heavy entrance doors."
  };

  // Baking in "Marble" World Building Tips:
  // 1. Clear Spatial Definition (floors, walls, ceilings)
  // 2. Multiple Elements (furniture, fixtures)
  // 3. Depth & Perspective (foreground, midground, background)
  // 4. Sharp Focus (no blur)
  // 5. No Characters (humans/animals)
  const prompt = `CINEMATIC SPATIAL ANCHOR: ${orientationMap[direction]}
  THEME: Abstract liminal theater inside a mall backroom, influenced by ${vector.moodTag}.
  CONDITION: ${condition} (entropy level: ${vector.entropy.toFixed(2)}).
  SPATIAL REQUIREMENTS: Sharp architectural lines defining the floor, walls, and ceiling. Ensure deep perspective with clear foreground, midground, and background elements. 
  LIGHTING: ${vector.warmth > 0.5 ? 'Warm artificial orange hues' : 'Cool synthetic blue hues'}, ${vector.flicker > 0.5 ? 'unstable flickering fluorescent' : 'stable cinematic'} personality. Clear shadows defining the geometry.
  ATMOSPHERE: ${vector.fog > 0.5 ? 'Deep depth haze' : 'Crystal clear air'}, ${vector.bloom > 0.5 ? 'blooming light sources' : 'hard surface details'}.
  COLORS: Palette includes ${vector.palette.join(", ")}.
  MANDATORY CONSTRAINTS: ABSOLUTELY NO PEOPLE OR ANIMALS. NO BLUR. High-resolution textures. Sharp architectural edges. No image borders or frames. Arthouse liminal aesthetic.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: { aspectRatio: "16:9" }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (e) {
    console.error(`Image Generation (${direction}) failed:`, e);
  }
  return null;
};

export const generateManagerRemark = async (status: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a creepy, unhelpful, and slightly sinister Mall Manager. 
      The user is currently: ${status}. 
      Give them a short, unsettling remark (max 12 words). Do not explain yourself.`,
    });
    return response.text;
  } catch (e) {
    console.warn("Manager Remark failed (likely quota), using fallback.");
    return MANAGER_FALLBACKS[Math.floor(Math.random() * MANAGER_FALLBACKS.length)];
  }
};
