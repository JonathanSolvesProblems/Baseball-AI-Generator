import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const mlbCaptionsBaseUrl = 'https://storage.googleapis.com/gcp-mlb-hackathon-2025/datasets/mlb-caption-data/mlb-captions-data-*.json';
    const allDfs: any[] = [];
    let i: number = 0;

    const loadNewlineDelimitedJson = async (url: string): Promise<any> => {

        const response = await fetch(url);

        const data = await response.text();

        return data;
    }

    // Loop over files labeled "...00" to "...12"
    for (i = 0; i < 12; i++) {

        try {
            const thisUrl = mlbCaptionsBaseUrl.replace("*", i.toString().padStart(12, '0'));
            // console.log('processing query ' + thisUrl);
            const thisDf = await loadNewlineDelimitedJson(thisUrl);

            if (thisDf) {
                allDfs.push(thisDf);
            }
        } catch {
            // do nothing and continue as normal
        }
    }

    res.status(200).send(allDfs);
}
