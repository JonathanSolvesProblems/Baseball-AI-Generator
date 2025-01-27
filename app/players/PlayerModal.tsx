"use client";
import { useEffect, useState } from "react";
import { followPlayer, unfollowPlayer, getFollowedPlayers } from "@/firebase";
import { PlayerDetails } from "../utils/schemas";
import AuthModal from "../auth/AuthModal";
import { getPlayerHeadshot } from "../utils/apiPaths";
import { getFanContentInteractionDataFromTeamOrPlayer } from "../utils/bigQuery";
import { useRouter } from "next/navigation";

interface PlayerModalProps {
  player: PlayerDetails;
  onClose: () => void;
  userId: any;
}
// Expand your user profile to include additional data, like the teams and players a user is following, and make sure the user’s preferences are updated accordingly in Firestore.
const PlayerModal = ({ player, onClose, userId }: PlayerModalProps) => {
  const [isFollowing, setIsFollowing] = useState<boolean | undefined>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const router = useRouter();

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

    console.log(`userId is ${userId}`);

    if (isFollowing) {
      await unfollowPlayer(userId, player.id);
    } else {
      await followPlayer(userId, player.id);
    }
    setIsFollowing(!isFollowing);
  };

  const handleSearchRelatedContent = async () => {
    if (!userId) return;
    const result = await getFanContentInteractionDataFromTeamOrPlayer(
      null, // teamId is not needed
      player.id
    );

    if (result && result.data) {
      // Use router from next/navigation to navigate

      router.push(
        `/players/${player.id}?data=${encodeURIComponent(
          JSON.stringify(result.data)
        )}&playerName=${encodeURIComponent(
          player.fullName
        )}&playerId=${encodeURIComponent(player.id)}`
      );
    } else {
      console.warn("No related content found.");
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
                <strong>Birth City:</strong> {player.birthCity}
              </p>
              <p>
                <strong>Birth Country:</strong> {player.birthCountry}
              </p>
              <p>
                <strong>Height:</strong> {player.height}
              </p>
              <p>
                <strong>Weight:</strong> {player.weight}
              </p>
              <p>
                <strong>Primary Position:</strong> {player.primaryPosition}
              </p>
              <p>
                <strong>Age:</strong> {player.currentAge}
              </p>
              <p>
                <strong>MLB Debut:</strong> {player.mlbDebutDate}
              </p>
            </div>

            <button
              onClick={toggleFollow}
              className="w-full py-3 mt-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-lg transform transition duration-300 ease-in-out"
            >
              {isFollowing ? "Unfollow" : "Follow"} {player.fullName}
            </button>

            {isFollowing && (
              <button
                onClick={handleSearchRelatedContent}
                className="w-full py-3 mt-4 bg-gray-700 text-white rounded-full hover:bg-gray-600 shadow-lg transform transition duration-300 ease-in-out"
              >
                Search Related Content
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
