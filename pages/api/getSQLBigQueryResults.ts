import { getBigQueryTablesAndSchemas } from "@/app/utils/bigQuery";
import { getVertexProjectId } from "@/app/utils/geminiCalls";
import { BigQuery } from "@google-cloud/bigquery";
import { NextApiRequest, NextApiResponse } from 'next';

const bigquery = new BigQuery({
  projectId: getVertexProjectId(), // Replace with your GCP project ID
});

export default async function handler(  req: NextApiRequest,
  res: NextApiResponse) {

    if (req.method !== "POST") {
        return res.status(405).send({ error: "Only POST requests are allowed" });
    }

    const { sqlQuery } = req.body;

    if (!sqlQuery) {
        return res.status(400).send({ error: "SQL query is required." });
    }

    if (typeof(sqlQuery) !== 'string') return;


    try {
        const [job] = await bigquery.createQueryJob({ query: sqlQuery });
        const [rows] = await job.getQueryResults();

        res.status(200).json({ data: rows });
    } catch (error) {
        console.error("BigQuery Error:", error);
        res.status(500).send({ error: "Failed to execute the query." });
    }
}
