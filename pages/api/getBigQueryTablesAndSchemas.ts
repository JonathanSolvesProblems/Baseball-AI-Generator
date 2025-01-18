import { NextApiRequest, NextApiResponse } from 'next';
import { BigQuery } from '@google-cloud/bigquery';
import { getVertexProjectId } from '@/app/utils/geminiCalls';

const getDatasetTablesAndSchemas = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const bigquery = new BigQuery();
    const datasetId = 'mlb';
    const projectId = getVertexProjectId();

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
