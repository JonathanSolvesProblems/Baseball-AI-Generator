import { NextApiRequest, NextApiResponse } from 'next';
import { VertexAI } from '@google-cloud/vertexai';
import { getVertexProjectId } from '@/app/utils/geminiCalls';
import { Storage } from '@google-cloud/storage';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { videoUrl, language, videoName } = req.query;

    // console.log('videoUrl', videoUrl);
    // console.log('language', language);
    // console.log('videoName', videoName);

    if (!videoUrl || !language || !videoName) {
        return res.status(400).json({ error: 'videoUrl is required' });
    }

    try {
        const projectId = getVertexProjectId();
        const bucketName = 'mlb_hackathon';
        const storage = new Storage({ projectId });
        const vertexAI = new VertexAI({ project: projectId, location: 'us-central1' });

        if (!(typeof(videoUrl) === 'string')) {
          throw new Error('Ensure the videoUrl is a string');
        }

        const response = await axios.get(videoUrl, { responseType: 'stream' });
        if (!response.data) {
          throw new Error('Failed to download video');
        }
        const fileName = `${videoName}/${Date.now()}.mp4`;
        const bucket = storage.bucket(bucketName);
        const file = bucket.file(fileName);

        await file.save(response.data);
      //  console.log(`Video uploaded to gs://${bucketName}/${fileName}`);
        const gsUri = `gs://${bucketName}/${file}`;

        const generativeModel = vertexAI.getGenerativeModel({ model: 'gemini-1.5-flash-001' });

        const filePart = {
          file_data: {
            file_uri: gsUri,
            mime_type: 'video/mp4',
          },
        };

      // The prompt to describe the video
      const textPart = {
        text: "Provide a brief summary in " + language + " of what happens in the video and include anything important that is spoken in the video or noteworthy."
      };

        const request: any = {
          contents: [{role: 'user', parts: [filePart, textPart]}],
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
