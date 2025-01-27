"use client";

import Header from "@/app/components/Header";
import { useSearchParams } from "next/navigation";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useEffect, useMemo, useState } from "react";
import HomerunData from "@/app/components/HomerunData";
import { useUser } from "@/app/context/UserContext";
import {
  deleteArticle,
  deleteVideo,
  getSavedArticles,
  getSavedVideos,
  saveArticle,
  saveVideo,
} from "@/firebase";

const PlayerRelatedContent = () => {
  const searchParams = useSearchParams();
  const playerId = searchParams?.get("playerId");
  const data = searchParams?.get("data");
  const [homerunData, setHomerunData] = useState<any[]>([]); // State to store the fetched homerun data
  const {
    userId,
    userDetails,
    savedVideos,
    savedArticles,
    loading,
    setSavedArticles,
    setSavedVideos,
  } = useUser();

  const playerName = searchParams?.get("playerName") || "Unknown Player";

  const relatedContent = useMemo(() => (data ? JSON.parse(data) : []), [data]);

  const [savedStates, setSavedStates] = useState<boolean[]>(
    new Array(relatedContent.length).fill(false)
  );

  useEffect(() => {
    if (loading) return;

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

        // Update the state only if it has changed to avoid unnecessary re-renders
        setSavedStates((prevStates) => {
          if (
            prevStates.length !== updatedStates.length ||
            prevStates.some((state, idx) => state !== updatedStates[idx])
          ) {
            return updatedStates;
          }
          return prevStates;
        });
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
    const row = relatedContent[index]; // Get the corresponding row
    const updatedSavedStates = [...savedStates];

    try {
      if (savedStates[index]) {
        // If already saved, delete the content
        if (row.source.includes("video")) {
          await deleteVideo(userId, row.source);
        } else {
          await deleteArticle(userId, row.Headline);
        }
      } else {
        // If not saved, save the content
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

      // Toggle the save state
      updatedSavedStates[index] = !savedStates[index];
      setSavedStates(updatedSavedStates);
    } catch (error) {
      console.error("Error saving or deleting content:", error);
    }
  };

  if (loading && !relatedContent.length) {
    return <p className="text-center mt-4">Loading related content...</p>;
  }

  if (!relatedContent.length && !homerunData) {
    return <p className="text-center mt-4">No related content available.</p>;
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-4">
          Found Related Content for {playerName}
        </h1>

        <div className="overflow-x-auto bg-black shadow-lg rounded-lg">
          <table className="table w-full table-auto border-separate border-spacing-0 rounded-lg">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-4 py-2 text-left">Headline</th>
                <th className="px-4 py-2 text-left">Posted</th>
                <th className="px-4 py-2 text-left">Source</th>
                <th className="px-4 py-2 text-left">Save</th>
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
                        ? "Go to Video"
                        : "Go to Article"}
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
      {playerId && (
        <HomerunData
          playerName={playerName}
          homerunData={homerunData}
          setHomerunData={setHomerunData}
        />
      )}
    </>
  );
};

export default PlayerRelatedContent;
