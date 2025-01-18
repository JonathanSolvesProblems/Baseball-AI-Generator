import { getGeminiKey } from '@/app/utils/geminiCalls';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextApiRequest, NextApiResponse } from 'next';


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const { rawData } = req.query;

  if (!rawData) {
    res.status(400).json({ message: 'prompt is required' });
  }
  
  try {
    const GEMINI_API_KEY = getGeminiKey();

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });


    const chat = model.startChat({
      generationConfig: {
          maxOutputTokens: 500,
      }
    });

    let dataArray: any[];

    try {
      dataArray = JSON.parse(rawData as string);
    } catch (error) {
      res.status(400).json({ message: 'Invalid rawData format. Must be a JSON array.' });
      return;
    }

    if (!Array.isArray(dataArray)) {
      res.status(400).json({ message: 'rawData must be an array.' });
      return;
    }


    const prompt = `
      Generate a personalized article based on the following data:
      ${JSON.stringify(dataArray, null, 2)}
      Use the following structure:
      - Highlight key details such as name, age, position, and team.
      - Provide a brief background and interesting facts if available.
      - Make it engaging and human-readable for a sports fan audience.
    `;

    console.log(prompt);

    const result = await chat.sendMessage(prompt);
    const response = result.response;

    res.status(200).json({ article: response.text() });
  } catch (error) {
    console.error('Error generating article:', error);
    res.status(500).json({ message: 'Failed to generate article' });
  }
}