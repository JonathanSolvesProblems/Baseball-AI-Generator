import { getSingleGamePlayId } from '@/app/utils/apiPaths';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const gamePlayId = await getSingleGamePlayId();
    const url = `https://www.mlb.com/video/search?q=playid=\"${gamePlayId}\"`;
  
    try {
        const response = await fetch(url);

        // If the response is not okay, throw an error
        if (!response.ok) {
            console.error('Failed to fetch data:', response.status);  // Log the error
            res.status(response.status).json({ error: 'Failed to fetch data' });
            return;
        }

        const data = await response.text();

        console.log('hitting ' + data);

        // Return the CSV data to the client
        res.status(200).send(data);
    } catch (error) {
        console.error('Error during API call:', error);  // Log the error
        res.status(500).json({ error: 'Server error while fetching data' });
    }
}
