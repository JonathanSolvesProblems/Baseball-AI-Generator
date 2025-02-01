"use client";
import React, { useEffect, useState } from "react";
import { getHomeRunOfFollowedPlayer, loadCSV } from "@/app/utils/helper";
import VideoPlayer from "./VideoPlayer";
import { fetchFollowedPlayers } from "../utils/apiPaths";
import i18n from "@/i18n";
import { useTranslation } from "react-i18next";
import { locales } from "@/locales";
import { useUser } from "../context/UserContext";

const FollowedPlayerHomeRun = ({
  followedPlayers,
}: {
  followedPlayers: string[];
}) => {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [homeRunVideos, setHomeRunVideos] = useState<any[]>([]);
  const [videoName, setVideoName] = useState<string>("");
  const [homeRunVideoIndex, setHomeRunVideoIndex] = useState<number>(0);
  const { userDetails } = useUser();
  const { t } = useTranslation();

  useEffect(() => {
    if (userDetails?.language) {
      i18n.changeLanguage(locales[userDetails.language]);
    }
  }, [userDetails?.language]);

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
    // <div className="min-h-screen bg-black-100 flex flex-col justify-center items-center"></div>
    <div>
      {/* <h1 className="text-4xl font-bold mb-8">{videoName}</h1> */}

      {homeRunVideos.length > 0 ? (
        <VideoPlayer
          videoSrc={homeRunVideos[homeRunVideoIndex]}
          videoName={videoName || "Homerun"}
          width="800"
          height="450"
          controls={true}
          autoplay={false}
          loop={true}
        />
      ) : (
        <p>{t("noHomeRunVideoMsg")}</p>
      )}
    </div>
  );
};

export default FollowedPlayerHomeRun;
