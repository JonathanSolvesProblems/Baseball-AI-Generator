const { onSchedule } = require("firebase-functions/v2/scheduler");
const { logger } = require("firebase-functions");
const admin = require("firebase-admin");
const domain = 'https://baseball-ai-generator.vercel.app';

admin.initializeApp();

type SupportedLanguage = "English" | "Spanish" | "Japanese";

const saveArticleButtonText: Record<SupportedLanguage, string> = {
  English: "Save Article",
  Spanish: "Guardar Artículo",
  Japanese: "記事を保存"
};


// Scheduled function that runs every 24 hours every 24 hours 
// https://firebase.google.com/docs/functions/schedule-functions?gen=2nd
exports.sendDailyEmails = onSchedule({
  schedule: "every day 04:30",
  timeZone: "America/New_York" }, async (event: any) => {
  // Fetch all users from Firestore
  const usersSnapshot = await admin.firestore().collection('users').get();

  if (usersSnapshot.empty) {
    logger.log('No users found!');
    return;
  }

  const today = new Date();
  const dayOfWeek = today.toLocaleDateString("en-US", { weekday: "long" }); // e.g., "Monday"
  const dayOfMonth = today.getDate(); // e.g., 1 for the 1st day of the month

  // Loop through each user and send them an email
  for (const userDoc of usersSnapshot.docs) {
    const user = userDoc.data();
    const notificationPreference = user.notificationPreference;

    if (!notificationPreference || notificationPreference.subscribed === false) {
      continue; // Skip users without preferences
    }

    const { frequency, dayOfWeek: preferredDay, dayOfMonth: preferredDate } =
        notificationPreference;

    let shouldSend = false;

    switch (frequency) {
      case "daily":
        shouldSend = true; // Always send for daily
        break;
      case "weekly":
        shouldSend = dayOfWeek === preferredDay;
        break;
      case "monthly":
        shouldSend = dayOfMonth === preferredDate;
        break;
      default:
        logger.warn(`Unknown frequency for user ${userDoc.id}`);
    }

    if (shouldSend) {
      try {
        const userRecord = await admin.auth().getUser(userDoc.id);
        const email = userRecord.email;

        if (!email) {
          logger.log(`No email found for user ${userDoc.id}, skipping.`);
          continue;
        }

        const userLanguage: string = user.language || "English"; 

        const followedPlayersSnapshot = await admin
          .firestore()
          .collection('users')
          .doc(userDoc.id)
          .collection('followedPlayers')
          .get();

          const followedPlayers: string[] = [];
          followedPlayersSnapshot.forEach((docSnapshot: any) => {
            const data = docSnapshot.data();
            if (data && data.playerId) {
              followedPlayers.push(data.playerId);
            }
          });

          const followedTeamsSnapshot = await admin.firestore()
          .collection('users')
          .doc(userDoc.id)
          .collection('followedTeams')
          .get();

          const followedTeams: string[] = [];
          followedTeamsSnapshot.forEach((docSnapshot: any) => {
            const data = docSnapshot.data();
            if (data && data.teamId) {
              followedTeams.push(data.teamId);
            }
          });

          if (followedPlayers.length === 0 && followedTeams.length === 0) {
            logger.log(`User ${userDoc.id} is not following any players or teams, skipping.`);
            continue;
          }
  
          let articleData;

          if (followedPlayers.length > 0 && followedTeams.length > 0) {
            // Randomly select a player or team
            const isPlayer = Math.random() < 0.5; // 50% chance for player, 50% for team
            articleData = isPlayer
              ? await generateArticleText(userDoc.id, followedPlayers, 'player', userLanguage) // Generate article for a random player
              : await generateArticleText(userDoc.id, followedTeams, 'team', userLanguage); // Generate article for a random team
          } else if (followedPlayers.length > 0) {
            // Only generate article for player if there are no followed teams
            articleData = await generateArticleText(userDoc.id, followedPlayers, 'player', userLanguage);
          } else if (followedTeams.length > 0) {
            // Only generate article for team if there are no followed players
            articleData = await generateArticleText(userDoc.id, followedTeams, 'team', userLanguage);
          }

        if (!articleData) {
          logger.warn(`Could not generate article for user ${userDoc.id}`);
          continue;
        }

        const { article, title } = articleData;

        const saveButtonText = saveArticleButtonText[userLanguage as SupportedLanguage] || saveArticleButtonText.English;

        const emailHtml = `
          <h1>${title}</h1>
          <p>${article.replace(/\n/g, '<br>')}</p>
          <a 
            href="${domain}/api/saveArticle?userId=${encodeURIComponent(userDoc.id)}&article=${encodeURIComponent(article)}&articleTitle=${encodeURIComponent(title)}" 
            style="
              display: inline-block;
              margin-top: 20px;
              padding: 10px 20px;
              font-size: 16px;
              color: white;
              background-color: #007bff;
              text-decoration: none;
              border-radius: 5px;">
            ${saveButtonText}
          </a>
        `;


        await admin.firestore().collection("mail").add({
          to: [email],
          message: {
            subject: `Personalized Baseball Article: ${title}`,
            text: `Hello ${user.firstName},\n\n${article}`,
            html: emailHtml,
          },
        });

        logger.log(`Queued email for user ${userDoc.id}`);
      } catch (error) {
        logger.error(`Error sending email for user ${userDoc.id}:`, error);
      }
    }
  }
});

const getRandomValueFromArray = (array: string[]) => {
  if (!array.length) return null;

  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

const parseSQL = (text: string): string => {
  // Remove formatting, "SQL Query:", and ensure proper spacing
  return text
    .replace(/^SQL Query:\s*/i, "") // Remove "SQL Query:" if it exists at the beginning
    .replace(/```sql|```/g, "") // Remove code block markers
    .replace(/\n/g, " ") // Replace newlines with a space
    .replace(/\s+/g, " ") // Ensure single spaces
    .replace(/^.*?SELECT/i, "SELECT") // Remove everything before the first "SELECT"
    .replace(/;.*$/, "") // Remove everything after the first semicolon
    .trim(); // Remove leading/trailing spaces
};

const askSQLQuestion = async(query: string) => {
  try {
      const res = await fetch(`${domain}/api/generateSQLQueryForArticle?query=${encodeURIComponent(query)}`);
      const sqlQuery = await res.text();

      return sqlQuery;
  } catch (error: any) {
      const errorMessage = `An error occurred in the askSQLQuestion step: ${error.message}`;
      console.error(errorMessage);
      return errorMessage;
  }
}

const sendSQLQuerytoBigQuery = async (sqlQuery: string, retryCount: number = 3): Promise<any> => {
  let attempts = 0;
  let data: any;

  while (attempts < retryCount) {
    try {
      const queryResponse = await fetch(`${domain}/api/getSQLBigQueryResults`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sqlQuery: sqlQuery }),
      });

      if (!queryResponse.ok) {
        throw new Error("Failed to execute SQL query.");
      }

      data = await queryResponse.json();

      if (data && data.data && data.data.length > 0) {
        return data; 
      } else {
        throw new Error('Empty data returned from BigQuery');
      }

    } catch (error: any) {
      attempts += 1;
      console.error(`Attempt ${attempts} failed: ${error.message}`);

      if (attempts < retryCount) {
        console.log("Retrying with modified query...");
        sqlQuery = modifyQueryForRetry(sqlQuery);
      }

      if (attempts >= retryCount) {
        return { message: `Failed to fetch data after ${retryCount} attempts: ${error.message}` };
      }
    }
  }

  return data;
};


const generatePersonalizedArticle = async (rawData: any, language: string = 'English') => {
  try {
    // Sending rawData to the server-side API
    const res = await fetch(`${domain}/api/generateArticle?rawData=${encodeURIComponent(JSON.stringify(rawData))}&language=${encodeURIComponent(language)}`);

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


const generateArticleText = async (
  userId: string | null,
  followedIds: string[],
  dataType: 'player' | 'team',
  language: string = 'English'
): Promise<{ article: string; title: string } | null> => {
  if (!userId || !followedIds.length) {
    console.warn("User ID or followed players/teams are not available.");
    return null;
  }

  const randomId = getRandomValueFromArray(followedIds);

  if (!randomId) {
    console.warn("No random player or team found.");
    return null;
  }

  const prompt = dataType === 'player'
  ? `Generate a BigQuery SQL query to retrieve information for the player with player id ${randomId}. Ensure the query targets the correct player-related fields and optimize for large datasets by adding relevant filters (e.g., date range, or a partition field) or limits (e.g., a limit of 100 rows). Terminate the query with a semicolon.`
  : `Generate a BigQuery SQL query to retrieve information for the team with team id ${randomId}. Ensure the query targets the correct team-related fields and optimize for large datasets by adding relevant filters (e.g., date range, or a partition field) or limits (e.g., a limit of 100 rows). Terminate the query with a semicolon.`;

  try {
    const result = await askSQLQuestion(prompt); // Returns plain text response
    const cleanedSQL = parseSQL(JSON.parse(result).res); // Extract the clean SQL query
    // console.log(`SQL query generated: ${cleanedSQL}`);

    const data = await sendSQLQuerytoBigQuery(cleanedSQL);
    // console.log(`Query results: ${JSON.stringify(data)}`);

    const articleText = await generatePersonalizedArticle(data.data, language);
    // console.log("Generated article:", articleText);

    const articleTitle = articleText.split("\n")[0] || "Personalized Article";

    return { article: articleText, title: articleTitle };
  } catch (err) {
    console.error("Error generating article text:", err);
    return null;
  }
};

const modifyQueryForRetry = (query: string): string => {
  const dateRangeFilter = "AND created_at >= '2023-01-01' AND created_at <= '2023-12-31'";

  const partitionFilter = "AND partition_id = 1"; 

  const limitClause = "LIMIT 100";

  const randomChoice = Math.random(); 

  let modifiedQuery = query;

  if (randomChoice < 0.5) {
    modifiedQuery += ` ${dateRangeFilter}`; 
  }

  if (randomChoice < 0.8) {
    modifiedQuery += ` ${partitionFilter}`; 
  }

  modifiedQuery += ` ${limitClause}`;

  return modifiedQuery;
};
