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

// TODO: User feedback at each step
const GraphGenerator = () => {
  const { userId } = useUser();
  const [userPrompt, setUserPrompt] = useState("");
  const [error, setError] = useState("");
  const [response, setResponse] = useState("");
  const [graphDetails, setGraphDetails] = useState<GraphProps>();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResponse("");
    if (!userPrompt.trim()) {
      setError("Please enter a valid SQL question.");
      return;
    }

    try {
      setError(""); // Clear any existing error
      const result = await askSQLQuestion(userPrompt); // Returns plain text response
      const cleanedSQL = parseSQL(JSON.parse(result).res); // Extract the clean SQL query
      console.log(`SQL query generated: ${cleanedSQL}`);

      const data = await sendSQLQuerytoBigQuery(cleanedSQL);
      console.log(`Query results: ${data}`);
      console.log(`Query results: ${data.data}`);

      const chartData = await getChartFormatFromRawData(data.data);
      console.log(`Chart data: ${chartData}`);

      // setResponse(JSON.stringify(chartData, null, 2));
      setGraphDetails({
        chartType: chartData.chartType,
        chartData: chartData.chartData,
        chartOptions: chartData.chartOptions,
      });
      setUserPrompt(""); // Clear input after successful submission
    } catch (err) {
      console.error("Error asking SQL question:", err);
      setError("An error occurred. Please try again.");
    }
  };

  const saveChartToFirebase = async () => {
    if (!userId) return;

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-base-200">
      <div className="w-full max-w-md p-6 shadow-lg bg-white rounded-lg">
        <h1 className="text-2xl font-bold text-center mb-4">
          Ask an SQL Question
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            className="textarea textarea-bordered w-full"
            placeholder="Enter your SQL question here..."
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
          ></textarea>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="btn btn-primary w-full">
            Submit
          </button>
        </form>
        {response && (
          <div className="mt-4 p-4 bg-green-100 text-green-700 rounded">
            <pre className="whitespace-pre-wrap">{response}</pre>
          </div>
        )}
      </div>
      {graphDetails && (
        <div className="mt-8 w-full max-w-4xl">
          <Graph
            chartType={graphDetails.chartType}
            chartData={graphDetails.chartData}
            chartOptions={graphDetails.chartOptions}
          />
          <button
            onClick={saveChartToFirebase}
            className={`btn btn-success mt-4 ${saving ? "btn-disabled" : ""}`}
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
