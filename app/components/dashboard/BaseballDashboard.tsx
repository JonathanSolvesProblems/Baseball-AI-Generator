"use client";
import { useUser } from "@/app/context/UserContext";
import ResizableDraggableWindow from "./ResizableDraggableWindow";
import {
  getGameFeed,
  getGamesBySeason,
  getSingleGamePlayVideo,
} from "@/app/utils/apiPaths";
import { useEffect, useState } from "react";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SportsBaseballIcon from "@mui/icons-material/SportsBaseball";
import FollowedPlayerHomeRun from "../FollowedPlayerHomeRun";

const BaseballDashboard = () => {
  const { userId, followedPlayers, followedTeams } = useUser();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        // const videoUrl = await getSingleGamePlayVideo("", "2024");
        const data = await getGamesBySeason();
        console.log(JSON.stringify(data.dates[0]));
      } catch (error) {
        console.error("Failed to fetch video", error);
      }
    };

    fetchVideo();
  }, []);

  const sections = [
    { id: 0, title: "Players Section" },
    { id: 1, title: "Teams Section" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 h-screen p-4 bg-gray-100">
      {userId &&
        sections.map((section) => (
          <div
            key={section.id}
            className="relative border border-gray-300 rounded-lg p-2 bg-white"
          >
            <h2 className="text-lg font-bold mb-2">{section.title}</h2>
            <ResizableDraggableWindow
              userId={userId}
              type={section.title.toLowerCase().split(" ")[0]}
              sectionId={section.id}
            />
          </div>
        ))}

      {/* Container for FollowedPlayerHomeRun with border wrapping the icon */}
      <div
        className={`fixed top-16 left-1/2 transform -translate-x-1/2 transition-all ease-in-out duration-300 ${
          isCollapsed ? "h-16 w-16" : "h-[480px] w-[800px]"
        } z-50 overflow-hidden border-4 border-white bg-white shadow-lg rounded-lg p-8`}
      >
        <FollowedPlayerHomeRun followedPlayers={followedPlayers} />

        {/* Icon to toggle collapse, positioned outside the container, but with border wrapping */}
        <div
          className="absolute bottom-[-20px] left-1/2 transform -translate-x-1/2 cursor-pointer bg-white rounded-full p-2 border-4 border-white"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <>
              <SportsBaseballIcon fontSize="inherit" className="text-4xl" />
              <KeyboardArrowDownIcon fontSize="inherit" className="text-4xl" />
            </>
          ) : (
            <KeyboardArrowUpIcon fontSize="inherit" className="text-4xl" />
          )}
        </div>
      </div>
    </div>
  );
};

export default BaseballDashboard;
