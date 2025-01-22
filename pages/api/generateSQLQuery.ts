// pages/api/generate-sql.ts

import { getGeminiKey } from '@/app/utils/geminiCalls';
import { BigQuery } from '@google-cloud/bigquery';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextApiRequest, NextApiResponse } from 'next';


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const { query } = req.query;
  if (!query) {
    console.error('Query parameter is missing.');
    return res.status(400).json({ message: 'Query is required' });
  }
  
  const GEMINI_API_KEY = getGeminiKey();

  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || !GEMINI_API_KEY) {
    console.error('Required environment variables are missing.');
    return res.status(500).json({
      message: 'Required environment variables are missing.',
    });
  }
  
  try {

    const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    const credentials = JSON.parse(credentialsJson);

    const projectId = credentials.project_id; // Use the project_id from credentials
    const bigquery = new BigQuery({
      projectId,
      credentials, // Pass the parsed credentials
    });

    const datasetId = 'mlb';

    // Get the dataset reference
    const dataset = bigquery.dataset(datasetId, { projectId });
    console.log(`dataset is ${dataset}`);

    // Fetch table metadata
    const [tables] = await dataset.getTables();

    const tableSchemas: any = await Promise.all(
      tables.map(async (table) => {
        const [metadata] = await table.getMetadata();
        return {
          tableName: table.id,
          schema: metadata.schema.fields, // Schema fields for the table
        };
      })
    );

    const generatePrompt = (query: any, tables: any[]): string => {
      if (!query) {
        console.error("Query is empty");
        throw new Error("Query is empty");
      }

      if (!Array.isArray(tables)) {
        console.error('Invalid data: tables should be an array.');
        throw new TypeError('Invalid data: tables should be an array.');
      }
    
      let datasetDescription = "The data within this BigQuery environment includes the following tables:\n\n";
    
      tables.forEach((table) => {
        datasetDescription += `Table "${projectId}.${datasetId}.${table.tableName}" with fields:\n`;
        table.schema.forEach((field: { name: string; type: string }) => {
          datasetDescription += `  - ${field.name} (${field.type})\n`;
        });
        datasetDescription += "\n";
      });
    
      return `Generate a BigQuery SQL query and make sure to terminate the sql query with ';' for the following natural language question. ${datasetDescription}Note that the fields and tables are written exactly as given in the prompt:\n\n${query}`;
    };
    
   
    const prompt = generatePrompt(query, tableSchemas);
    console.log('Generated prompt:', prompt);

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });


    const chat = model.startChat({
      generationConfig: {
          maxOutputTokens: 500,
      }
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const generatedSql = await response.text();

    res.status(200).json({ res: generatedSql });
  } catch (error: any) {
      console.error('Error generating SQL:', error.message, {
        stack: error.stack,
      });
      res.status(500).json({
        message: 'Failed to generate SQL',
        error: error.message,
      });
  }
}