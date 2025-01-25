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
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full transform transition-all duration-300 ease-in-out scale-100 opacity-100">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-2xl text-gray-600 hover:text-red-600 transition duration-200"
          >
            &times;
          </button>

          <div className="flex flex-col items-center space-y-4">
            <img
              src={getPlayerHeadshot(player.id)}
              alt={`${player.fullName}'s headshot`}
              className="w-32 h-32 object-cover rounded-full border-4 border-gray-200"
            />
            <h2 className="text-2xl font-semibold text-gray-800">
              {player.fullName}
            </h2>
            <div className="w-full space-y-2 text-left text-gray-700">
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
              className="btn btn-primary w-full py-2 mt-4 text-white hover:bg-blue-600 transition duration-200"
            >
              {isFollowing ? "Unfollow" : "Follow"} {player.fullName}
            </button>
            {isFollowing && (
              <button
                onClick={handleSearchRelatedContent}
                className="btn btn-secondary w-full py-2 mt-4 text-white hover:bg-gray-700 transition duration-200"
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
