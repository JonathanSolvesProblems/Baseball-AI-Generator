"use client";

import React, { useEffect, useState } from "react";
import PlayerModal from "./PlayerModal";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";

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
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

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

  return (
    <div className="p-4 space-y-4">
      <div className="overflow-x-auto bg-black shadow-lg rounded-lg">
        <table className="table w-full table-auto border-separate border-spacing-0 rounded-lg">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Birth Country</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
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
