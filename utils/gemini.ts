// utils/gemini.ts
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const googleAI = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY_TAG || '',
});

export function gemini(model: string) {
  return googleAI(model);
}