const { onSchedule } = require("firebase-functions/v2/scheduler");
const { logger } = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// Scheduled function that runs every 24 hours every 24 hours 
// every day 04:00
// https://firebase.google.com/docs/functions/schedule-functions?gen=2nd
exports.sendDailyEmails = onSchedule({
  schedule: "every day 09:12",
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

        const article = generateArticleForUser(user);

        await admin.firestore().collection("mail").add({
          to: [email],
          message: {
            subject: "Your Scheduled Article",
            text: `Hello, here is your scheduled article: ${article}`,
            html: `<h1>Your Scheduled Article</h1><p>${article}</p>`,
          },
        });

        logger.log(`Queued email for user ${userDoc.id}`);
      } catch (error) {
        logger.error(`Error sending email for user ${userDoc.id}:`, error);
      }
    }
  }
});

// Helper function to generate an article
function generateArticleForUser(user: any) {
  return `Hello ${user.firstName} ${user.lastName}, here is your article for today!`;
}
