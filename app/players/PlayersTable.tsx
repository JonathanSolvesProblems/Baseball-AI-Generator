"use client";

import React, { useEffect, useState } from "react";
import PlayerModal from "./PlayerModal";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useUser } from "../context/UserContext";

// interface Person {
//   id: number;
//   fullName: string;
// }

// interface Status {
//   description: string;
// }

// interface Roster {
//   person: Person;
//   status: Status;
// }

interface PlayersTableProps {
  players: any[];
}

const PlayersTable = ({ players }: PlayersTableProps) => {
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const { userId, followedPlayers } = useUser();
  const [filteredPlayers, setFilteredPlayers] = useState<any[]>(players);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFollowedOnly, setIsFollowedOnly] = useState(false);

  useEffect(() => {
    filterPlayers();
  }, [searchQuery, players, followedPlayers]);

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
    setIsFollowedOnly(!isFollowedOnly);
    setSearchQuery("");
    filterPlayers(); // Trigger search when the icon is clicked
  };

  return (
    <div className="p-4 space-y-4">
      {/* Search bar and Followed players toggle */}
      <div className="flex items-center mb-4 space-x-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search players..."
          className="input input-bordered w-full max-w-xs bg-gray-800 text-white placeholder-gray-500"
        />

        {/* Tooltip and Toggle Followed Players Only */}
        <div className="relative inline-flex items-center group">
          <button
            onClick={toggleFollowedFilter}
            className="p-2 bg-gray-800 text-white rounded-full hover:bg-blue-600"
          >
            {isFollowedOnly ? (
              <FavoriteIcon className="text-yellow-500" />
            ) : (
              <FavoriteBorderIcon className="text-gray-500" />
            )}
          </button>
          <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-sm rounded-md py-2 px-4 left-4 top-1/2 transform -translate-y-1/2 ml-4">
            Show only followed players
          </div>
        </div>
      </div>

      <div className="overflow-x-auto bg-black shadow-lg rounded-lg">
        <table className="table w-full table-auto border-separate border-spacing-0 rounded-lg">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Birth Country</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.map((player) => (
              <tr
                key={player.id}
                onClick={() => fetchPlayerDetails(player)}
                className="hover:bg-blue-500 cursor-pointer transition duration-200"
              >
                <td className="px-4 py-2">{player.fullName}</td>
                <td className="px-4 py-2">{player.birthCountry}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && selectedPlayer && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50">
          <PlayerModal
            player={selectedPlayer}
            onClose={closeModal}
            userId={userId}
          />
        </div>
      )}
    </div>
  );
};

export default PlayersTable;
