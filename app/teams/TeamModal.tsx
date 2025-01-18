"use client";
import { useEffect, useState } from "react";
import { getFollowedTeams, unfollowTeam, followTeam } from "@/firebase";
import AuthModal from "../auth/AuthModal";
import { getTeamLogo } from "../utils/apiPaths";

interface TeamModalProps {
  team: any;
  onClose: () => void;
  userId: string | null;
}
// Expand your user profile to include additional data, like the teams and players a user is following, and make sure the user’s preferences are updated accordingly in Firestore.
const TeamModal = ({ team, onClose, userId }: TeamModalProps) => {
  const [isFollowing, setIsFollowing] = useState<boolean | undefined>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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

    console.log(`userId is ${userId}`);

    if (isFollowing) {
      await unfollowTeam(userId, team.id);
    } else {
      await followTeam(userId, team.id);
    }
    setIsFollowing(!isFollowing);
  };

  if (!team) return;

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
              src={getTeamLogo(team.id)}
              alt={`${team.teamName}'s logo`}
              className="w-[100px] h-[100px] aspect-square object-contain rounded-full border-4 border-gray-200"
            />
            <h2 className="text-2xl font-semibold text-gray-800">
              {team.teamName}
            </h2>
            <div className="w-full space-y-2 text-left text-gray-700">
              <p>
                <strong>Location:</strong> {team.locationName}
              </p>
              <p>
                <strong>Season:</strong> {team.season}
              </p>
              <p>
                <strong>League:</strong> {team.league.name}
              </p>
            </div>

            <button
              onClick={toggleFollow}
              className="btn btn-primary w-full py-2 mt-4 text-white hover:bg-blue-600 transition duration-200"
            >
              {isFollowing ? "Unfollow" : "Follow"} {team.teamName}
            </button>
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
