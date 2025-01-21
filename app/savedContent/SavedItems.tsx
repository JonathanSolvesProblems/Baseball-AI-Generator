"use client";

import React, { useState } from "react";
import SavedVideosList from "./SavedVideosList";
import SavedChartsList from "./savedChartsList";
import SavedArticlesList from "./SavedArticlesList";

const SavedItems = () => {
  const [activeTab, setActiveTab] = useState("videos");

  return (
    <div className="p-6 bg-[#0a0a0a] min-h-screen text-gray-200">
      <div className="flex flex-col items-center">
        <h1 className="text-3xl font-bold text-gray-100 mb-6">
          Your Saved Items
        </h1>
        <div className="tabs tabs-boxed bg-gray-800 shadow-lg rounded-lg w-full max-w-xl">
          <button
            className={`tab flex-1 text-lg font-medium transition-all duration-200 ${
              activeTab === "videos"
                ? "tab-active bg-primary text-black"
                : "text-gray-400 hover:text-gray-200"
            }`}
            onClick={() => setActiveTab("videos")}
          >
            Videos
          </button>
          <button
            className={`tab flex-1 text-lg font-medium transition-all duration-200 ${
              activeTab === "charts"
                ? "tab-active bg-primary text-black"
                : "text-gray-400 hover:text-gray-200"
            }`}
            onClick={() => setActiveTab("charts")}
          >
            Charts
          </button>
          <button
            className={`tab flex-1 text-lg font-medium transition-all duration-200 ${
              activeTab === "articles"
                ? "tab-active bg-primary text-black"
                : "text-gray-400 hover:text-gray-200"
            }`}
            onClick={() => setActiveTab("articles")}
          >
            Articles
          </button>
        </div>
      </div>
      <div className="mt-8">
        {activeTab === "videos" && <SavedVideosList />}
        {activeTab === "charts" && <SavedChartsList />}
        {activeTab === "articles" && <SavedArticlesList />}
      </div>
    </div>
  );
};

export default SavedItems;
