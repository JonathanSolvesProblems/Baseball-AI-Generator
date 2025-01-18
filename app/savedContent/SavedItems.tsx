"use client";

import React, { useState } from "react";
import SavedVideosList from "./SavedVideosList";
import SavedChartsList from "./savedChartsList";

const SavedItems = () => {
  const [activeTab, setActiveTab] = useState("videos");

  return (
    <div className="p-6 bg-base-200 min-h-screen">
      <div className="flex flex-col items-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Your Saved Items
        </h1>
        <div className="tabs tabs-boxed bg-white shadow-lg rounded-lg w-full max-w-xl">
          <button
            className={`tab flex-1 text-lg font-medium transition-all duration-200 ${
              activeTab === "videos"
                ? "tab-active bg-primary text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab("videos")}
          >
            Videos
          </button>
          <button
            className={`tab flex-1 text-lg font-medium transition-all duration-200 ${
              activeTab === "charts"
                ? "tab-active bg-primary text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab("charts")}
          >
            Charts
          </button>
        </div>
      </div>
      <div className="mt-8">
        {activeTab === "videos" && <SavedVideosList />}
        {activeTab === "charts" && <SavedChartsList />}
      </div>
    </div>
  );
};

export default SavedItems;
