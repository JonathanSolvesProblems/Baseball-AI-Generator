import Papa from 'papaparse';
import { PlayerStats } from './schemas';
import jsPDF from "jspdf";

const parseCSV = (csvData: any) => {
    return new Promise((resolve, reject) => {
        Papa.parse(csvData, {
            complete: (result: any) => resolve(result.data),
            header: true,
            skipEmptyLines: true,
        });
    });
};

const loadCSV = async (csvPath: string) => {
    const res = await fetch(csvPath);
    const text = await res.text();
    const parsedData = await parseCSV(text);

    return parsedData;
}

const calculateSimilarity = (playerA: PlayerStats, playerB: PlayerStats) => {
    const { exitVelocityAvg: evA, hitDistanceAvg: hdA, launchAngleAvg: laA } = playerA;
    const { exitVelocityAvg: evB, hitDistanceAvg: hdB, launchAngleAvg: laB } = playerB;

    // euclidean distance formula
    const distance = Math.sqrt(
        Math.pow(evA - evB, 2) +
        Math.pow(hdA - hdB, 2) +
        Math.pow(laA - laB, 2)
    );

    return distance;
};

const getPlayerStatsList: any = (csvData: any) => {
    return csvData.map((play: any) => {
        const fullName = extractPlayerName(play.title); // Extract full name from title
        if (!fullName) return null; // Skip if full name couldn't be extracted

        return {
            fullName: fullName, // Add fullName to player data
            ...combinePlayerData({ fullName }, csvData), // Get stats for the player
        };
    }).filter((player: any) => player !== null); // Remove any null entries (in case full name extraction failed)
};

const findTopSimilarPlayers = (enrichedPlayerDetails: any, csvData: any, topN = 5) => {

    const playerStatsList = getPlayerStatsList(csvData);

    const filteredPlayerStats = playerStatsList.filter((player: any) => player.fullName !== enrichedPlayerDetails.name);

    const similarScores = filteredPlayerStats.map((player: any) => {
        return {
            player: player,
            similarity: calculateSimilarity(enrichedPlayerDetails, player),
        };
    });

    similarScores.sort((a: any, b: any) => a.similarity - b.similarity);

    return similarScores.slice(0, topN).map((item: any) => item.player);
}

// used to extract the player name from the home runs CSV
const extractPlayerName = (title: string) => {
    const match = title.match(/([A-Za-z\s]+) homers/);
    return match ? match[1].trim() : null;
};

const calculateAverage = (values: number[]) => {
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, value) => acc + value, 0);
    return sum / values.length;
};

/*
Player stats: Batting Average, Home Runs, On-base Percentage (OBP), Slugging Percentage (SLG), OPS, etc.
Position: Include whether the player is an outfielder, infielder, etc.
Handedness: Left-handed or Right-handed (useful for comparisons based on splits).
*/
const combinePlayerData = (playerDetails: any, csvData: any) => {

    const playerPlays = csvData.filter((play: any) => play.title.startsWith(playerDetails.fullName));

    const playerStats = {
        name: playerDetails.fullName,
        // position: playerDetails.primaryPositin.abbreviation,
        // handedness: playerDetails.batSide,
        exitVelocityAvg: calculateAverage(playerPlays.map((play: any) => parseFloat(play.ExitVelocity))),
        hitDistanceAvg: calculateAverage(playerPlays.map((play: any) => parseFloat(play.HitDistance))),
        launchAngleAvg: calculateAverage(playerPlays.map((play: any) => parseFloat(play.LaunchAngle))),
    };

    return playerStats;
}

const getHomeRunOfFollowedPlayer = (playerDetails: any, csvData: any) => {

    const playerPlays = csvData.filter((play: any) => play.title.startsWith(playerDetails.fullName));
    const homeRunVideos = playerPlays.map((play: any) => play.video);
    return homeRunVideos;
}

const convertTimestampToDate = (timeStamp: string): Date => {
    const regex = /seconds=(\d+), nanoseconds=(\d+)/;
    const match = timeStamp.match(regex);

    if (!match) throw new Error('No date defined');

    const seconds = parseInt(match[1], 10);
    const nonoseconds = parseInt(match[2], 10);

    const milliseconds = seconds * 1000 + nonoseconds / 1000000;

    const date = new Date(milliseconds);

    return date;
}



const parseSQL = (text: string): string => {
    // Remove formatting, "SQL Query:", and ensure proper spacing
    return text
      .replace(/^SQL Query:\s*/i, "") // Remove "SQL Query:" if it exists at the beginning
      .replace(/```sql|```/g, "") // Remove code block markers
      .replace(/\n/g, " ") // Replace newlines with a space
      .replace(/\s+/g, " ") // Ensure single spaces
      .replace(/^.*?SELECT/i, "SELECT") // Remove everything before the first "SELECT"
      .replace(/;.*$/, "") // Remove everything after the first semicolon
      .trim(); // Remove leading/trailing spaces
  };

const downloadPDF = (article: string, articleName: string) => {
    const doc = new jsPDF();
    doc.setFontSize(12);

    // Set title to the first line of the article
    const articleLines = article.split("\n");
    const title = articleLines[0] || "Personalized Article"; // Default title if no article

    // Add the title as the header of the PDF
    doc.setFontSize(16);
    doc.text(title, 10, 10);

    // Set the content of the article and ensure it fits within the page
    doc.setFontSize(12);
    doc.text(article, 10, 20, { maxWidth: 180 }); // Adjust maxWidth to fit text

    doc.save(`${articleName}.pdf`);
};

// Function to check if a string is a valid URL
const isValidUrl = (str: string) => {
  const pattern = /^(https?:\/\/[^\s$.?#].[^\s]*)$/;
  return pattern.test(str);
};

export { isValidUrl, downloadPDF, parseSQL, parseCSV, loadCSV, calculateSimilarity, extractPlayerName, combinePlayerData, findTopSimilarPlayers, getHomeRunOfFollowedPlayer, convertTimestampToDate }
