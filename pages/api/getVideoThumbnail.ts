// import type { NextApiRequest, NextApiResponse } from 'next';
// // import ffmpeg from 'fluent-ffmpeg';
// import path from 'path';
// import fs from 'fs';

// const getThumbnail = async (videoUrl: string): Promise<string> => {
//   return new Promise((resolve, reject) => {
//     // Specify a temporary file path for the thumbnail
//     const thumbnailPath = path.join(process.cwd(), 'public', 'thumbnails', 'thumbnail.jpg');

//     // FFmpeg to capture a frame at 1 second into the video and generate the thumbnail
//     ffmpeg(videoUrl)
//       .screenshots({
//         count: 1,
//         folder: path.dirname(thumbnailPath),
//         filename: 'thumbnail.jpg',
//         timestamps: ['1'], // Take a snapshot at 1 second
//       })
//       .on('end', () => {
//         // When the screenshot process ends, return the thumbnail URL
//         resolve(`/thumbnails/thumbnail.jpg`);
//       })
//       .on('error', (err) => {
//         reject(`Error generating thumbnail: ${err}`);
//       });
//   });
// };

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const { videoUrl } = req.query;

//   if (!videoUrl || typeof videoUrl !== 'string') {
//     return res.status(400).json({ error: 'Video URL is required' });
//   }

//   try {
//     const thumbnailUrl = await getThumbnail(videoUrl);
//     return res.status(200).json({ thumbnailUrl });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// }
