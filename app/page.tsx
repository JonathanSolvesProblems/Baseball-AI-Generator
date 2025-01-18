"use client";
import { useEffect, useState } from "react";
import Dashboard from "./components/dashboard/Dashboard";
import Header from "./components/Header";
import VideoPlayer from "./components/VideoPlayer";
import {
  getCaptionData,
  getMLBLeagues,
  getPlayerHeadshot,
  getSingleGamePlayVideo,
} from "./utils/apiPaths";
import FollowedPlayerHomeRun from "./components/FollowedPlayerHomeRun";
import { onAuthStateChanged } from "firebase/auth";
import { auth, followPlayer, getFollowedPlayers } from "@/firebase";
import { getAnswerFromGemini } from "./utils/geminiCalls";
import { useUser } from "./context/UserContext";
import GraphGenerator from "./components/GraphGenerator";
import { getBigQueryTablesAndSchemas } from "./utils/bigQuery";
import ArticleGenerator from "./components/ArticleGenerator";

/*
After getting the full season schedule, we can pick 1 game (via "gamePk") to pull detailed data for, as is done below (we default to the last game in the result above).
*/
export default function Home() {
  const { userId, followedPlayers, playerDetails, loading, savedVideos } =
    useUser();
  // useEffect(() => {
  //   // getAnswerFromGemini('How many homeruns did Andy Pages get?');
  //   const test = async () => {
  //     const result = await getSingleGamePlayVideo();
  //     console.log(result);
  //   };

  //   test();
  // }, []);

  useEffect(() => {
    const test = async () => {
      const data2 = await getBigQueryTablesAndSchemas();
      // console.log("xxx " + JSON.stringify(data2));
    };

    test();
  }, []);

  return (
    <>
      <Header />
      <ArticleGenerator />
      {userId && followedPlayers && (
        <FollowedPlayerHomeRun followedPlayers={followedPlayers} />
      )}
      <Dashboard />
      <GraphGenerator />
    </>
  );
}

// TODO: Hardcoded for now until AI is implemented
// const baseballVideo = "https://www.youtube.com/watch?v=JjoAFfeIJ_I&ab_channel=BaseballHighlightsReel";

// TODO: You have access to fan favorites in database, can use that for non-logged in users as starting point.
