const { onSchedule } = require("firebase-functions/v2/scheduler");
const { logger } = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// Scheduled function that runs every 24 hours every 24 hours 
// every day 04:00
// https://firebase.google.com/docs/functions/schedule-functions?gen=2nd
exports.sendDailyEmails = onSchedule({
  schedule: "every day 15:05",
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

        const articleData = await generatePersonalizedArticle(
          userDoc.id
        );

        if (!articleData) {
          logger.warn(`Could not generate article for user ${userDoc.id}`);
          continue;
        }

        const { article, title } = articleData;



        await admin.firestore().collection("mail").add({
          to: [email],
          message: {
            subject: `Personalized Baseball Article: ${title}`,
            text: `Hello ${user.firstName},\n\n${article}`,
            html: `
              <h1>${title}</h1>
              <p>${article.replace(/\n/g, "<br>")}</p>
            `,
          },
        });

        logger.log(`Queued email for user ${userDoc.id}`);
      } catch (error) {
        logger.error(`Error sending email for user ${userDoc.id}:`, error);
      }
    }
  }
});


const generatePersonalizedArticle = async (rawData: any) => {
  try {
    // Sending rawData to the server-side API
    const res = await fetch('https://baseball-ai-generator.vercel.app/api/generateArticle?rawData=' + encodeURIComponent(JSON.stringify(rawData)));

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