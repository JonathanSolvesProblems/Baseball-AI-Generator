"use client";
import {
  getLoggedInUserDetails,
  getSavedVideos,
  updateVideo,
} from "@/firebase";
import React, { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { convertTimestampToDate } from "../utils/helper";
import { analyzeVideoWithAudio } from "../utils/geminiCalls";

// Can add duration later on.
const SavedVideosList = () => {
  const { userId, savedVideos, setSavedVideos } = useUser();
  const [isGeneratingSummaryFor, setIsGeneratingSummaryFor] = useState<
    string | null
  >(null);

  // Sort the savedVideos array by savedDate in descending order (most recent first)
  const sortedVideos = [...savedVideos].sort((a, b) => {
    // Ensure savedDate is a Firestore Timestamp and compare the seconds
    return b.savedDate.seconds - a.savedDate.seconds; // Use seconds for sorting
  });

  const generateSummary = async (video: any) => {
    if (!userId) return;

    try {
      const userDetails: any = await getLoggedInUserDetails(userId);

      setIsGeneratingSummaryFor(video.videoUrl);

      const newSummary = await analyzeVideoWithAudio(
        video.videoUrl,
        video.videoName,
        userDetails.language
      );

      if (!newSummary) {
        throw new Error("There was an error generating the summary");
      }

      const updatedVideoSummary = {
        ...video.videoSummary, // Preserve existing summaries
        [userDetails.language]: newSummary, // Add or update the summary for the specific language
      };

      await updateVideo(userId, video.id, {
        videoName: video.videoName,
        videoURL: video.videoUrl,
        videoSummary: updatedVideoSummary, // Use the updated summaries
      });

      // setSavedVideos((prevVideos: any[]) =>
      //   prevVideos.map((v) => (v.id === video.id ? newSummary : v))
      // );
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingSummaryFor(null);
    }
  };

  if (!userId) {
    return (
      <div className="p-6">
        <h1 className="text-4xl font-semibold text-center mb-6">
          Saved Videos
        </h1>
        <p className="text-center text-gray-600">
          Please log in to view your saved videos.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-4xl font-semibold text-center mb-6">Saved Videos</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedVideos.map((video, index) => (
          <div
            key={index}
            className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300"
          >
            <figure className="p-4">
              {/* Optional: You can add a thumbnail image here if available */}
              {/* <img
                src="https://via.placeholder.com/300"
                alt={video.videoName}
                className="rounded-lg"
              /> */}
            </figure>
            <div className="card-body p-4">
              <h2 className="card-title text-xl font-bold text-gray-800">
                {video.videoName}
              </h2>

              <p className="text-sm text-gray-500">
                Saved on:{" "}
                {convertTimestampToDate(video.savedDate.toString()).toString()}
              </p>

              <p className="text-sm text-gray-700 mt-2">
                {video.videoSummary ||
                  "No summary available in your preferred language"}
              </p>

              <div className="card-actions justify-end mt-4">
                {!video.videoSummary && (
                  <button
                    disabled={isGeneratingSummaryFor === video.videoUrl}
                    onClick={() => generateSummary(video)}
                    className="btn btn-primary bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg"
                  >
                    {isGeneratingSummaryFor === video.videoUrl
                      ? "Generating..."
                      : "Generate One?"}
                  </button>
                )}

                <a
                  href={video.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg"
                >
                  Watch Video
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedVideosList;
