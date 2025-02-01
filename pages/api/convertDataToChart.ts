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

  const { query, rawData } = req.body;

  if (!rawData) {
    return res.status(400).send({ error: "Raw data is required." });
  }

  try {
    const prompt = `Analyze the provided raw data and determine the most suitable chart type for visualization. The output must be in this JSON format:

{
    "recommendedChartType": "string", // Recommended chart type: "bar", "line", "pie", "doughnut", "radar", "polarArea", "bubble", or "scatter".
    "formattedData": [ // Data formatted for charting with meaningful labels and values.
        {
            "label": "string", // A meaningful label derived from the context of the input query or raw data.
            "value": number    // The numerical value for this data point.
        }
    ],
    "datasetLabel": "string" // A specific and relevant name summarizing the dataset.
}

### Instructions:
1. **Context Sensitivity**: Use the input query or raw data context to infer precise labels and dataset names. For example:
   - If the query is "What is the average exit velocity?" and the raw data contains numerical averages, use "Average Exit Velocity" as the datasetLabel and avoid generic labels like "Point 1".
   - If no specific query or raw data keys are clear, use concise and descriptive placeholders (e.g., "Point 1", "Point 2").
2. **Chart Type Selection**: Choose a chart type that best communicates the data's insights and relationships:
   - Prefer "bar" or "line" for trends, "pie" or "doughnut" for proportions, etc.
3. **Label Inference**: Derive meaningful labels for data points from:
   - Raw data keys or structure.
   - Context provided by the input query.
   - Any descriptive fields in the raw data (e.g., "Exit Velocity" for averages or "Team" for categories).
4. **Data Filtering**: For large datasets, include only the most relevant or top 10 data points. If unsure, prioritize concise, representative data.
5. **Formatting**: Ensure all output values are well-structured and usable by charting libraries.

### Input:
Query: "${query}"
Raw Data:
${JSON.stringify(rawData)}

### Constraints:
- Avoid overly generic placeholders unless no better alternatives are available.
- Ensure the datasetLabel reflects the main concept or question being analyzed.
- Output only the JSON result, without any additional commentary or explanation.
`;

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
    // console.log('output is', output);
    const cleanOutput = output
    .replace(/```json\s*/g, "") // Remove the opening ```json marker
    .replace(/```/g, "")        // Remove the closing ```
    .trim();                    // Remove leading/trailing whitespace
  
 // console.log("Clean Output:", cleanOutput);
  // console.log('json raw data', cleanOutput);
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
  