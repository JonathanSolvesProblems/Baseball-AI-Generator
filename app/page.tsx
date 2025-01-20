"use client";
import { useEffect, useState } from "react";
import Dashboard from "./components/dashboard/Dashboard";
import Header from "./components/Header";
import FollowedPlayerHomeRun from "./components/FollowedPlayerHomeRun";
import { useUser } from "./context/UserContext";
import GraphGenerator from "./components/GraphGenerator";
import { getBigQueryTablesAndSchemas } from "./utils/bigQuery";
import ArticleGenerator from "./components/ArticleGenerator";
import ImageGenerator from "./components/ImageGenerator";

/*
After getting the full season schedule, we can pick 1 game (via "gamePk") to pull detailed data for, as is done below (we default to the last game in the result above).
*/
export default function Home() {
  const { userId, followedPlayers } = useUser();
  const [activeTab, setActiveTab] = useState("recommendedVideos");

  const renderComponent = () => {
    switch (activeTab) {
      case "recommendedVideos":
        return userId && followedPlayers ? (
          <FollowedPlayerHomeRun followedPlayers={followedPlayers} />
        ) : null;
      case "recommendedArticle":
        // <ArticleGenerator />;
        return <> </>;
      case "generateGraphs":
        return <GraphGenerator />;
      case "imageGenerator":
        return <ImageGenerator />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1">
        <div className="w-60 p-4 bg-black text-white rounded-l-xl shadow-lg">
          <ul className="space-y-4">
            <li>
              <button
                onClick={() => setActiveTab("recommendedVideos")}
                className={`w-full p-3 text-left rounded-lg transition-colors duration-300 hover:bg-blue-600 ${
                  activeTab === "recommendedVideos" ? "bg-blue-500" : ""
                }`}
              >
                Your Recommended Video
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("recommendedArticle")}
                className={`w-full p-3 text-left rounded-lg transition-colors duration-300 hover:bg-blue-600 ${
                  activeTab === "recommendedArticle" ? "bg-blue-500" : ""
                }`}
              >
                Your Recommended Article
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("generateGraphs")}
                className={`w-full p-3 text-left rounded-lg transition-colors duration-300 hover:bg-blue-600 ${
                  activeTab === "generateGraphs" ? "bg-blue-500" : ""
                }`}
              >
                Generate Graphs
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("imageGenerator")}
                className={`w-full p-3 text-left rounded-lg transition-colors duration-300 hover:bg-blue-600 ${
                  activeTab === "imageGenerator" ? "bg-blue-500" : ""
                }`}
              >
                Image Generator
              </button>
            </li>
          </ul>
        </div>
        <div className="flex-1 p-6">{renderComponent()}</div>
      </div>
    </div>
  );
}

// TODO: Hardcoded for now until AI is implemented
// const baseballVideo = "https://www.youtube.com/watch?v=JjoAFfeIJ_I&ab_channel=BaseballHighlightsReel";

// TODO: You have access to fan favorites in database, can use that for non-logged in users as starting point.
