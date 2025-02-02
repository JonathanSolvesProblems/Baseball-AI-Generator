import { getGeminiKey } from '@/app/utils/geminiCalls';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { prompt, sampleCount = 1, seed, aspectRatio = '1:1' } = req.query;

  if (!prompt) {
    console.error('Prompt parameter is missing.');
    return res.status(400).json({ message: 'Prompt is required' });
  }

  const GEMINI_API_KEY = getGeminiKey();

  if (!GEMINI_API_KEY) {
    console.error('API key is missing.');
    return res.status(500).json({ message: 'API key is missing.' });
  }

  try {
   
    const params = {
      prompt,
      sampleCount: parseInt(sampleCount as string, 10),
      seed: seed ? parseInt(seed as string, 10) : undefined,
      aspectRatio,
      addWatermark: true, 
    };

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({ model: 'imagen-3.0-generate-002' }); 

    const chat = model.startChat({
      generationConfig: {
        maxOutputTokens: 480, 
      },
    });

    const result = await chat.sendMessage(JSON.stringify(params));
    const response = await result.response;
    const generatedImages = await response.text();  

    res.status(200).json({ images: generatedImages });
  } catch (error: any) {
    console.error('Error generating image:', error.message, { stack: error.stack });
    res.status(500).json({ message: 'Failed to generate image', error: error.message });
  }
}
