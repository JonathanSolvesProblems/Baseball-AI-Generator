"use client";
import React, { useEffect, useState } from "react";
import TeamModal from "./TeamModal";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";

const TeamsTable = ({ teams }: { teams: any[] }) => {
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
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

  const closeModal = () => {
    setShowModal(false);
    setSelectedTeam(null);
  };

  const showTeamDetails = (team: any) => {
    setSelectedTeam(team);
    setShowModal(true);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="overflow-x-auto bg-black shadow-lg rounded-lg">
        <table className="table w-full table-auto border-separate border-spacing-0 rounded-lg">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Location</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team) => (
              <tr
                key={team.id}
                onClick={() => showTeamDetails(team)}
                className="hover:bg-blue-500 cursor-pointer transition duration-200"
              >
                <td className="px-4 py-2">{team.teamName}</td>
                <td className="px-4 py-2">{team.locationName}</td>
                <td className="px-4 py-2">
                  {team.active ? "Active" : "Inactive"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && selectedTeam && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50">
          <TeamModal team={selectedTeam} onClose={closeModal} userId={userId} />
        </div>
      )}
    </div>
  );
};

export default TeamsTable;
