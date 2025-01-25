/*
TODO: Consider adding more data to bigquery and making table dynamic:

  'https://storage.googleapis.com/gcp-mlb-hackathon-2025/datasets/2016-mlb-homeruns.csv',
  'https://storage.googleapis.com/gcp-mlb-hackathon-2025/datasets/2017-mlb-homeruns.csv',
  'https://storage.googleapis.com/gcp-mlb-hackathon-2025/datasets/2024-mlb-homeruns.csv',
  'https://storage.googleapis.com/gcp-mlb-hackathon-2025/datasets/2024-postseason-mlb-homeruns.csv'
*/

import { askSQLQuestion, generatePersonalizedArticle } from "./geminiCalls";
import { parseSQL } from "./helper";

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


const getChartFormatFromRawData = async (query: string, rawData: string) => {
    try {
          const response = await fetch(`/api/convertDataToChart`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query, rawData }),
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

// Will be used for getting a random followed player or team.
const getRandomValueFromArray = (array: string[]) => {
  if (!array.length) return null;

  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

const generateArticleText = async (
  userId: string | null,
  followedPlayers: string[]
): Promise<{ article: string; title: string } | null> => {
  if (!userId || !followedPlayers.length) {
    console.warn("User ID or followed players are not available.");
    return null;
  }

  const randomPlayer = getRandomValueFromArray(followedPlayers);

  if (!randomPlayer) {
    console.warn("No random player found.");
    return null;
  }

  const prompt = `Can you give me information related to player with id ${randomPlayer}`;

  try {
    const result = await askSQLQuestion(prompt); // Returns plain text response
    const cleanedSQL = parseSQL(JSON.parse(result).res); // Extract the clean SQL query
    console.log(`SQL query generated: ${cleanedSQL}`);

    const data = await sendSQLQuerytoBigQuery(cleanedSQL);
    console.log(`Query results: ${JSON.stringify(data)}`);

    const articleText = await generatePersonalizedArticle(data.data);
    console.log("Generated article:", articleText);

    const articleTitle = articleText.split("\n")[0] || "Personalized Article";

    return { article: articleText, title: articleTitle };
  } catch (err) {
    console.error("Error generating article text:", err);
    return null;
  }
};

const getFanContentInteractionDataFromTeamOrPlayer = async (
  teamId?: string | null,
  playerId?: string | null
): Promise<{ data: any[] } | null> => {
  if ((!teamId && !playerId)) {
    console.warn("Team or player id not available.");
    return null;
  }

  const whereClause = playerId
  ? `${playerId} IN UNNEST(player_tags)`
  : `${teamId} IN UNNEST(team_ids)`;

    const query = `
    SELECT 
      slug, 
      MIN(date_time_date) AS date_time_date, 
      ANY_VALUE(content_headline) AS content_headline,
      ANY_VALUE(content_type) AS content_type
    FROM 
      \`fluted-clock-446014-v7.mlb.fan_content_interaction_data\` 
    WHERE 
      ${whereClause}
    GROUP BY 
      slug
  `;

  console.log(query);

  try {
    const response = await sendSQLQuerytoBigQuery(query);
    const transformedData = response.data.map((row: any) => {
      const contentType = row.content_type === "video" ? "video" : "news";
      return {
        Headline: row.content_headline,
        posted: row.date_time_date.value,
        source: `https://www.mlb.com/${contentType}/${row.slug}`,
      };
    });

    console.log("Transformed Data:", JSON.stringify(transformedData));

    return { data: transformedData };
  } catch (err) {
    console.error("Error generating fan content interaction data:", err);
    return null;
  }
};

const getHomerunData = async (playerName: string | null,
): Promise<{ data: any[] } | null> => {
  if (!playerName) {
    console.warn("User ID or player name is not available.");
    return null;
  }

   const query = `
    SELECT 
      title, 
      video, 
      ExitVelocity, 
      HitDistance, 
      LaunchAngle, 
      year, 
      IsPostSeason 
    FROM 
      \`fluted-clock-446014-v7.mlb.homeruns\` 
    WHERE title LIKE '%${playerName}%'
    ORDER BY 
      year DESC
  `;

  console.log("Generated Query:", query);

  try {
    // Send the query to BigQuery
    const response = await sendSQLQuerytoBigQuery(query);

    // Transform the data for easy rendering
    const transformedData = response.data.map((row: any) => ({
      Title: row.title,
      Video: row.video,  // This is already a usable link
      ExitVelocity: row.ExitVelocity,
      HitDistance: row.HitDistance,
      LaunchAngle: row.LaunchAngle,
      Year: row.year,
      IsPostSeason: row.IsPostSeason ? "Yes" : "No",
    }));

    console.log("Transformed Data:", JSON.stringify(transformedData));

    return { data: transformedData };
  } catch (err) {
    console.error("Error fetching homerun data:", err);
    return null;
  }
};



export { getHomerunData, getFanContentInteractionDataFromTeamOrPlayer, generateArticleText, sendSQLQuerytoBigQuery, getChartFormatFromRawData, getBigQueryTablesAndSchemas }