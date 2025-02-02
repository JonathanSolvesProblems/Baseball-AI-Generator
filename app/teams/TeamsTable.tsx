"use client";

import React, { useEffect, useState } from "react";
import TeamModal from "./TeamModal";
import { useUser } from "../context/UserContext";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import i18n from "@/i18n";
import { useTranslation } from "react-i18next";
import { locales } from "@/locales";
import { I18nextProvider } from "react-i18next";

const TeamsTable = ({ teams }: { teams: any[] }) => {
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const { userDetails, followedTeams } = useUser();
  const [filteredTeams, setFilteredTeams] = useState<any[]>(teams);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFollowedOnly, setIsFollowedOnly] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (userDetails?.language) {
      i18n.changeLanguage(locales[userDetails.language]);
    }
  }, [userDetails?.language]);

  useEffect(() => {
    filterTeams();
  }, [searchQuery, teams, followedTeams, isFollowedOnly]);

  const filterTeams = () => {
    const filtered = teams.filter((team) => {
      const query = searchQuery.toLowerCase().trim(); // Normalize query for case-insensitive comparison

      const searchMatch =
        (team.name && team.name.toLowerCase().includes(query)) ||
        (team.locationName &&
          team.locationName.toLowerCase().includes(query)) ||
        // Convert team.season to string before calling toLowerCase()
        (team.season && team.season.toString().toLowerCase().includes(query)) ||
        (team.league?.name && team.league.name.toLowerCase().includes(query)) ||
        (team.firstYearOfPlay &&
          team.firstYearOfPlay.toString().includes(query)) ||
        (team.active && team.active.toString().includes(query));

      // If filtering by followed teams, check if the team is in the followed teams list
      const isFollowed = followedTeams.includes(team.id);

      return searchMatch && (!isFollowedOnly || isFollowed); // Show teams based on search and followed status
    });

    setFilteredTeams(filtered);
  };

  const toggleFollowedFilter = () => {
    setIsFollowedOnly((prev) => !prev);
    setSearchQuery("");
    filterTeams(); // Trigger search when the icon is clicked
  };

  const showTeamDetails = (team: any) => {
    setSelectedTeam(team);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTeam(null);
  };

  return (
    <div className="p-4 space-y-4 max-w-screen-xl mx-auto">
      {/* Search bar and Followed teams toggle */}
      <div className="flex items-center mb-4 space-x-4 flex-wrap">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("searchTeams")}
          className="input input-bordered w-full sm:max-w-xs bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Tooltip and Toggle Followed Teams Only */}
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
            {t("showOnlyFollowedTeams")}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto bg-gray-900 shadow-lg rounded-lg">
        <table className="table w-full table-auto border-separate border-spacing-0 rounded-lg">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-4 py-2 text-left">{t("name")}</th>
              <th className="px-4 py-2 text-left">{t("location")}</th>
              <th className="px-4 py-2 text-left">{t("league")}</th>
              <th className="px-4 py-2 text-left">{t("status")}</th>
            </tr>
          </thead>
          <I18nextProvider i18n={i18n} defaultNS={"translation"}>
            <tbody>
              {filteredTeams.map((team) => (
                <tr
                  key={team.id}
                  onClick={() => showTeamDetails(team)}
                  className="hover:bg-blue-600 cursor-pointer transition duration-200"
                >
                  <td className="px-4 py-2 text-white">{team.name}</td>
                  <td className="px-4 py-2 text-white">{team.locationName}</td>
                  <td className="px-4 py-2 text-white">{team.league?.name}</td>
                  <td className="px-4 py-2 text-white">
                    {team.active ? t("active") : t("inactive")}
                  </td>
                </tr>
              ))}
            </tbody>
          </I18nextProvider>
        </table>
      </div>

      {showModal && selectedTeam && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
            <TeamModal team={selectedTeam} onClose={closeModal} />
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamsTable;
