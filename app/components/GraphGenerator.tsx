"use client";

import React, { useState } from "react";
import { askSQLQuestion } from "../utils/geminiCalls";
import {
  getChartFormatFromRawData,
  sendSQLQuerytoBigQuery,
} from "../utils/bigQuery";
import Graph from "./dashboard/Graph";
import { useUser } from "../context/UserContext";
import { saveChart } from "@/firebase";
import { parseSQL } from "../utils/helper";

interface GraphProps {
  chartType: string;
  chartData: any;
  chartOptions?: any;
}

const GraphGenerator = () => {
  const { userId } = useUser();
  const [userPrompt, setUserPrompt] = useState("");
  const [error, setError] = useState("");
  const [response, setResponse] = useState("");
  const [graphDetails, setGraphDetails] = useState<GraphProps>();
  const [saving, setSaving] = useState(false);
  const [chartName, setChartName] = useState("");
  const [customDataLabels, setCustomDataLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

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
    setResponse("");

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
    } catch (err) {
      console.error("Error asking SQL question:", err);
      setError(
        "An error occurred while generating the chart. Please check your query and try again."
      );
    } finally {
      setLoading(false);
      setLoadingProgress(0);
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
      } else if (response.success) {
        setResponse(response.success);
      }
    } catch (error: any) {
      console.error("Error saving chart:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-base-200 p-4">
      <div className="w-full max-w-md p-6 shadow-lg bg-white rounded-lg">
        <h1 className="text-3xl font-bold text-center text-primary mb-4">
          Generate a Chart
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            className="textarea textarea-bordered w-full"
            placeholder="Enter your SQL question here..."
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
          ></textarea>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className={`btn btn-primary w-full ${
              loading ? "btn-disabled" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Generating Chart..." : "Submit"}
          </button>
        </form>
        {loading && (
          <div className="mt-4 flex flex-col items-center space-y-2">
            <div className="spinner border-t-4 border-primary h-12 w-12 rounded-full animate-spin"></div>
            <p className="text-gray-600">
              Loading... {loadingProgress}% complete
            </p>
          </div>
        )}
        {response && (
          <div className="mt-4 p-4 bg-green-100 text-green-700 rounded">
            <pre className="whitespace-pre-wrap">{response}</pre>
          </div>
        )}
      </div>
      {graphDetails && (
        <div className="mt-8 w-full max-w-4xl p-6 bg-white rounded-lg shadow-lg">
          <div className="mb-4 text-center">
            <h2
              contentEditable
              suppressContentEditableWarning
              className="text-2xl font-bold border-b-2 border-gray-300 focus:border-primary outline-none"
              onBlur={(e) =>
                handleNameChange(e.currentTarget.textContent || "")
              }
            >
              {chartName || "Generated Chart"}
            </h2>
          </div>
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
                className="bg-gray-100 px-4 py-2 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-primary"
                onBlur={(e) =>
                  handleLabelChange(index, e.currentTarget.textContent || "")
                }
              >
                {label}
              </div>
            ))}
          </div>
          <button
            onClick={saveChartToFirebase}
            className={`btn btn-success mt-6 w-full ${
              saving ? "btn-disabled" : ""
            }`}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Graph"}
          </button>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default GraphGenerator;
