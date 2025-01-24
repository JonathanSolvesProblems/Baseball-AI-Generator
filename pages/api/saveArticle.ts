import { db } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Ensure this endpoint only supports POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed. Use POST instead.' });
  }

  const { userId, article, articleTitle } = req.body;

  // Validate required parameters
  if (!userId || !article || !articleTitle) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const articleSummary = article.substring(0, 200) + '...'; // Generate a summary preview

  try {
    // Save the article in Firestore under the user's savedArticles collection
    await addDoc(collection(db, 'users', userId, 'savedArticles'), {
      articleTitle,
      articleContent: article,
      savedDate: new Date(),
      articleSummary,
    });

    res.status(200).json({ message: 'Article saved successfully!' });
  } catch (error) {
    console.error('Error saving article:', error);
    res.status(500).json({ error: 'Failed to save article' });
  }
}
