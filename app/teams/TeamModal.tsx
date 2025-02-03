"use client";
import { useEffect, useState } from "react";
import { getFollowedTeams, unfollowTeam, followTeam } from "@/firebase";
import AuthModal from "../auth/AuthModal";
import { getTeamLogo } from "../utils/apiPaths";
import { useRouter } from "next/navigation";
import { useUser } from "../context/UserContext";
import i18n from "@/i18n";
import { useTranslation } from "react-i18next";
import { locales } from "@/locales";
import { translateText } from "../utils/geminiCalls";

interface TeamModalProps {
  team: any;
  onClose: () => void;
}

const TeamModal = ({ team, onClose }: TeamModalProps) => {
  const [isFollowing, setIsFollowing] = useState<boolean | undefined>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const router = useRouter();
  const { userId, userDetails } = useUser();
  const { t } = useTranslation();
  const [translatedTeam, setTranslatedTeam] = useState<any>({});

  useEffect(() => {
    if (userDetails?.language) {
      i18n.changeLanguage(locales[userDetails.language]);
    }
  }, [userDetails?.language]);

  useEffect(() => {
    const fetchFollowedTeams = async () => {
      if (userId) {
        const followedTeams = await getFollowedTeams(userId);

        const isAlreadyFollowing = followedTeams?.includes(team.id);
        setIsFollowing(isAlreadyFollowing);
      }
    };

    fetchFollowedTeams();
  }, [userId, team.id]);

  const toggleFollow = async () => {
    if (!userId) {
      setIsAuthModalOpen(true);
      return;
    }

    if (isFollowing) {
      await unfollowTeam(userId, team.id);
    } else {
      await followTeam(userId, team.id);
    }
    setIsFollowing(!isFollowing);
  };

  const handleSearchRelatedContent = async () => {
    if (team.id && team.teamName) {
      router.push(
        `/teams/${team.id}?teamId=${encodeURIComponent(
          team.id
        )}&teamName=${encodeURIComponent(team.teamName)}`
      );
    } else {
      console.warn("No related content found.");
    }
  };

  const handleTranslate = async () => {
    if (userDetails.language !== "English") {
      const translatedTeamName = await translateText(
        team.teamName,
        userDetails.language
      );
      const translatedLocationName = await translateText(
        team.locationName,
        userDetails.language
      );
      const translatedLeagueName = await translateText(
        team.league?.name,
        userDetails.language
      );
      const translatedFirstYearOfPlay = await translateText(
        team.firstYearOfPlay.toString(),
        userDetails.language
      ); // Convert to string

      setTranslatedTeam({
        teamName: translatedTeamName,
        locationName: translatedLocationName,
        leagueName: translatedLeagueName,
        firstYearOfPlay: translatedFirstYearOfPlay,
      });
    }
  };

  if (!team) return;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
        <div className="bg-gray-800 p-6 rounded-xl shadow-xl max-w-lg w-full transform transition-all duration-300 ease-in-out scale-100 opacity-100">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-3xl text-gray-400 hover:text-red-500 transition duration-200"
          >
            &times;
          </button>

          <div className="flex flex-col items-center space-y-6">
            <img
              src={getTeamLogo(team.id)}
              alt={`${team.teamName}'s logo`}
              className="w-40 h-40 object-contain rounded-full border-4 border-gray-300 shadow-lg bg-white"
            />
            <h2 className="text-3xl font-semibold text-white">
              {translatedTeam.teamName || team.teamName}
            </h2>
            <div className="w-full space-y-3 text-left text-gray-300">
              <p>
                <strong>{t("location")}:</strong>{" "}
                {translatedTeam.locationName || team.locationName}
              </p>
              <p>
                <strong>{t("league")}:</strong>{" "}
                {translatedTeam.leagueName || team.league?.name}
              </p>
              <p>
                <strong>{t("firstYearOfPlay")}:</strong>{" "}
                {translatedTeam.firstYearOfPlay || team.firstYearOfPlay}
              </p>
              <p>
                <strong>{t("active")}:</strong>{" "}
                {team.active ? t("yes") : t("no")}
              </p>
            </div>

            <button
              onClick={toggleFollow}
              className="w-full py-3 mt-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-lg transform transition duration-300 ease-in-out"
            >
              {isFollowing ? t("unfollow") : t("follow")} {team.teamName}
            </button>

            {isFollowing && (
              <button
                onClick={handleSearchRelatedContent}
                className="w-full py-3 mt-4 bg-gray-700 text-white rounded-full hover:bg-gray-600 shadow-lg transform transition duration-300 ease-in-out"
              >
                {t("searchRelatedContent")}
              </button>
            )}

            {userDetails && userDetails.language !== "English" && (
              <button
                onClick={handleTranslate}
                className="w-full py-3 mt-4 bg-green-600 text-white rounded-full hover:bg-green-700 shadow-lg transform transition duration-300 ease-in-out"
              >
                {t("translate")}
              </button>
            )}
          </div>
        </div>
      </div>

      {isAuthModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50">
          <AuthModal setIsModalOpen={setIsAuthModalOpen} />
        </div>
      )}
    </>
  );
};

export default TeamModal;
