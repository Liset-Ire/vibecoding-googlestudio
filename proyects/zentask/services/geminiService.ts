import { GoogleGenAI, Type } from "@google/genai";
import { Language } from "../types";

// Initialize the Gemini API client
// We assume process.env.API_KEY is available as per instructions.
// In a real environment, you might want to handle the missing key case more gracefully in the UI.
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

export const breakdownTaskWithAI = async (taskText: string, language: Language = 'en'): Promise<string[]> => {
  if (!apiKey) {
    console.warn("Gemini API Key is missing.");
    return [];
  }

  const prompt = language === 'es' 
    ? `Divide la tarea "${taskText}" en 3 a 5 subtareas más pequeñas y accionables. Mantenlas concisas. Responde en Español.`
    : `Break down the task "${taskText}" into 3 to 5 smaller, actionable sub-tasks. Keep them concise. Respond in English.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
          },
        },
      },
    });

    if (response.text) {
      const subtasks = JSON.parse(response.text);
      if (Array.isArray(subtasks)) {
        return subtasks;
      }
    }
    return [];
  } catch (error) {
    console.error("Failed to breakdown task with Gemini:", error);
    return [];
  }
};

export const generateLogoWithAI = async (): Promise<string | null> => {
  if (!apiKey) {
    console.warn("Gemini API Key is missing.");
    return null;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // Nano Banana model for image generation
      contents: {
        parts: [
          { 
            text: "Create a minimalist, modern logo for a productivity app named 'ZenTask'. The design should represent focus, balance, and checking things off. Use a color palette of indigo, slate, and white. Vector art style, clean lines, flat design, icon only, white background." 
          }
        ],
      },
    });

    // Extract image from response
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      const parts = candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Failed to generate logo with Gemini:", error);
    return null;
  }
};