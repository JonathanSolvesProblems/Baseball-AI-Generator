import React, { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { getSavedCharts, deleteChartById } from "@/firebase"; // Ensure deleteChartById is implemented in your Firebase functions
import Graph from "../components/dashboard/Graph";
import { convertTimestampToDate } from "../utils/helper";
import CloseIcon from "@mui/icons-material/Close";

const SavedChartsList = () => {
  const { userId } = useUser();
  const [savedCharts, setSavedCharts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedCharts = async () => {
      if (userId) {
        const charts: any = await getSavedCharts(userId);
        // Sort charts by savedDate (newest first)
        const sortedCharts = charts.sort(
          (a: any, b: any) =>
            new Date(b.savedDate).getTime() - new Date(a.savedDate).getTime()
        );
        setSavedCharts(sortedCharts);
      }
      setLoading(false);
    };

    fetchSavedCharts();
  }, [userId]);

  const handleDelete = async (chartId: string) => {
    if (!userId) return;
    try {
      await deleteChartById(userId, chartId);
      setSavedCharts((prevCharts) =>
        prevCharts.filter((chart: any) => chart.id !== chartId)
      );
    } catch (error) {
      console.error("Error deleting chart:", error);
    }
  };

  if (!userId) {
    return (
      <div className="p-6 bg-[#0a0a0a] min-h-screen text-gray-200">
        <h1 className="text-4xl font-semibold text-center mb-6">
          Saved Charts
        </h1>
        <p className="text-center text-gray-400">
          Please log in to view your saved charts.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 bg-[#0a0a0a] min-h-screen text-gray-200">
        <p className="text-center text-gray-400">Loading charts...</p>
      </div>
    );
  }

  if (savedCharts.length === 0) {
    return (
      <div className="p-6 bg-[#0a0a0a] min-h-screen text-gray-200">
        <h1 className="text-4xl font-semibold text-center mb-6">
          Saved Charts
        </h1>
        <p className="text-center text-gray-400">No saved charts found.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#0a0a0a] min-h-screen text-gray-200">
      <h1 className="text-4xl font-semibold text-center mb-6">Saved Charts</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {savedCharts.map((chart: any) => (
          <div
            key={chart.id}
            className="card bg-gray-700 text-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg relative"
          >
            {/* Delete Button */}
            <button
              className="absolute top-2 right-2 bg-gray-800 hover:bg-gray-600 text-white rounded-full p-1 transition duration-200"
              onClick={() => handleDelete(chart.id)}
              aria-label="Delete chart"
            >
              <CloseIcon fontSize="small" />
            </button>

            <div className="card-body p-4">
              <p className="text-sm text-gray-400">
                Saved on:{" "}
                {convertTimestampToDate(chart.savedDate.toString()).toString()}
              </p>
              <div className="mt-4">
                <Graph
                  chartType={chart.chartType}
                  chartData={chart.chartData}
                  chartOptions={chart.chartOptions}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedChartsList;
