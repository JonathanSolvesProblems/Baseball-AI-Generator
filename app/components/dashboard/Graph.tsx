import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  Line,
  Bar,
  Pie,
  Doughnut,
  Radar,
  PolarArea,
  Bubble,
  Scatter,
} from "react-chartjs-2";

// Register Chart.js components globally
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const chartComponents: Record<string, React.ElementType> = {
  bar: Bar,
  line: Line,
  pie: Pie,
  doughnut: Doughnut,
  radar: Radar,
  polarArea: PolarArea,
  bubble: Bubble,
  scatter: Scatter,
};

interface GraphProps {
  chartType: string;
  chartData: any;
  chartOptions?: any;
}

const Graph: React.FC<GraphProps> = ({
  chartType,
  chartData,
  chartOptions,
}) => {
  const ChartComponent = chartComponents[chartType];

  if (!ChartComponent) {
    return (
      <div>
        <p className="text-red-500">
          Error: Unsupported chart type "{chartType}". Please use one of:{" "}
          {Object.keys(chartComponents).join(", ")}.
        </p>
      </div>
    );
  }

  return (
    <div className="graph-container">
      <ChartComponent data={chartData} options={chartOptions} />
    </div>
  );
};

export default Graph;
