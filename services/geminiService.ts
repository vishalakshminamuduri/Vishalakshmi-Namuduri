
import { GoogleGenAI, Modality } from "@google/genai";

// Assume process.env.API_KEY is available and configured.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

interface ImageInput {
  base64: string;
  mimeType: string;
}

/**
 * Removes a necklace from a person's photo.
 * @param personImage The image of the person wearing a necklace.
 * @returns Base64 string of the image with the necklace removed.
 */
export const removeNecklace = async (personImage: ImageInput): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: personImage.base64,
              mimeType: personImage.mimeType,
            },
          },
          {
            text: 'Carefully remove any necklace the person is wearing. Reconstruct the neck and chest area to look natural and as if no necklace was ever there. Do not alter the person\'s face or clothing otherwise.',
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });
    
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    throw new Error('No image was generated for necklace removal.');

  } catch (error) {
    console.error("Error removing necklace:", error);
    throw new Error("Failed to remove the necklace. Please try again.");
  }
};

/**
 * Adds a necklace to a person's photo.
 * @param personImageNoNecklace The image of the person without a necklace.
 * @param necklaceImage The image of the necklace to add.
 * @returns Base64 string of the final image.
 */
export const addNecklace = async (
  personImageNoNecklace: ImageInput,
  necklaceImage: ImageInput
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: personImageNoNecklace.base64,
              mimeType: personImageNoNecklace.mimeType,
            },
          },
          {
            inlineData: {
              data: necklaceImage.base64,
              mimeType: necklaceImage.mimeType,
            },
          },
          {
            text: 'Take the necklace from the second image and place it realistically and naturally around the neck of the person in the first image. The necklace should be scaled and positioned correctly to look like it is being worn. Preserve the original quality and details of both the person and the necklace.',
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return part.inlineData.data;
        }
      }
      throw new Error('No image was generated for adding the necklace.');

  } catch (error) {
    console.error("Error adding necklace:", error);
    throw new Error("Failed to add the necklace. Please try again.");
  }
};
