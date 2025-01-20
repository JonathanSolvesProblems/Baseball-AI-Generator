import { getVertexProjectId } from '@/app/utils/geminiCalls';
import { JWT } from 'google-auth-library';
import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

const getAccessToken = async (): Promise<string> => {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'); // Replace escaped newlines
  
    // Check if required environment variables are available
    if (!clientEmail || !privateKey) {
      throw new Error(
        `Missing required environment variables: ${
          !clientEmail ? 'NEXT_PUBLIC_GOOGLE_CLIENT_EMAIL' : ''
        } ${!privateKey ? 'GOOGLE_PRIVATE_KEY' : ''}`
      );
    }
  
    // Validate private key format
    if (!privateKey.startsWith('-----BEGIN PRIVATE KEY-----') || !privateKey.endsWith('-----END PRIVATE KEY-----')) {
      console.error('Invalid private key format');
      throw new Error('Invalid private key format');
    }
  
    console.log('Environment variables loaded successfully');
  
    // Construct the JWT payload
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    const payload = {
      iss: clientEmail, // The service account email
      scope: 'https://www.googleapis.com/auth/cloud-platform', // Scope for access
      aud: 'https://oauth2.googleapis.com/token', // Audience URL
      iat: now - 10, // Issued 10 seconds in the past to account for clock skew
      exp: now + 3600, // Expires in 1 hour
    };
  
    console.log('JWT payload:', payload);
  
    // Sign the JWT
    try {
      const signedJwt = jwt.sign(payload, privateKey, { algorithm: 'RS256' });
      console.log('Signed JWT created successfully');
  
      // Exchange the signed JWT for an access token
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: signedJwt,
        }).toString(),
      });
  
      if (!response.ok) {
        const errorResponse = await response.json();
        console.error('Failed to fetch access token:', errorResponse);
  
        // Provide detailed error message for debugging
        if (errorResponse.error === 'invalid_grant') {
          throw new Error(
            `Invalid JWT Signature: Check the private key, claims, and service account permissions. Details: ${JSON.stringify(
              errorResponse
            )}`
          );
        }
  
        throw new Error(`Failed to fetch access token: ${JSON.stringify(errorResponse)}`);
      }
  
      const { access_token } = await response.json();
      console.log('Access token retrieved successfully:', access_token);
  
      return access_token;
    } catch (error) {
      console.error('Error signing JWT or fetching access token:', error);
      throw error;
    }
  };
  
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  console.log('hit1');

  const { prompt, sampleCount } = req.body;

  console.log(prompt);
  console.log(sampleCount);

  if (!prompt || !sampleCount) {
    res.status(400).json({ error: 'Missing required fields: prompt or sampleCount' });
    return;
  }

  console.log('hit2');
  const location = 'us-central1';
  const modelVersion = 'imagen-3.0-generate-001';
  const apiUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${process.env.GOOGLE_PROJECT_ID}/locations/${location}/publishers/google/models/${modelVersion}:predict`;

  try {
    const accessToken = await getAccessToken();
    console.log('hit3');
    const requestPayload = {
        instances: [{ prompt }],
        parameters: { sampleCount },
      };

      console.log('Request Payload:', requestPayload);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      console.error('Error response from API:', errorResponse);
      res.status(response.status).json({ error: errorResponse });
      return;
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error during API call:', error);
    res.status(500).json({ error: 'Server error while generating the image' });
  }
}
