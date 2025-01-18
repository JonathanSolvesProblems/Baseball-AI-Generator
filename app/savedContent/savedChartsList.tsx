import React, { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { getSavedCharts } from "@/firebase";
import Graph from "../components/dashboard/Graph";
import { convertTimestampToDate } from "../utils/helper";

const SavedChartsList = () => {
  const { userId } = useUser();
  const [savedCharts, setSavedCharts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedCharts = async () => {
      if (userId) {
        const charts: any = await getSavedCharts(userId);

        setSavedCharts(charts);
      }
      setLoading(false);
    };

    fetchSavedCharts();
  }, [userId]);

  if (!userId) {
    return (
      <div className="p-6">
        <h1 className="text-4xl font-semibold text-center mb-6">
          Saved Charts
        </h1>
        <p className="text-center text-gray-600">
          Please log in to view your saved charts.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-center text-gray-600">Loading charts...</p>
      </div>
    );
  }

  if (savedCharts.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-4xl font-semibold text-center mb-6">
          Saved Charts
        </h1>
        <p className="text-center text-gray-600">No saved charts found.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-4xl font-semibold text-center mb-6">Saved Charts</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {savedCharts.map((chart: any, index: number) => (
          <div
            key={index}
            className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300"
          >
            <div className="card-body p-4">
              <h2 className="card-title text-xl font-bold text-gray-800">
                Chart Type: {chart.chartType}
              </h2>
              <p className="text-sm text-gray-500">
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
