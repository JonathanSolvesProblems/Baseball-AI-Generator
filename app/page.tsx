"use client";

import { useState } from "react";
import Header from "./components/Header";
import FollowedPlayerHomeRun from "./components/FollowedPlayerHomeRun";
import { useUser } from "./context/UserContext";
import GraphGenerator from "./components/GraphGenerator";
import ArticleGenerator from "./components/ArticleGenerator";
import ImageGenerator from "./components/ImageGenerator";

export default function Home() {
  const { userId, followedPlayers } = useUser();
  const [activeTab, setActiveTab] = useState("recommendedVideos");

  const renderComponent = () => {
    switch (activeTab) {
      case "recommendedVideos":
        return userId && followedPlayers ? (
          <FollowedPlayerHomeRun followedPlayers={followedPlayers} />
        ) : null;
      // case "recommendedArticle":
      //   return <ArticleGenerator />;
      case "generateGraphs":
        return <GraphGenerator />;
      case "imageGenerator":
        return <ImageGenerator />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] text-gray-200">
      <Header />
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-60 p-4 bg-[#0a0a0a] text-white shadow-xl border-r border-gray-700">
          <ul className="space-y-4">
            <li>
              <button
                onClick={() => setActiveTab("recommendedVideos")}
                className={`w-full p-3 text-left rounded-lg transition-colors duration-300 ${
                  activeTab === "recommendedVideos"
                    ? "bg-blue-600"
                    : "hover:bg-gray-800"
                }`}
              >
                Your Recommended Video
              </button>
            </li>
            {/* <li>
              <button
                onClick={() => setActiveTab("recommendedArticle")}
                className={`w-full p-3 text-left rounded-lg transition-colors duration-300 ${
                  activeTab === "recommendedArticle"
                    ? "bg-blue-600"
                    : "hover:bg-gray-800"
                }`}
              >
                Your Recommended Article
              </button>
            </li> */}
            <li>
              <button
                onClick={() => setActiveTab("generateGraphs")}
                className={`w-full p-3 text-left rounded-lg transition-colors duration-300 ${
                  activeTab === "generateGraphs"
                    ? "bg-blue-600"
                    : "hover:bg-gray-800"
                }`}
              >
                Generate Graphs
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("imageGenerator")}
                className={`w-full p-3 text-left rounded-lg transition-colors duration-300 ${
                  activeTab === "imageGenerator"
                    ? "bg-blue-600"
                    : "hover:bg-gray-800"
                }`}
              >
                Image Generator
              </button>
            </li>
          </ul>
        </div>
        {/* Main Content */}
        <div className="flex-1 p-6 bg-[#121212] rounded-tr-xl">
          {renderComponent()}
        </div>
      </div>
    </div>
  );
}
