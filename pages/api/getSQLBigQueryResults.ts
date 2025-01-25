import { getVertexProjectId } from "@/app/utils/geminiCalls";
import { BigQuery } from "@google-cloud/bigquery";
import { NextApiRequest, NextApiResponse } from 'next';

// Decode the base64-encoded GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable
const credentialsBase64 = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

if (!credentialsBase64) {
  throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable is missing.');
}

let credentialsJson;
try {
  const decodedCredentials = Buffer.from(credentialsBase64, 'base64').toString('utf-8');

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).send({ error: "Only POST requests are allowed" });
  }

  const { sqlQuery } = req.body;

  if (!sqlQuery) {
    return res.status(400).send({ error: "SQL query is required." });
  }

  if (typeof sqlQuery !== 'string') {
    return res.status(400).send({ error: "SQL query must be a string." });
  }

  try {
    const [job] = await bigquery.createQueryJob({ query: sqlQuery });
    const [rows] = await job.getQueryResults();

    res.status(200).json({ data: rows });
  } catch (error) {
    console.error("BigQuery Error:", error);
    res.status(500).send({ error: "Failed to execute the query." });
  }
}
