
import { GoogleGenAI, Type } from "@google/genai";
import { VibeVector } from "./types";

// Always initialize GoogleGenAI with a named parameter for apiKey
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

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

  // Use the .text property to access the result
  return JSON.parse(response.text);
};

export const generateRoomImage = async (vector: VibeVector, condition: string) => {
  const ai = getAI();
  const prompt = `A cinematic ultra-realistic shot of a small theater inside a mall backroom.
  Architecture: Abstract, influenced by ${vector.moodTag}.
  Condition: ${condition} (entropy: ${vector.entropy.toFixed(2)}).
  Lighting: ${vector.warmth > 0.5 ? 'Warm orange-tinted' : 'Cool blue-tinted'} lighting, ${vector.flicker > 0.5 ? 'flickering fluorescent' : 'stable cinematic'} personality.
  Atmosphere: ${vector.fog > 0.5 ? 'Dense depth haze' : 'Clear air'}, ${vector.bloom > 0.5 ? 'heavy bloom highlights' : 'sharp details'}.
  Colors: Dominant ${vector.palette.join(", ")}.
  Details: ${vector.entropy > 0.7 ? 'Cursed, rotting velvet, spatial distortions' : 'Clean mall tiles, luxury gold trim'}.
  NO PEOPLE. Arthouse film look.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: { aspectRatio: "16:9" }
    }
  });

  // Iterate through parts to find the image part
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

export const generateManagerRemark = async (status: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are a creepy, unhelpful, and slightly sinister Mall Manager. 
    The user is currently: ${status}. 
    Give them a short, unsettling remark (max 12 words). Do not explain yourself.`,
  });
  return response.text;
};
