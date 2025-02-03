import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import stream from 'stream';
import { Storage } from '@google-cloud/storage';
import { getGeminiKey, getVertexProjectId } from '@/app/utils/geminiCalls';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { videoUrl, language, videoName } = req.query;

    if (!videoUrl || !language || !videoName) {
        return res.status(400).json({ error: 'videoUrl, language, and videoName are required' });
    }

    if (!videoUrl || typeof(videoUrl) !== "string") {
        return res.status(400).json({ error: 'videoUrl is required' });
    }

    try {
        const bucketName = 'mlb_hackathon';

        const apiKey = getGeminiKey();

        if (!apiKey) {
          throw new Error('API key is missing');
        }

        const projectId = getVertexProjectId();

        const storage = new Storage({ projectId });
        const bucket = storage.bucket(bucketName);

        const response = await axios.get(videoUrl, { responseType: 'stream' });
        if (!response.data) {
            throw new Error('Failed to download video');
        }

        if (typeof videoName !== 'string') return;

        const fileName = `${encodeURIComponent(videoName)}/${Date.now()}.mp4`;
        const file = bucket.file(fileName);

        // Create a PassThrough stream to pipe the video data
        const passthroughStream = new stream.PassThrough();
        response.data.pipe(passthroughStream);

        // Upload the video to GCS via stream
        await new Promise((resolve, reject) => {
          passthroughStream.pipe(file.createWriteStream())
            .on('finish', resolve)
            .on('error', reject);
        });

        const gsUri = `gs://${bucketName}/${file.name}`;

        const apiUrl = 'https://generativelanguage.googleapis.com/v1beta3/models/gemini-1.5-flash-001:generateContent';

        const requestPayload = {
            contents: [{
                role: 'user',
                parts: [
                    {
                        file_data: {
                            file_uri: gsUri,
                            mime_type: 'video/mp4',
                        }
                    },
                    {
                        text: `Provide a brief summary in ${language} of what happens in the video and include anything important that is spoken in the video or noteworthy.`
                    }
                ]
            }]
        };

        const responseFromAI = await axios.post(apiUrl, requestPayload, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        res.status(200).json(responseFromAI.data); 
    } catch (error) {
        console.error('Error in handler:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
