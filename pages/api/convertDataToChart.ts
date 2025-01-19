import { getGeminiKey } from "@/app/utils/geminiCalls";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextApiRequest, NextApiResponse } from "next";

interface RawData {
  [key: string]: number | string; // Allows dynamic keys
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    tension?: number;
    fill?: boolean;
  }[];
}

interface ChartOptions {
  responsive: boolean;
  plugins: {
    legend: { position: string };
    title: { display: boolean; text: string };
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).send({ error: "Only POST requests are allowed" });
  }

  const { rawData } = req.body;

  if (!rawData) {
    return res.status(400).send({ error: "Raw data is required." });
  }

  try {
    const prompt = `Analyze the provided raw data and determine the most suitable chart type for visualization. The chart type must be one of the following: "bar", "line", "pie", "doughnut", "radar", "polarArea", "bubble", or "scatter". Based on the data, format the output in JSON with the following structure:

{
    "recommendedChartType": "string", // The recommended chart type (e.g., "bar", "line", etc.)
    "formattedData": [ // The formatted data suitable for input to formatDataForChart
        {
        "label": "string", // The label for this data point
        "value": number     // The numerical value for this data point
        }
    ],
    "datasetLabel": "string" // A meaningful label for the dataset based on the context of the raw data
}

Constraints:
1. Choose the chart type that best represents the data.
2. Use the key names in the raw data to infer meaningful labels for the data points and the dataset.
3. If the raw data contains only numerical values without labels, generate labels such as "Point 1", "Point 2", etc.

Input raw data:
${JSON.stringify(rawData)}

Output only the JSON result with no additional commentary.`;

    const GEMINI_API_KEY = getGeminiKey();
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const chat = model.startChat({
      generationConfig: {
        maxOutputTokens: 500,
      },
    });

    const result: any = await chat.sendMessage(prompt);
  //  console.log(`result is ${JSON.stringify(result)}`);
    const output = result.response.candidates[0].content.parts[0].text;
    console.log('output is', output);
    const cleanOutput = output
    .replace(/```json\s*/g, "") // Remove the opening ```json marker
    .replace(/```/g, "")        // Remove the closing ```
    .trim();                    // Remove leading/trailing whitespace
  
 // console.log("Clean Output:", cleanOutput);
  console.log('json raw data', cleanOutput);
    const rawDataJson = JSON.parse(cleanOutput);
  

    // Format the data for Chart.js
    const { chartData, chartOptions } = formatDataForChart(
      rawDataJson.formattedData,
      rawDataJson.recommendedChartType,
      rawDataJson.datasetLabel
    );

    // Return the formatted data
    res.status(200).json({ chartData, chartOptions, chartType: rawDataJson.recommendedChartType });
  } catch (error) {
    console.error("Data Formatting Error:", error);
    res.status(500).send({ error: "Failed to process the data." });
  }
}

const formatDataForChart = (
    rawData: RawData[],
    chartType: string,
    datasetLabel: string = "Dataset Label"
  ): { chartData: ChartData; chartOptions: ChartOptions } => {
    if (!rawData || rawData.length === 0) {
      throw new Error("Raw data is empty or undefined");
    }
  
    // Ensure the raw data has the expected structure
    const hasLabelAndValue = rawData.every(
      (item) => "label" in item && "value" in item
    );
    if (!hasLabelAndValue) {
      throw new Error("Raw data must have 'label' and 'value' keys in each entry.");
    }
  
    // Extract labels and values from raw data
    const labels = rawData.map((item) => item.label as string); // Extract labels
    const values = rawData.map((item) => item.value as number); // Extract values
  
    // Prepare Chart.js data structure
    const chartData: ChartData = {
      labels,
      datasets: [
        {
          label: datasetLabel,
          data: values,
          backgroundColor: chartType === "bar" ? "rgba(75, 192, 192, 0.2)" : undefined,
          borderColor: "rgba(75, 192, 192, 1)",
          fill: chartType === "line" || chartType === "polarArea",
          tension: chartType === "line" ? 0.4 : 0,
        },
      ],
    };
  
    // Default Chart.js options
    const chartOptions: ChartOptions = {
      responsive: true,
      plugins: {
        legend: { position: "top" },
        title: { display: true, text: `${datasetLabel}` },
      },
    };
  
    return { chartData, chartOptions };
  };
  