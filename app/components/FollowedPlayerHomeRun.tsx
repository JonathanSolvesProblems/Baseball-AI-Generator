"use client";
import React, { useEffect, useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  calculateSimilarity,
  combinePlayerData,
  extractPlayerName,
  findTopSimilarPlayers,
  getHomeRunOfFollowedPlayer,
  loadCSV,
} from "@/app/utils/helper";
import { PlayerStats } from "@/app/utils/schemas";
import VideoPlayer from "./VideoPlayer";
import { fetchFollowedPlayers } from "../utils/apiPaths";

// TODO: If no followed players, take fan favorite.
// TODO: Can maybe associate homerun with player click?
const FollowedPlayerHomeRun = ({
  followedPlayers,
}: {
  followedPlayers: string[];
}) => {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [homeRunVideos, setHomeRunVideos] = useState<any[]>([]);
  const [videoName, setVideoName] = useState<string>("");
  const [homeRunVideoIndex, setHomeRunVideoIndex] = useState<number>(0);

  useEffect(() => {
    const loadData = async () => {
      const data: any = await loadCSV("/api/getHomeruns");
      setCsvData(data);
    };

    loadData();
  }, []);

  useEffect(() => {
    const getRandomFollowedPlayer = () => {
      if (!followedPlayers.length) return null;

      const randomIndex = Math.floor(Math.random() * followedPlayers.length);
      return followedPlayers[randomIndex];
    };

    const getPlayerDetails = async () => {
      if (!followedPlayers.length || csvData.length === 0) return; // Ensure both followedPlayer and csvData are available

      let foundHomeRunVideos = false;
      let currentHomeRunVideos = [];
      let followedPlayerInfo;

      while (!foundHomeRunVideos && followedPlayers.length > 0) {
        const randomPlayer = getRandomFollowedPlayer();

        if (!randomPlayer) return;

        followedPlayerInfo = await fetchFollowedPlayers(randomPlayer);

        currentHomeRunVideos = getHomeRunOfFollowedPlayer(
          followedPlayerInfo,
          csvData
        );

        if (currentHomeRunVideos.length > 0) {
          foundHomeRunVideos = true;
          setVideoName(`${followedPlayerInfo?.fullName} Homerun`);
          setHomeRunVideos(currentHomeRunVideos);

          const randomIndex = Math.floor(
            Math.random() * currentHomeRunVideos.length
          );
          setHomeRunVideoIndex(randomIndex);
        } else {
          followedPlayers = followedPlayers.filter(
            (player) => player !== randomPlayer
          );
        }
      }
    };

    getPlayerDetails();
  }, [csvData, followedPlayers]);

  return (
    <div className="min-h-screen bg-black-100 flex flex-col justify-center items-center">
      <h1 className="text-4xl font-bold mb-8">{videoName}</h1>

      {homeRunVideos.length > 0 ? (
        <VideoPlayer
          videoSrc={homeRunVideos[homeRunVideoIndex]}
          videoName={videoName || "Homerun"}
          width="800" // Optional: Set width
          height="450" // Optional: Set height
          controls={true} // Optional: Enable controls
          autoplay={false} // Optional: Enable autoplay
          loop={false} // Optional: Enable loop
        />
      ) : (
        <p>No home run videos matched with followed players</p>
      )}
    </div>
  );
};

export default FollowedPlayerHomeRun;

/*
Data Normalization: If you're comparing various statistical features (ExitVelocity, LaunchAngle, etc.), consider normalizing the data before passing it to the AI model (e.g., scaling values to a range from 0 to 1). This helps avoid skewing results when comparing different magnitudes.
Incorporating More Stats: In the future, you can enhance the recommendation system by including additional stats like batting average, home runs, and other advanced metrics that could improve the quality of the similarity results.
Iterative Testing: Experiment with different formats and types of prompts to understand which combinations of attributes work best for the Gemini model.
*/
