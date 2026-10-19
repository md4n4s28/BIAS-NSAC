import { GoogleGenAI } from '@google/genai';
import { writeFile } from 'node:fs/promises';
const ai = new GoogleGenAI({ apiKey: process.env.NETLIFY_AI_GATEWAY_KEY, httpOptions: { baseUrl: process.env.NETLIFY_AI_GATEWAY_BASE_URL?.replace(/\/$/, '') } });
const response = await ai.models.generateContent({ model: 'gemini-3.1-flash-image', contents: 'Create an ultra-wide cinematic photorealistic space landscape for a premium science hackathon website. Aspect ratio 16:9. Deep nearly black indigo space, beautiful giant blue-violet Saturn-like ringed planet occupying the RIGHT half, illuminated crescent blue rim with intricate realistic icy rings slanting diagonally, tiny distant moon. Bottom right a small astronaut viewed from behind on a rugged lunar ridge gazing at the planet. Subtle purple nebula and finely detailed distant stars. LEFT HALF must be dark open space with very subtle starfield to accommodate white website text. Sophisticated film photography, deep blacks, cold blue and violet colors, restrained pale coral light on horizon. High detail, atmospheric, no text, no typography, no logos, no watermark.', config: { responseModalities: ['IMAGE'] } });
for (const part of response.candidates?.[0]?.content?.parts ?? []) {
  if (part.inlineData) { await writeFile('public/img/hero-space.png', Buffer.from(part.inlineData.data, 'base64')); console.log('Hero artwork saved.'); }
}
