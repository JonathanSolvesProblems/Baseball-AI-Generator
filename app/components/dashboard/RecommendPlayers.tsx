"use client";
import React, { useEffect, useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  combinePlayerData,
  findTopSimilarPlayers,
  loadCSV,
} from "@/app/utils/helper";
import { fetchFollowedPlayers } from "@/app/utils/apiPaths";

const RecommendPlayers = ({
  userId,
  followedPlayer,
}: {
  userId: string;
  followedPlayer: string;
}) => {
  const [recommendedPlayers, setRecommendedPlayers] = useState<any>();
  const [enrichedPlayerDetails, setEnrichedPlayerDetails] = useState<any>();
  const [csvData, setCsvData] = useState<any[]>([]);
  // https://nextjs.org/docs/pages/building-your-application/routing/api-routes
  // https://medium.com/@turingvang/nextjs-api-call-b4a8ac63bce9#:~:text=NEXTJS%20API%20Calls-,Next.,%2C%20getStaticProps%20%2C%20and%20API%20routes.

  useEffect(() => {
    const loadData = async () => {
      const data: any = await loadCSV("/api/getHomeruns");
      setCsvData(data);
    };

    loadData();
  }, []);

  useEffect(() => {
    const getEnrichedPlayerDetails = async () => {
      if (!followedPlayer || csvData.length === 0) return; // Ensure both followedPlayer and csvData are available

      const followedPlayerDetails = await fetchFollowedPlayers(followedPlayer);
      const enrichedPlayerData = combinePlayerData(
        followedPlayerDetails,
        csvData
      );

      setEnrichedPlayerDetails(enrichedPlayerData);
      // console.log(JSON.stringify(enrichedPlayerData));
    };

    getEnrichedPlayerDetails();
  }, [csvData, followedPlayer]);

  // https://ai.google.dev/gemini-api/docs/structured-output?_gl=1*1emyzwi*_up*MQ..*_ga*MTUwNTE1MDE0My4xNzM1NDk4MTM4*_ga_P1DBVKWT6V*MTczNTQ5ODEzNy4xLjAuMTczNTQ5ODE5OC4wLjAuMTcyNDYzMjAxMg..&lang=node
  // https://cloud.google.com/secret-manager/docs
  useEffect(() => {
    const recommendSimilarPlayer = async () => {
      if (!enrichedPlayerDetails) return;

      const topSimilarPlayers = findTopSimilarPlayers(
        enrichedPlayerDetails,
        csvData
      );

      const similarPlayersList = topSimilarPlayers
        .map((player: any) => {
          return `Player: ${player.name}\nAvg Exit Velocity: ${player.exitVelocityAvg}\nAvg Hit Distance: ${player.hitDistanceAvg}\nAvg Launch Angle: ${player.launchAngleAvg}\n`;
        })
        .join("\n");

      // console.log(similarPlayersList);
    };

    // console.log(recommendSimilarPlayer);
  }, []);

  return <></>;

  /*

      const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

      if (!GEMINI_API_KEY) throw new Error("no gemini API key");

      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
      });

      const prompt = `List similar baseball players based on the following attributes:
    
                Followed Player Details:
                Name: ${enrichedPlayerDetails.name}
                Avg Exit Velocity: ${enrichedPlayerDetails.exitVelocityAvg}
                Avg Hit Distance: ${enrichedPlayerDetails.hitDistanceAvg}
                Avg Launch Angle: ${enrichedPlayerDetails.launchAngleAvg}
                
                Compare players based on these attributes and return a list of players with similar profiles.
                
                Based on the similarity, the following players are considered most similar to ${enrichedPlayerDetails.name}:
                
                ${similarPlayersList}
                
                Just output the details of similar players.`;

      const result = await model.generateContent(prompt);
      if (result.response && result.response.candidates) {
        const outputText = result.response.candidates[0].content.parts[0].text;

        setRecommendedPlayers(outputText);
      } else {
        console.log("Did not set recommended players");
      }
    };

    recommendSimilarPlayer();
  }, [enrichedPlayerDetails]);

  // console.log(JSON.stringify(csvData));

  if (!followedPlayer)
    return (
      <>
        <h1>No followed players</h1>
      </>
    );

    $"To find similar baseball players to Andy Pages, we need more data than just his profile. The provided data only gives us his physical characteristics, position, and handedness. To find truly similar players, we'd need to consider his:\n\n* **Offensive Statistics:** Batting average, on-base percentage (OBP), slugging percentage (SLG), OPS, home run totals, stolen bases, etc. These are crucial for comparing offensive production.\n* **Defensive Statistics:** Fielding percentage, assists, errors, range factor (for outfielders). This helps assess defensive ability.\n* **Playing Style:** Is he a power hitter, a speedster, a contact hitter, a high-average hitter? This qualitative information is important for comparison.\n* **Minor League Performance:** A player's minor league stats often predict their major league performance.\n\nWithout access to this statistical data, I cannot provide a list of similar players. To get this information, you would need to access a comprehensive baseball statistics database such as Baseball-Reference, Fangraphs, or MLB.com's stats section. Even then, finding \"similar\" players is subjective and depends on the weighting you give to different statistics. Different algorithms and methodologies would yield different results.\n"
  

  return (
    <>{recommendedPlayers && <p>{JSON.stringify(recommendedPlayers)}</p>}</>
  );
};

  */
};

export default RecommendPlayers;
