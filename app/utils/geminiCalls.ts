import { GoogleGenerativeAI } from "@google/generative-ai";
import { loadCSV } from "./helper";

const getGeminiKey = () => {
    const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!GEMINI_API_KEY) throw new Error('no gemini API key');

    return GEMINI_API_KEY;
}


const getVertexProjectId = () => {
    const projectId = process.env.NEXT_PUBLIC_GEMINI_PROJECT_ID

    if (!projectId) throw new Error('no vertex AI project Id');

    return projectId;
}

const getAnswerFromGemini = async (prompt: string) => {

    const GEMINI_API_KEY = getGeminiKey();

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const csvData: any = await loadCSV('/api/getHomeruns');

    const chat = model.startChat({
        history: [{
            "role": "user",
            "parts": csvData
        }],
        generationConfig: {
            maxOutputTokens: 500,
        }
    });

    const askAndRespond = async () => {
        const result = await chat.sendMessage(prompt);
        const response = await result.response;
        const text = await response.text();
        // console.log('AI: ', text)
    }

    await askAndRespond();

}

const analyzeVideoWithAudio = async (videoUrl: string, videoName: string, language: string = "English") => {
    try {
      const res = await fetch(`/api/getVideoSummary?videoUrl=${encodeURIComponent(videoUrl)}&language=${encodeURIComponent(language)}&videoName=${encodeURIComponent(videoName)}`);
        //console.log(res);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const contentType = res.headers.get("Content-Type");

      if (contentType && !contentType.includes("application/json")) return await res.text();
        
        const data: any = await res.json();

        if (!data) {
            console.error(`'Data is undefined in analyzeVideoWithAudio: ${data}`);
            return;
        }

        if (!data.candidates) {
            console.error(`'Data candidates is undefined in analyzeVideoWithAudio: ${JSON.stringify(data)}`);
            return;
        }

        if (!data.candidates[0].content) {
            console.error(`'Data content is undefined in analyzeVideoWithAudio: ${data.candidates[0]}`);
            return;
        }

        if (!data.candidates[0].content.parts) {
            console.error(`'Data content parts is undefined in analyzeVideoWithAudio: ${!data.candidates[0].content}`);
            return;
        }

        if (!data.candidates[0].content.parts[0].text) {
            console.error(`'Data content parts text is undefined in analyzeVideoWithAudio: ${!data.candidates[0].content.parts[0]}`);
            return;
        }
 
        return data.candidates[0].content.parts[0].text;

    } catch (error) {
        console.error(`Error getting video summary: ${error}`);
    }
};

const askSQLQuestion = async(query: string) => {
    try {
        const res = await fetch(`/api/generateSQLQuery?query=${encodeURIComponent(query)}`);
        const sqlQuery = await res.text();

        return sqlQuery;
    } catch (error: any) {
        const errorMessage = `An error occurred in the askSQLQuestion step: ${error.message}`;
        console.error(errorMessage);
        return errorMessage;
    }
}

const generatePersonalizedArticle = async (rawData: any, language: string = 'English') => {
    try { 
      // Sending rawData to the server-side API
      const res = await fetch(`/api/generateArticle?rawData=${encodeURIComponent(JSON.stringify(rawData))}&language=${encodeURIComponent(language)}`);
  
      // Checking if the response is OK and returning the generated article
      if (!res.ok) {
        throw new Error('Failed to fetch the personalized article');
      }
  
      const data = await res.json();
  
      // Assuming the article is in the "article" key
      return data.article;
    } catch (error: any) {
      const errorMessage = `An error occurred in the generatePersonalizedArticle step: ${error.message}`;
      console.error(errorMessage);
      return errorMessage;
    }
  }
  


export { getAnswerFromGemini, analyzeVideoWithAudio, getVertexProjectId, getGeminiKey, askSQLQuestion, generatePersonalizedArticle };