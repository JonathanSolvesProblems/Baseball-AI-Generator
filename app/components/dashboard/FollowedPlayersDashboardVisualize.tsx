"use client";
import { auth, getFollowedPlayers } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import PlayerModal from "@/app/players/PlayerModal";
import RecommendPlayers from "./RecommendPlayers";
import Graph from "./Graph";
import { fetchFollowedPlayers } from "@/app/utils/apiPaths";

// Register necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const FollowedPlayersDashboardVisualize = () => {
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [followedPlayers, setFollowedPlayers] = useState<string[]>([]);
  const [playerDetails, setPlayerDetails] = useState<any[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(undefined);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const retrieveFollowedPlayers = async () => {
      const players: any = await getFollowedPlayers(userId);
      const updatedPlayers: any[] = [];
      setFollowedPlayers(players);

      for (const playerID in players) {
        try {
          const player = await fetchFollowedPlayers(players[playerID]);

          if (player) {
            const playerInfo = {
              id: player.id,
              fullName: player.fullName,
              birthCity: player.birthCity,
              birthCountry: player.birthCountry,
              height: player.height,
              weight: player.weight,
              primaryPosition: player.primaryPosition.name,
              currentAge: player.currentAge,
              mlbDebutDate: player.mlbDebutDate,
            };
            updatedPlayers.push(playerInfo);
          }
        } catch (error) {
          console.error(`Failed to fetch data for player ${playerID}:`, error);
        }
      }
      setPlayerDetails(updatedPlayers);
    };

    retrieveFollowedPlayers();
  }, [userId]);

  const handleElementClick = (elements: any[], chart: any) => {
    if (elements.length > 0) {
      const selectedIndex = elements[0].index; // Get index of clicked bar
      const selectedPlayerData = playerDetails[selectedIndex];
      setSelectedPlayer(selectedPlayerData);
      setIsModalOpen(true); // Open modal
    }
  };

  const chartData = {
    labels: playerDetails.map((player) => player.fullName),
    datasets: [
      {
        label: "Player Weight (lbs)",
        data: playerDetails.map((player) => player.weight),
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
      {
        label: "Player Height (inches)",
        data: playerDetails.map((player) => player.height[0]),
        backgroundColor: "rgba(153, 102, 255, 0.5)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      title: {
        display: true,
        text: "Followed Players: Weight and Height",
      },
    },
    onClick: (event: any, elements: any[]) =>
      handleElementClick(elements, event.chart),
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPlayer(null);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-center mb-6">
        Your Followed Players
      </h2>

      {playerDetails.length > 0 ? (
        <div className="p-4 shadow-lg rounded-lg bg-white">
          <Graph
            chartType={"bar"}
            chartData={chartData}
            chartOptions={chartOptions}
          />
        </div>
      ) : (
        <p>You have no followed players</p>
      )}

      {isModalOpen && selectedPlayer && (
        <PlayerModal
          player={selectedPlayer}
          onClose={closeModal}
          userId={userId}
        />
      )}

      {userId && (
        <RecommendPlayers userId={userId} followedPlayer={followedPlayers[0]} />
      )}
    </div>
  );
};

export default FollowedPlayersDashboardVisualize;
