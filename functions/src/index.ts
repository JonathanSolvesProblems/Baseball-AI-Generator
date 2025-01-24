const { onSchedule } = require("firebase-functions/v2/scheduler");
const { logger } = require("firebase-functions");
const admin = require("firebase-admin");
const domain = 'https://baseball-ai-generator.vercel.app';

admin.initializeApp();

// Scheduled function that runs every 24 hours every 24 hours 
// every day 04:00
// https://firebase.google.com/docs/functions/schedule-functions?gen=2nd
exports.sendDailyEmails = onSchedule({
  schedule: "every day 16:26",
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

          if (followedPlayers.length === 0) {
            logger.log(`User ${userDoc.id} is not following any players, skipping.`);
            continue;
          }
  

        const articleData = await generateArticleText(
          userDoc.id,
          followedPlayers
        );

        if (!articleData) {
          logger.warn(`Could not generate article for user ${userDoc.id}`);
          continue;
        }

        const { article, title } = articleData;

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
            Save Article
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
      const res = await fetch(`${domain}/api/generateSQLQuery?query=${encodeURIComponent(query)}`);
      const sqlQuery = await res.text();

      return sqlQuery;
  } catch (error: any) {
      const errorMessage = `An error occurred in the askSQLQuestion step: ${error.message}`;
      console.error(errorMessage);
      return errorMessage;
  }
}

const sendSQLQuerytoBigQuery = async (sqlQuery: string) => {
  try {
        const queryResponse = await fetch(`${domain}/api/getSQLBigQueryResults`, {
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

const generatePersonalizedArticle = async (rawData: any) => {
  try {
    // Sending rawData to the server-side API
    const res = await fetch(`${domain}/api/generateArticle?rawData=${encodeURIComponent(JSON.stringify(rawData))}`);

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

// const saveArticle = async (userId: string, article: string, articleTitle: string) => {
//   try {
//     const response = await fetch(`${domain}/api/saveArticle`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ userId, article, articleTitle }),
//     });

//     if (!response.ok) {
//       throw new Error(`Error: ${response.statusText}`);
//     }

//     const data = await response.json();
//     console.log(data.message); // "Article saved successfully!"
//   } catch (error) {
//     console.error('Failed to save article:', error);
//   }
// };
