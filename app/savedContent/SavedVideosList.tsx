"use client";
import {
  deleteVideo,
  getLoggedInUserDetails,
  getSavedVideos,
  updateVideo,
} from "@/firebase";
import React, { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { convertTimestampToDate } from "../utils/helper";
import { analyzeVideoWithAudio } from "../utils/geminiCalls";
import i18n from "@/i18n";
import { useTranslation } from "react-i18next";
import { locales } from "@/locales";
import CloseIcon from "@mui/icons-material/Close";

// Can add duration later on.
const SavedVideosList = () => {
  const { userId, savedVideos, userDetails } = useUser();
  const [isGeneratingSummaryFor, setIsGeneratingSummaryFor] = useState<
    string | null
  >(null);
  const { t } = useTranslation();
  const [sortedVideos, setSortedVideos] = useState<any[]>();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (savedVideos.length === 0) {
      setIsLoading(true);
    }
  }, [savedVideos]);

  useEffect(() => {
    if (userDetails?.language) {
      i18n.changeLanguage(locales[userDetails.language]);
    }
  }, [userDetails?.language]);

  useEffect(() => {
    if (!userId) return;

    const fetchVideos = async () => {
      setIsLoading(true);
      try {
        const userDetails: any = await getLoggedInUserDetails(userId);

        if (!savedVideos || savedVideos.length === 0) {
          await getSavedVideos(userId, userDetails.language);
        }

        const sortedVideos = [...savedVideos].sort(
          (a, b) => b.savedDate.seconds - a.savedDate.seconds
        );
        setSortedVideos(sortedVideos);
      } catch (error) {
        console.error("Error fetching videos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, [userId, savedVideos]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl text-gray-500">{t("loadingVideos")}</p>
      </div>
    );
  }

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
        setError(
          "There was an error generating the summary. Please try again later."
        );
      }

      const updatedVideoSummary = {
        ...video.videoSummary,
        [userDetails.language]: newSummary,
      };

      await updateVideo(userId, video.id, {
        videoName: video.videoName,
        videoURL: video.videoUrl,
        videoSummary: updatedVideoSummary,
      });

      setSortedVideos((prevVideos: any) =>
        prevVideos.map((v: any) =>
          v.videoUrl === video.videoUrl
            ? { ...v, videoSummary: updatedVideoSummary }
            : v
        )
      );
    } catch (error) {
      console.error(error);
      setError(
        "There was an error generating the summary. Please try again later."
      );
    } finally {
      setIsGeneratingSummaryFor(null);
    }
  };

  const removeVideo = async (userId: string, videoURL: string) => {
    try {
      setSortedVideos((prevVideos: any) =>
        prevVideos.filter((video: any) => video.videoUrl !== videoURL)
      );

      await deleteVideo(userId, videoURL);
    } catch (error) {
      console.error("Error deleting video:", error);
    }
  };

  if (!userId) {
    return (
      <div className="p-6">
        <h1 className="text-4xl font-semibold text-center mb-6">
          {t("savedVideos")}
        </h1>
        <p className="text-center text-gray-600">{t("savedVideosLoginMsg")}</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#0a0a0a] min-h-screen text-gray-200">
      <h1 className="text-4xl font-semibold text-center mb-6">
        {t("savedVideos")}
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedVideos &&
          sortedVideos.map((video, index) => (
            <div
              key={index}
              className="card bg-gray-800 text-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg relative"
            >
              <button
                className="absolute top-2 right-2 bg-gray-900 hover:bg-gray-700 text-white rounded-full p-1 transition duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  removeVideo(userId, video.videoUrl);
                }}
                aria-label="Delete video"
              >
                <CloseIcon fontSize="small" />
              </button>

              <div className="card-body p-4">
                <h2 className="card-title text-xl font-bold text-gray-200">
                  {video.videoName}
                </h2>

                <p className="text-sm text-gray-300 mt-2">
                  {video.videoSummary &&
                  video.videoSummary[userDetails.language]
                    ? video.videoSummary[userDetails.language]
                    : t("noSummaryInLang")}
                </p>

                <div className="card-actions justify-end mt-4 space-x-2">
                  {!video.videoSummary && (
                    <button
                      disabled={isGeneratingSummaryFor === video.videoUrl}
                      onClick={() => generateSummary(video)}
                      className="btn btn-primary bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg"
                    >
                      {isGeneratingSummaryFor === video.videoUrl
                        ? t("generating")
                        : t("generateOne")}
                    </button>
                  )}

                  <a
                    href={video.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg"
                  >
                    {t("watchVideo")}
                  </a>
                </div>
              </div>
            </div>
          ))}
      </div>
      {error && (
        <div className="text-red-500 mt-2">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default SavedVideosList;
