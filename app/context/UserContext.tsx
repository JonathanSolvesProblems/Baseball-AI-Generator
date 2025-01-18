"use client";
import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";
import { onAuthStateChanged } from "firebase/auth";
import { ISavedVideos, PlayerDetails } from "../utils/schemas";
import {
  auth,
  getFollowedPlayers,
  getLoggedInUserDetails,
  getSavedVideos,
} from "@/firebase";
import { fetchFollowedPlayers } from "../utils/apiPaths";

interface IUserContextType {
  userId: string | undefined;
  userDetails: any;
  followedPlayers: string[];
  playerDetails: PlayerDetails[];
  savedVideos: ISavedVideos[];
  loading: boolean;
  setSavedVideos: React.Dispatch<React.SetStateAction<ISavedVideos[]>>;
}

const UserContext = createContext<IUserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [followedPlayers, setFollowedPlayers] = useState<string[]>([]);
  const [playerDetails, setPlayerDetails] = useState<PlayerDetails[]>([]);
  const [savedVideos, setSavedVideos] = useState<ISavedVideos[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userDetails, setUserDetails] = useState<any>();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(undefined);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const retrieveUserDetailsAndVideos = async () => {
      if (!userId) return;
      const userDetails: any = await getLoggedInUserDetails(userId);

      if (!userDetails) return;

      const savedVideos = await getSavedVideos(userId, userDetails.language);
      setUserDetails(userDetails);

      if (!savedVideos) return;

      setSavedVideos(savedVideos);
    };

    const retrieveFollowedPlayers = async () => {
      const players = await getFollowedPlayers(userId);

      if (!players) return;

      setFollowedPlayers(players);

      const updatedPlayers: PlayerDetails[] = [];
      for (let playerId of players) {
        const player = await fetchFollowedPlayers(playerId);

        if (player) {
          updatedPlayers.push({
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
        }
      }

      setPlayerDetails(updatedPlayers);
    };

    retrieveFollowedPlayers();
    retrieveUserDetailsAndVideos();
  }, [userId]);

  return (
    <UserContext.Provider
      value={{
        userId,
        followedPlayers,
        playerDetails,
        loading,
        savedVideos,
        userDetails,
        setSavedVideos,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): IUserContextType => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }

  return context;
};
