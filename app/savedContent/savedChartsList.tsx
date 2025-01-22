import React, { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { getSavedCharts, deleteChartById, updateChartById } from "@/firebase";
import Graph from "../components/dashboard/Graph";
import { convertTimestampToDate } from "../utils/helper";
import CloseIcon from "@mui/icons-material/Close";
import MinimizeIcon from "@mui/icons-material/Minimize";
import { ChromePicker, ColorResult } from "react-color";
import ColorLensIcon from "@mui/icons-material/ColorLens";

const SavedChartsList: React.FC = () => {
  const { userId } = useUser();
  const [savedCharts, setSavedCharts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedChart, setExpandedChart] = useState<any>();
  const [colorPicker, setColorPicker] = useState({
    show: false,
    chartId: "",
    color: "",
  });
  const [graphKey, setGraphKey] = useState(0); // Key to force re-render

  const fetchSavedCharts = async () => {
    if (!userId) return;
    const charts = await getSavedCharts(userId);
    const sortedCharts = charts.sort(
      (a, b) =>
        new Date(b.savedDate).getTime() - new Date(a.savedDate).getTime()
    );
    setSavedCharts(sortedCharts);
    setLoading(false);
  };

  const fetchChartById = async (chartId: string) => {
    if (!userId) return null;
    const charts = await getSavedCharts(userId);
    return charts.find((chart) => chart.id === chartId) || null;
  };

  useEffect(() => {
    fetchSavedCharts();
  }, [userId]);

  const handleDelete = async (chartId: string) => {
    if (!userId) return;
    try {
      await deleteChartById(userId, chartId);
      setSavedCharts((prev) => prev.filter((chart) => chart.id !== chartId));
    } catch (error) {
      console.error("Error deleting chart:", error);
    }
  };

  const handleColorChange = async (color: ColorResult) => {
    if (!colorPicker.chartId || !userId) return;

    try {
      await updateChartById(userId, colorPicker.chartId, {
        chartOptions: { colors: [color.hex] },
      });
      setColorPicker({ ...colorPicker, color: color.hex });

      // Re-fetch the updated chart to apply changes
      const updatedChart = await fetchChartById(colorPicker.chartId);
      if (updatedChart) {
        setExpandedChart(updatedChart);
        setGraphKey((prev) => prev + 1); // Update key to force re-render
      }
    } catch (error) {
      console.error("Error updating chart color:", error);
    }
  };

  const handleCloseExpandedChart = async () => {
    if (expandedChart && userId) {
      const updatedChart = await fetchChartById(expandedChart.id);
      if (updatedChart) {
        setExpandedChart(updatedChart);
        setGraphKey((prev) => prev + 1); // Ensure the expanded chart view is re-rendered
      }

      // Refresh the list of charts in the grid
      await fetchSavedCharts();
    }

    setExpandedChart(null);
    setColorPicker({ show: false, chartId: "", color: "" });
  };

  const handleCustomizeColorsClick = async () => {
    if (expandedChart && userId) {
      const updatedChart = await fetchChartById(expandedChart.id);
      if (updatedChart) setExpandedChart(updatedChart);
    }
    setColorPicker((prev) => ({
      show: !prev.show,
      chartId: expandedChart?.id || "",
      color: expandedChart?.chartOptions.colors?.[0] || "",
    }));
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
        {savedCharts.map((chart) => (
          <div
            key={chart.id}
            className="card bg-gray-800 text-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg relative cursor-pointer"
            onClick={() => setExpandedChart(chart)}
          >
            <button
              className="absolute top-2 right-2 bg-gray-900 hover:bg-gray-700 text-white rounded-full p-1 transition duration-200"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(chart.id);
              }}
              aria-label="Delete chart"
            >
              <CloseIcon fontSize="small" />
            </button>

            <div className="card-body p-4">
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

      {expandedChart && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-11/12 sm:w-3/4 lg:w-1/2 relative text-gray-200">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={handleCloseExpandedChart}
            >
              <MinimizeIcon fontSize="large" />
            </button>

            <Graph
              key={graphKey} // Force re-render when key changes
              chartType={expandedChart.chartType}
              chartData={expandedChart.chartData}
              chartOptions={expandedChart.chartOptions}
            />

            <div className="mt-4 flex justify-center">
              <button
                className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-full transition duration-200"
                onClick={handleCustomizeColorsClick}
              >
                <ColorLensIcon fontSize="medium" />
              </button>
            </div>

            {colorPicker.show && colorPicker.chartId === expandedChart.id && (
              <div className="mt-4 flex justify-center">
                <ChromePicker
                  color={colorPicker.color}
                  onChange={(color) =>
                    setColorPicker({ ...colorPicker, color: color.hex })
                  }
                  onChangeComplete={handleColorChange}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedChartsList;
