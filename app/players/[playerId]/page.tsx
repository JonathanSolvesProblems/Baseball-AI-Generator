"use client";

import Header from "@/app/components/Header";
import { useSearchParams } from "next/navigation";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useState } from "react";
import HomerunData from "@/app/components/HomerunData";

const PlayerRelatedContent = () => {
  const searchParams = useSearchParams();
  const playerId = searchParams?.get("playerId");
  const data = searchParams?.get("data");

  const playerName = searchParams?.get("playerName") || "Unknown Player";

  const relatedContent = data ? JSON.parse(data) : [];

  const [savedStates, setSavedStates] = useState<boolean[]>(
    new Array(relatedContent.length).fill(false)
  );

  if (!relatedContent.length) {
    return <p className="text-center mt-4">No related content available.</p>;
  }

  const toggleSave = (index: number) => {
    // Toggle the save state of the specific row
    const updatedSavedStates = [...savedStates];
    updatedSavedStates[index] = !updatedSavedStates[index];
    setSavedStates(updatedSavedStates);
  };

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-4">
          Related Content for {playerName}
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
      {playerId && <HomerunData playerName={playerName} />}
    </>
  );
};

export default PlayerRelatedContent;
