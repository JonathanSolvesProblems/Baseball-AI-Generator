"use client";

import React, { useEffect, useState } from "react";
import PlayerModal from "./PlayerModal";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useUser } from "../context/UserContext";
import i18n from "@/i18n";
import { useTranslation } from "react-i18next";
import { locales } from "@/locales";
import { translateText } from "../utils/geminiCalls";

interface PlayersTableProps {
  players: any[];
}

const PlayersTable = ({ players }: PlayersTableProps) => {
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const { userId, followedPlayers, userDetails } = useUser();
  const [filteredPlayers, setFilteredPlayers] = useState<any[]>(players);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFollowedOnly, setIsFollowedOnly] = useState(false);
  const { t } = useTranslation();
  const [translatedNames, setTranslatedNames] = useState<{
    [key: string]: string;
  }>({});
  const [translatedCountries, setTranslatedCountries] = useState<{
    [key: string]: string;
  }>({});

  useEffect(() => {
    if (userDetails?.language) {
      i18n.changeLanguage(locales[userDetails.language]);
    }
  }, [userDetails?.language]);

  useEffect(() => {
    filterPlayers();
  }, [searchQuery, players, followedPlayers, isFollowedOnly]);

  const filterPlayers = () => {
    const filtered = players.filter((player) => {
      const query = searchQuery.toLowerCase().trim(); // Normalize query for case-insensitive comparison

      const searchMatch =
        (player.fullName && player.fullName.toLowerCase().includes(query)) ||
        (player.birthCity && player.birthCity.toLowerCase().includes(query)) ||
        (player.birthCountry &&
          player.birthCountry.toLowerCase().includes(query)) ||
        (player.height &&
          player.height.toString().toLowerCase().includes(query)) ||
        (player.weight &&
          player.weight.toString().toLowerCase().includes(query)) ||
        (player.primaryPosition?.name &&
          player.primaryPosition.name.toLowerCase().includes(query)) ||
        (player.currentAge && player.currentAge.toString().includes(query)) ||
        (player.mlbDebutDate &&
          player.mlbDebutDate.toLowerCase().includes(query));

      // If filtering by followed players, check if the player is in the followed players list
      const isFollowed = followedPlayers.includes(player.id);

      return searchMatch && (!isFollowedOnly || isFollowed); // Show players based on search and followed status
    });

    setFilteredPlayers(filtered);
  };

  const handleTranslate = async (playerId: string) => {
    const player = filteredPlayers.find((p) => p.id === playerId);
    if (player && userDetails.language !== "English") {
      // Translate both name and country
      const translatedName = await translateText(
        player.fullName,
        userDetails.language
      );
      const translatedCountry = await translateText(
        player.birthCountry,
        userDetails.language
      );

      setTranslatedNames((prev) => ({ ...prev, [playerId]: translatedName }));
      setTranslatedCountries((prev) => ({
        ...prev,
        [playerId]: translatedCountry,
      }));
    }
  };

  const fetchPlayerDetails = async (player: any) => {
    if (selectedPlayer && selectedPlayer.id === player.id) {
      return;
    }

    if (player) {
      setSelectedPlayer({
        id: player.id,
        fullName: player.fullName,
        birthCity: player.birthCity,
        birthCountry: player.birthCountry,
        height: player.height,
        weight: player.weight,
        primaryPosition: player.primaryPosition.name,
        currentAge: player.currentAge,
        mlbDebutDate: player.mlbDebutDate,
      });
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPlayer(null);
  };

  const toggleFollowedFilter = () => {
    setIsFollowedOnly((prev) => !prev);
    setSearchQuery("");
    filterPlayers();
  };

  return (
    <div className="p-4 space-y-4 max-w-screen-xl mx-auto">
      <div className="flex items-center mb-4 space-x-4 flex-wrap">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("searchPlayers")}
          className="input input-bordered w-full sm:max-w-xs bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="relative inline-flex items-center group">
          <button
            onClick={toggleFollowedFilter}
            className="p-2 bg-gray-700 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {isFollowedOnly ? (
              <FavoriteIcon className="text-yellow-500" />
            ) : (
              <FavoriteBorderIcon className="text-gray-400" />
            )}
          </button>
          <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-sm rounded-md py-2 px-4 left-4 top-1/2 transform -translate-y-1/2 ml-4">
            {t("showOnlyFollowedPlayers")}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto bg-gray-900 shadow-lg rounded-lg">
        <table className="table w-full table-auto border-separate border-spacing-0 rounded-lg">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-4 py-2 text-left">{t("name")}</th>
              <th className="px-4 py-2 text-left">{t("birthCountry")}</th>
              {userDetails && userDetails.language !== "English" && (
                <th className="px-4 py-2 text-left">{t("translate")}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.map((player) => (
              <tr
                key={player.id}
                onClick={() => fetchPlayerDetails(player)}
                className="hover:bg-blue-600 cursor-pointer transition duration-200"
              >
                <td className="px-4 py-2 text-white">
                  {translatedNames[player.id] || player.fullName}
                </td>
                <td className="px-4 py-2 text-white">
                  {translatedCountries[player.id] || player.birthCountry}
                </td>
                {userDetails && userDetails.language !== "English" && (
                  <td className="px-4 py-2">
                    {userDetails && userDetails.language !== "English" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent modal from opening
                          handleTranslate(player.id); // Translate clicked row
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none transition duration-200"
                      >
                        {t("translate")}
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && selectedPlayer && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
            <PlayerModal
              player={selectedPlayer}
              onClose={closeModal}
              userId={userId}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayersTable;
