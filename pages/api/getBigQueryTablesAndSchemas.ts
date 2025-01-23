import { NextApiRequest, NextApiResponse } from 'next';
import { BigQuery } from '@google-cloud/bigquery';
import { getVertexProjectId } from '@/app/utils/geminiCalls';

const getDatasetTablesAndSchemas = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const datasetId = 'mlb';
    const projectId = getVertexProjectId();

    // Decode the base64-encoded GOOGLE_APPLICATION_CREDENTIALS_JSON
    const credentialsBase64 = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

    if (!credentialsBase64) {
      throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable is missing.');
    }

    let credentialsJson;
    try {
      const decodedCredentials = Buffer.from(credentialsBase64, 'base64').toString('utf-8');
      console.log('Decoded credentials JSON:', decodedCredentials); // Log for debugging
      credentialsJson = JSON.parse(decodedCredentials);
    } catch (error) {
      console.error('Error decoding or parsing credentials:', error);
      throw new Error('Failed to decode or parse credentials.');
    }

    if (!credentialsJson) throw new Error('Invalid credentials.');

    const bigquery = new BigQuery({
      projectId: credentialsJson.project_id, // Use the project_id from credentials
      credentials: credentialsJson,           // Pass the parsed credentials
    });

    // Get the dataset reference
    const dataset = bigquery.dataset(datasetId, { projectId });

    // Fetch table metadata
    const [tables] = await dataset.getTables();

    const tableSchemas = await Promise.all(
      tables.map(async (table) => {
        const [metadata] = await table.getMetadata();
        return {
          tableName: table.id,
          schema: metadata.schema.fields, // Schema fields for the table
        };
      })
    );

    res.status(200).json({ success: true, tables: tableSchemas });
  } catch (error: any) {
    console.error('Error fetching BigQuery tables and schemas:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export default getDatasetTablesAndSchemas;
