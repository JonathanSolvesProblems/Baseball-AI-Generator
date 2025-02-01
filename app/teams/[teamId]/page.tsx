"use client";

import Header from "@/app/components/Header";
import { useSearchParams } from "next/navigation";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useEffect, useState } from "react";
import { useUser } from "@/app/context/UserContext";
import {
  deleteArticle,
  deleteVideo,
  getSavedArticles,
  getSavedVideos,
  saveArticle,
  saveVideo,
} from "@/firebase";
import { getFanContentInteractionDataFromTeamOrPlayer } from "@/app/utils/bigQuery";
import i18n from "@/i18n";
import { useTranslation } from "react-i18next";
import { locales } from "@/locales";

const TeamRelatedContent = () => {
  const searchParams = useSearchParams();
  const teamId = searchParams?.get("teamId");
  const teamName = searchParams?.get("teamName") || "Unknown Team";

  const {
    userId,
    userDetails,
    savedVideos,
    savedArticles,
    loading,
    setSavedArticles,
    setSavedVideos,
  } = useUser();

  const [relatedContent, setRelatedContent] = useState<any[]>([]);
  const [savedStates, setSavedStates] = useState<boolean[]>([]);
  const [isContentLoading, setIsContentLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    if (userDetails?.language) {
      i18n.changeLanguage(locales[userDetails.language]);
    }
  }, [userDetails?.language]);

  useEffect(() => {
    const fetchRelatedContent = async () => {
      if (!teamId) return;
      try {
        setIsContentLoading(true); // Set loading to true before fetching
        const response = await getFanContentInteractionDataFromTeamOrPlayer(
          teamId,
          null
        );

        // Ensure the data property exists and is an array
        const content = Array.isArray(response?.data) ? response.data : [];
        setRelatedContent(content);
        setSavedStates(new Array(content.length).fill(false));
      } catch (error) {
        console.error("Failed to fetch related content:", error);
      } finally {
        setIsContentLoading(false); // Set loading to false after fetching
      }
    };

    fetchRelatedContent();
  }, [teamId]);

  useEffect(() => {
    if (loading || !relatedContent.length) return;

    const fetchSavedContent = async () => {
      try {
        const updatedStates = relatedContent.map((row: any) => {
          if (row.source.includes("video")) {
            return savedVideos.some((video) => video.videoUrl === row.source);
          } else {
            return savedArticles.some(
              (article) => article.articleTitle === row.Headline
            );
          }
        });
        setSavedStates(updatedStates);
      } catch (error) {
        console.error("Error fetching saved content:", error);
      }
    };

    fetchSavedContent();
  }, [relatedContent, savedVideos, savedArticles, loading]);

  const refreshSavedContent = async () => {
    if (!userId) return;

    try {
      const [videos, articles] = await Promise.all([
        getSavedVideos(userId, userDetails.language),
        getSavedArticles(userId),
      ]);

      if (videos) setSavedVideos(videos);
      setSavedArticles(articles);
    } catch (error) {
      console.error("Error refreshing saved content:", error);
    }
  };

  const toggleSave = async (index: number) => {
    if (!userId || (!userDetails && !userDetails.language)) return;
    const row = relatedContent[index];
    const updatedSavedStates = [...savedStates];

    try {
      if (savedStates[index]) {
        if (row.source.includes("video")) {
          await deleteVideo(userId, row.source);
        } else {
          await deleteArticle(userId, row.Headline);
        }
      } else {
        if (row.source.includes("video")) {
          await saveVideo(
            userId,
            row.source,
            row.Headline,
            row.videoSummary,
            userDetails.language
          );
        } else {
          await saveArticle(userId, row.source, row.Headline);
        }
      }

      await refreshSavedContent();
      updatedSavedStates[index] = !savedStates[index];
      setSavedStates(updatedSavedStates);
    } catch (error) {
      console.error("Error saving or deleting content:", error);
    }
  };

  if (isContentLoading) {
    return <p className="text-center mt-4">{t("loadingRelatedContent")}</p>;
  }
  if (!relatedContent.length) {
    return <p className="text-center mt-4">{t("noRelatedContentAvailable")}</p>;
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-4">
          {t("foundRelatedContentFor")} {teamName}
        </h1>

        <div className="overflow-x-auto bg-black shadow-lg rounded-lg">
          <table className="table w-full table-auto border-separate border-spacing-0 rounded-lg">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-4 py-2 text-left">{t("headline")}</th>
                <th className="px-4 py-2 text-left">{t("posted")}</th>
                <th className="px-4 py-2 text-left">{t("source")}</th>
                <th className="px-4 py-2 text-left">{t("save")}</th>
              </tr>
            </thead>
            <tbody>
              {relatedContent.map((row: any, index: number) => (
                <tr
                  key={index}
                  className="hover:bg-blue-500 cursor-pointer transition duration-200"
                >
                  <td className="px-4 py-2">{row.Headline}</td>
                  <td className="px-4 py-2">{row.posted}</td>
                  <td className="px-4 py-2">
                    <a
                      href={row.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {row.source.includes("video")
                        ? t("goToVideo")
                        : t("goToArticle")}
                    </a>
                  </td>
                  <td className="px-4 py-2">
                    <button onClick={() => toggleSave(index)}>
                      {savedStates[index] ? (
                        <FavoriteIcon className="text-yellow-500" />
                      ) : (
                        <FavoriteBorderIcon className="text-gray-500" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default TeamRelatedContent;
