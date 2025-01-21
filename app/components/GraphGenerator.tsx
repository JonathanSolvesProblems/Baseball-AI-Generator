import React, { useState } from "react";
import { askSQLQuestion } from "../utils/geminiCalls";
import {
  getChartFormatFromRawData,
  sendSQLQuerytoBigQuery,
} from "../utils/bigQuery";
import Graph from "./dashboard/Graph";
import { useUser } from "../context/UserContext";
import { saveChart } from "@/firebase";
import SendIcon from "@mui/icons-material/Send";
import { parseSQL } from "../utils/helper";

// https://mui.com/material-ui/material-icons/?query=send

interface GraphProps {
  chartType: string;
  chartData: any;
  chartOptions?: any;
}

const GraphGenerator = () => {
  const { userId } = useUser();
  const [userPrompt, setUserPrompt] = useState("");
  const [error, setError] = useState("");
  const [graphDetails, setGraphDetails] = useState<GraphProps>();
  const [saving, setSaving] = useState(false);
  const [chartName, setChartName] = useState("");
  const [customDataLabels, setCustomDataLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [completed, setCompleted] = useState(false);

  const handleNameChange = (newName: string) => {
    setChartName(newName);
    if (graphDetails) {
      setGraphDetails({
        ...graphDetails,
        chartOptions: {
          ...graphDetails.chartOptions,
          plugins: {
            ...graphDetails.chartOptions.plugins,
            title: {
              display: true,
              text: newName,
            },
          },
        },
      });
    }
  };

  const handleLabelChange = (index: number, newLabel: string) => {
    const updatedLabels = [...customDataLabels];
    updatedLabels[index] = newLabel;
    setCustomDataLabels(updatedLabels);

    if (graphDetails) {
      const updatedChartData = {
        ...graphDetails.chartData,
        labels: updatedLabels,
      };
      setGraphDetails({ ...graphDetails, chartData: updatedChartData });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userPrompt.trim()) {
      setError("Please enter a valid SQL question.");
      return;
    }

    setLoading(true);
    setLoadingProgress(0);
    setError("");
    setCompleted(false);

    try {
      setLoadingProgress(25);
      const result = await askSQLQuestion(userPrompt);

      const cleanedSQL = parseSQL(JSON.parse(result).res);

      setLoadingProgress(50);
      const data = await sendSQLQuerytoBigQuery(cleanedSQL);

      setLoadingProgress(75);
      const chartData = await getChartFormatFromRawData(userPrompt, data.data);

      setLoadingProgress(100);
      setGraphDetails({
        chartType: chartData.chartType,
        chartData: chartData.chartData,
        chartOptions: chartData.chartOptions,
      });
      setChartName("Generated Chart");
      setCustomDataLabels(chartData.chartData.labels || []);
      setUserPrompt("");

      setTimeout(() => {
        setCompleted(true);
      }, 500);
    } catch (err) {
      console.error("Error asking SQL question:", err);
      setError(
        "An error occurred while generating the chart. Please check your query and try again: " +
          err
      );
    } finally {
      setLoading(false);
    }
  };

  const saveChartToFirebase = async () => {
    if (!userId || !graphDetails) return;

    try {
      setSaving(true);
      setError("");
      const response = await saveChart(userId, graphDetails);
      if (response.error) {
        setError(response.error);
      }
    } catch (error: any) {
      console.error("Error saving chart:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] text-gray-200">
      {/* Chart and Progress Area */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="max-w-4xl mx-auto p-6 bg-[#121212] rounded-lg shadow-lg">
          {loading ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="spinner border-t-4 border-blue-500 h-16 w-16 rounded-full animate-spin"></div>
              <p className="text-lg font-bold">
                Generating Chart... {loadingProgress}%
              </p>
            </div>
          ) : graphDetails ? (
            <>
              <h2
                contentEditable
                suppressContentEditableWarning
                className="text-2xl font-bold text-center border-2 border-dashed border-blue-500 focus:ring-2 focus:ring-blue-500 rounded p-2 mb-4 outline-none bg-[#1b1b1b] text-white"
                onBlur={(e) =>
                  handleNameChange(e.currentTarget.textContent || "")
                }
              >
                {chartName || "Generated Chart"}
              </h2>
              <Graph
                chartType={graphDetails.chartType}
                chartData={graphDetails.chartData}
                chartOptions={graphDetails.chartOptions}
              />
              <div className="flex flex-wrap mt-4 gap-2">
                {customDataLabels.map((label, index) => (
                  <div
                    key={index}
                    contentEditable
                    suppressContentEditableWarning
                    className="bg-[#1b1b1b] px-4 py-2 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 hover:shadow-lg"
                    onBlur={(e) =>
                      handleLabelChange(
                        index,
                        e.currentTarget.textContent || ""
                      )
                    }
                  >
                    {label}
                  </div>
                ))}
              </div>
              {completed && (
                <div className="mt-4 text-center">
                  <p className="text-2xl font-bold text-green-500 animate-bounce">
                    🎉 Chart Generated Successfully! 🎉
                  </p>
                </div>
              )}
              <button
                onClick={saveChartToFirebase}
                className={`btn bg-blue-500 hover:bg-blue-600 mt-6 w-full ${
                  saving ? "btn-disabled" : ""
                }`}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Graph"}
              </button>
            </>
          ) : (
            <p className="text-center text-gray-500">No chart generated yet.</p>
          )}
        </div>
      </div>

      {/* Form Area */}
      <div className="w-full bg-[#121212] shadow-inner py-4">
        <form
          onSubmit={handleSubmit}
          className="flex items-center justify-center space-x-4"
        >
          <textarea
            className="textarea textarea-bordered bg-[#1b1b1b] text-white w-3/4 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your baseball question here of data you would like to visualize..."
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
          ></textarea>
          <button
            type="submit"
            className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:ring-blue-400 text-white rounded-full w-12 h-12 transition-transform duration-200 transform hover:scale-110"
            disabled={loading}
          >
            <div className="flex items-center justify-center w-full h-full">
              <SendIcon fontSize="small" />
            </div>
          </button>
        </form>
        {error && (
          <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
        )}
      </div>
    </div>
  );
};

export default GraphGenerator;
