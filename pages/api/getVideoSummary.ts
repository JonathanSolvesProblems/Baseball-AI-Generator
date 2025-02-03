import { NextApiRequest, NextApiResponse } from 'next';
import { VertexAI } from '@google-cloud/vertexai';
import { Storage } from '@google-cloud/storage';
import axios from 'axios';
import stream from 'stream';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { videoUrl, language, videoName } = req.query;

    if (!videoUrl || !language || !videoName) {
        return res.status(400).json({ error: 'videoUrl, language, and videoName are required' });
    }

    try {
        const bucketName = 'mlb_hackathon';


        const credentialsBase64 = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

        if (!credentialsBase64) {
          throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable is missing.');
        }
    
        let credentialsJson;
        try {
          const decodedCredentials = Buffer.from(credentialsBase64, 'base64').toString('utf-8');
      
          credentialsJson = JSON.parse(decodedCredentials);
        } catch (error) {
          console.error('Error decoding or parsing credentials:', error);
          throw new Error('Failed to decode or parse credentials.');
        }

        const projectId = credentialsJson.project_id; 

        const storage = new Storage({ projectId });
        const vertexAI = new VertexAI({ project: projectId, location: 'us-central1' });

        if (!(typeof(videoUrl) === 'string')) {
            throw new Error('Ensure the videoUrl is a string');
        }

        // Fetch the video stream using axios
        const response = await axios.get(videoUrl, { responseType: 'stream' });
        if (!response.data) {
            throw new Error('Failed to download video');
        }

        if (typeof(videoName) !== 'string') return;

        const fileName = `${encodeURIComponent(videoName)}/${Date.now()}.mp4`;
        const bucket = storage.bucket(bucketName);
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

        // console.log(`Video uploaded to ${gsUri}`);

        const generativeModel = vertexAI.getGenerativeModel({ model: 'gemini-1.5-flash-001' });

        const filePart = {
            file_data: {
                file_uri: gsUri,
                mime_type: 'video/mp4',
            },
        };

        // The prompt to describe the video
        const textPart = {
            text: `Provide a brief summary in ${language} of what happens in the video and include anything important that is spoken in the video or noteworthy.`,
        };

        const request: any = {
            contents: [{ role: 'user', parts: [filePart, textPart] }],
        };

        try {
            const resp = await generativeModel.generateContent(request);
            res.status(200).send(resp.response);
        } catch (error) {
            console.error('Error generating content:', error);
            res.status(500).json({ error: 'Failed to process the video' });
        }

    } catch (error) {
        console.error('Error in handler:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
