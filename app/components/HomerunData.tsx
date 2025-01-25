"use client"; // Mark as a client-side component

import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext"; // Assuming you have a context to get userId
import { getHomerunData } from "../utils/bigQuery";

interface HomerunDataProps {
  playerName: string;
}

const HomerunData = ({ playerName }: HomerunDataProps) => {
  const [homerunData, setHomerunData] = useState<any[]>([]); // State to store the fetched homerun data
  const [loading, setLoading] = useState<boolean>(true); // State to manage loading status
  const [error, setError] = useState<string | null>(null); // State to manage error messages

  useEffect(() => {
    const fetchData = async () => {
      const result = await getHomerunData(playerName);

      if (result && result.data) {
        setHomerunData(result.data);
      } else {
        setError("Failed to fetch homerun data.");
      }

      setLoading(false);
    };

    fetchData();
  }, [playerName]); // Re-fetch when userId or playerId changes

  // Render loading state or error message if needed
  if (loading) {
    return <p className="text-center mt-4 text-white">Loading...</p>;
  }

  if (error) {
    return <p className="text-center mt-4 text-red-500">{error}</p>;
  }

  // Render the table with the fetched data
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-4">
        Homerun Data for {playerName}
      </h1>

      <div className="overflow-x-auto bg-black shadow-lg rounded-lg">
        <table className="table w-full table-auto border-separate border-spacing-0 rounded-lg">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-4 py-2 text-left">Title</th>
              <th className="px-4 py-2 text-left">Video</th>
              <th className="px-4 py-2 text-left">Exit Velocity</th>
              <th className="px-4 py-2 text-left">Hit Distance</th>
              <th className="px-4 py-2 text-left">Launch Angle</th>
              <th className="px-4 py-2 text-left">Year</th>
              <th className="px-4 py-2 text-left">Postseason</th>
            </tr>
          </thead>
          <tbody>
            {homerunData.map((row: any, index: number) => (
              <tr
                key={index}
                className="hover:bg-blue-500 cursor-pointer transition duration-200"
              >
                <td className="px-4 py-2">{row.Title}</td>
                <td className="px-4 py-2">
                  <a
                    href={row.Video}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Watch Video
                  </a>
                </td>
                <td className="px-4 py-2">{row.ExitVelocity}</td>
                <td className="px-4 py-2">{row.HitDistance}</td>
                <td className="px-4 py-2">{row.LaunchAngle}</td>
                <td className="px-4 py-2">{row.Year}</td>
                <td className="px-4 py-2">{row.IsPostSeason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HomerunData;
