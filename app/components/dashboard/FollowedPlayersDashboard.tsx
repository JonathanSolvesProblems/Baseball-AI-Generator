"use client"
import { auth, getFollowedPlayers } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";
import RecommendPlayers from "./RecommendPlayers";

// TODO: Add team data too
const FollowedPlayersDashboard = () => {
    const [userId, setUserId] = useState<string | undefined>(undefined);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                setUserId(undefined);
            }
        });

        return () => unsubscribe();

    }, [])

    const [followedPlayers, setFollowedPlayers] = useState([]);

    useEffect(() => {

        if (!userId) return;

        const fetchFollowedPlayers = async () => {
            const players: any = await getFollowedPlayers(userId);
            setFollowedPlayers(players);
        };
        fetchFollowedPlayers();
    }, [userId]);

    return (
        <div>
            <h2>Your Followed Players</h2>
            <ul>
                {followedPlayers.map(playerId => (
                    <li key={playerId}>{playerId}</li>
                ))}
            </ul>
            {userId && <RecommendPlayers userId={userId} followedPlayer={followedPlayers[0]} />}
        </div>
    );
};

export default FollowedPlayersDashboard;
