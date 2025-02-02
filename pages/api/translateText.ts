import { getGeminiKey } from '@/app/utils/geminiCalls';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextApiRequest, NextApiResponse } from 'next';


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const { text, language } = req.query;

  if (!text) {
    res.status(400).json({ message: 'text is required' });
  }
  
  try {
    const GEMINI_API_KEY = getGeminiKey();

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', systemInstruction: `You only respond back in the language ${language || "English"}`});


    const chat = model.startChat({
      generationConfig: {
          maxOutputTokens: 500
      }
    });

   
    const prompt = `
      Can you output the translation of this text in the language ${language || "English"}:
      ${text}
    `;

    const result = await chat.sendMessage(prompt);
    const response = result.response;

    res.status(200).json({ translatedText: response.text() });
  } catch (error) {
    console.error('Error generating article:', error);
    res.status(500).json({ message: 'Failed to generate article' });
  }
}