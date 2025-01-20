import { google } from 'googleapis';
import { NextApiRequest, NextApiResponse } from 'next';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID, // Add your client ID here
  process.env.GOOGLE_CLIENT_SECRET, // Add your client secret here
  'YOUR_REDIRECT_URL' // The URL where the user is redirected after authentication
);

const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).send({ error: 'Only POST requests are allowed' });
  }

  const { subject, text, to } = req.body;

  if (!subject || !text || !to) {
    return res.status(400).send({ error: 'Subject, text, and recipient email are required.' });
  }

  try {
    // Create email message
    const message = `From: "your-email@gmail.com"
    To: ${to}
    Subject: ${subject}

    ${text}`;

    const encodedMessage = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    res.status(200).json({ message: 'Email sent successfully!', response });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send({ error: 'Failed to send email' });
  }
}
