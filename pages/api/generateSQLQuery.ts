// pages/api/generate-sql.ts

import { getBigQueryTablesAndSchemas } from '@/app/utils/bigQuery';
import { getGeminiKey, getVertexProjectId } from '@/app/utils/geminiCalls';
import { BigQuery } from '@google-cloud/bigquery';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextApiRequest, NextApiResponse } from 'next';


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const { query } = req.query;

  console.log(`query is ${query}`);
  if (!query) {
    res.status(400).json({ message: 'Query is required' });
  }
  

  try {

    const bigquery = new BigQuery();
    const datasetId = 'mlb';
    const projectId = getVertexProjectId();

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
        throw new Error("Query is empty");
      }

      if (!Array.isArray(tables)) {
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
    
    console.log(prompt);

    const GEMINI_API_KEY = getGeminiKey();

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
  } catch (error) {
    console.error('Error generating SQL:', error);
    res.status(500).json({ message: 'Failed to generate SQL' });
  }
}