"use client";
import { useEffect, useState } from "react";
import { followPlayer, unfollowPlayer, getFollowedPlayers } from "@/firebase";
import { PlayerDetails } from "../utils/schemas";
import AuthModal from "../auth/AuthModal";
import { getPlayerHeadshot } from "../utils/apiPaths";
import { getFanContentInteractionDataFromTeamOrPlayer } from "../utils/bigQuery";
import { useRouter } from "next/navigation";
import i18n from "@/i18n";
import { useTranslation } from "react-i18next";
import { locales } from "@/locales";
import { useUser } from "../context/UserContext";
import { translateText } from "../utils/geminiCalls";

interface PlayerModalProps {
  player: PlayerDetails;
  onClose: () => void;
  userId: any;
}

const PlayerModal = ({ player, onClose, userId }: PlayerModalProps) => {
  const [isFollowing, setIsFollowing] = useState<boolean | undefined>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();
  const { userDetails } = useUser();
  const [translatedPlayer, setTranslatedPlayer] = useState<any>({});

  useEffect(() => {
    if (userDetails?.language) {
      i18n.changeLanguage(locales[userDetails.language]);
    }
  }, [userDetails?.language]);

  useEffect(() => {
    const fetchFollowedPlayers = async () => {
      if (userId) {
        const followedPlayers = await getFollowedPlayers(userId);

        const isAlreadyFollowing = followedPlayers?.includes(player.id);
        setIsFollowing(isAlreadyFollowing);
      }
    };

    if (userId) {
      fetchFollowedPlayers();
    }
  }, [userId, player.id]);

  const toggleFollow = async () => {
    if (!userId) {
      setIsAuthModalOpen(true);
      return;
    }

    if (isFollowing) {
      await unfollowPlayer(userId, player.id);
    } else {
      await followPlayer(userId, player.id);
    }
    setIsFollowing(!isFollowing);
  };

  const handleSearchRelatedContent = async () => {
    if (!userId) return;

    if (player.id && player.fullName) {
      router.push(
        `/players/${player.id}?&playerName=${encodeURIComponent(
          player.fullName
        )}&playerId=${encodeURIComponent(player.id)}`
      );
    } else {
      console.warn("No related content found.");
    }
  };

  const handleTranslate = async () => {
    if (userDetails.language !== "English") {
      const translatedBirthCity = await translateText(
        player.birthCity,
        userDetails.language
      );
      const translatedBirthCountry = await translateText(
        player.birthCountry,
        userDetails.language
      );
      const translatedHeight = await translateText(
        player.height.toString(),
        userDetails.language
      );
      const translatedWeight = await translateText(
        player.weight.toString(),
        userDetails.language
      );
      const translatedPosition = await translateText(
        player.primaryPosition,
        userDetails.language
      );
      const translatedAge = await translateText(
        player.currentAge.toString(),
        userDetails.language
      );
      const translatedDebut = await translateText(
        player.mlbDebutDate,
        userDetails.language
      );

      setTranslatedPlayer({
        birthCity: translatedBirthCity,
        birthCountry: translatedBirthCountry,
        height: translatedHeight,
        weight: translatedWeight,
        primaryPosition: translatedPosition,
        age: translatedAge,
        mlbDebutDate: translatedDebut,
      });
    }
  };

  if (!player) return;
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
              src={getPlayerHeadshot(player.id)}
              alt={`${player.fullName}'s headshot`}
              className="w-40 h-40 object-cover rounded-full border-4 border-gray-300 shadow-lg"
            />
            <h2 className="text-3xl font-semibold text-white">
              {player.fullName}
            </h2>
            <div className="w-full space-y-3 text-left text-gray-300">
              <p>
                <strong>{t("birthCity")}</strong>{" "}
                {translatedPlayer.birthCity || player.birthCity}
              </p>
              <p>
                <strong>{t("birthCountry")}:</strong>{" "}
                {translatedPlayer.birthCountry || player.birthCountry}
              </p>
              <p>
                <strong>{t("height")}:</strong>{" "}
                {translatedPlayer.height || player.height}
              </p>
              <p>
                <strong>{t("weight")}:</strong>{" "}
                {translatedPlayer.weight || player.weight}
              </p>
              <p>
                <strong>{t("primaryPosition")}:</strong>{" "}
                {translatedPlayer.primaryPosition || player.primaryPosition}
              </p>
              <p>
                <strong>{t("age")}:</strong>{" "}
                {translatedPlayer.age || player.currentAge}
              </p>
              <p>
                <strong>{t("mlbDebut")}:</strong>{" "}
                {translatedPlayer.mlbDebutDate || player.mlbDebutDate}
              </p>
            </div>

            <button
              onClick={toggleFollow}
              className="w-full py-3 mt-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-lg transform transition duration-300 ease-in-out"
            >
              {isFollowing ? t("unfollow") : t("follow")} {player.fullName}
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

export default PlayerModal;
