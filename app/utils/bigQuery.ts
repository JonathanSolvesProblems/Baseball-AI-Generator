/*
TODO: Consider adding more data to bigquery and making table dynamic:

  'https://storage.googleapis.com/gcp-mlb-hackathon-2025/datasets/2016-mlb-homeruns.csv',
  'https://storage.googleapis.com/gcp-mlb-hackathon-2025/datasets/2017-mlb-homeruns.csv',
  'https://storage.googleapis.com/gcp-mlb-hackathon-2025/datasets/2024-mlb-homeruns.csv',
  'https://storage.googleapis.com/gcp-mlb-hackathon-2025/datasets/2024-postseason-mlb-homeruns.csv'
*/

const sendSQLQuerytoBigQuery = async (sqlQuery: string) => {
    try {
          const queryResponse = await fetch(`/api/getSQLBigQueryResults`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sqlQuery: sqlQuery }),
          });

          if (!queryResponse.ok) {
            throw new Error("Failed to execute SQL query.");
          }

          const data = await queryResponse.json();

          return data;

    } catch (error) {
        const message = `An error has occurred in sendSQLQuerytoBigQuery: ${error}`;
        console.error(message);
        return message;
    }
}


const getChartFormatFromRawData = async (rawData: string) => {
    try {
          const response = await fetch(`/api/convertDataToChart`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rawData }),
          });

          if (!response.ok) {
            throw new Error("Failed to get chart format data: " + response.statusText);
          }

          const data = await response.json();

          return data;

    } catch (error) {
        const message = `An error has occurred in getChartFormatFromRawData: ${error}`;
        console.error(message);
        return message;
    }
}



const getBigQueryTablesAndSchemas = async () => {
  try {
        const dataTableAndSchemas = await fetch(`/api/getBigQueryTablesAndSchemas`);

        if (!dataTableAndSchemas.ok) {
          throw new Error("Failed to get big query tables and schemas");
        }

        const data = await dataTableAndSchemas.json();

        return data;

  } catch (error) {
      const message = `An error has occurred in getBigQueryTablesAndSchemas: ${error}`;
      console.error(message);
      return message;
  }
}


export { sendSQLQuerytoBigQuery, getChartFormatFromRawData, getBigQueryTablesAndSchemas }