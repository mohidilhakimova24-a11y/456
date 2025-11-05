
import { GoogleGenAI, Modality } from "@google/genai";

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const base64Data = reader.result.split(',')[1];
        resolve(base64Data);
      } else {
        reject(new Error("Failed to read file as data URL."));
      }
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
  
  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
};

export const editImageWithGemini = async (imageFile: File, prompt: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const imagePart = await fileToGenerativePart(imageFile);
  const textPart = { text: prompt };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [imagePart, textPart],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });
    
    // Safely access the first candidate and its content
    const candidate = response.candidates?.[0];

    // Find the part containing image data using optional chaining to prevent errors
    const imagePartData = candidate?.content?.parts?.find(part => part.inlineData)?.inlineData;

    if (imagePartData) {
      const base64ImageBytes: string = imagePartData.data;
      const mimeType = imagePartData.mimeType;
      return `data:${mimeType};base64,${base64ImageBytes}`;
    }

    // If no image is returned, provide a more specific error message based on the finish reason
    if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
      let reasonMessage = `Image generation failed. Reason: ${candidate.finishReason}.`;
      if (response.promptFeedback?.blockReason) {
        reasonMessage += ` (Details: ${response.promptFeedback.blockReason}).`;
      }
      reasonMessage += " Please modify your prompt and try again.";
      throw new Error(reasonMessage);
    }
    
    throw new Error("No image data found in the API response. The response may have been empty or blocked.");
  } catch (error) {
    console.error("Gemini API call failed:", error);
    // Re-throw the error so the UI component can display it
    throw error;
  }
};
