"use client";
import { useState } from "react";
import { generateImage } from "../utils/imagen";

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [sampleCount, setSampleCount] = useState(1); // Default sample count
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateImage = async () => {
    setLoading(true);
    setError(null);
    setGeneratedImages([]);

    try {
      const data = await generateImage(prompt, sampleCount);

      console.log(`Image data: ${JSON.stringify(data)}`);

      // Assuming the API returns an array of image URLs in `predictions`
      setGeneratedImages(data.predictions.map((item: any) => item.imageUri));
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSampleCountChange = (value: number) => {
    // Ensure sampleCount stays between 1 and 4
    setSampleCount(Math.min(4, Math.max(1, value)));
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-base-200 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-4 text-center">Generate Image</h1>
      <div className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Enter your prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="input input-bordered w-full"
        />
        <input
          type="number"
          min="1"
          max="4"
          placeholder="Enter sample count (1-4)"
          value={sampleCount}
          onChange={(e) => handleSampleCountChange(Number(e.target.value))}
          className="input input-bordered w-full"
        />
        <button
          onClick={handleGenerateImage}
          className={`btn btn-primary ${loading ? "btn-disabled" : ""}`}
          disabled={loading}
        >
          {loading ? (
            <span className="loading loading-spinner text-secondary"></span>
          ) : (
            "Generate Image"
          )}
        </button>
        {error && (
          <p className="text-error text-sm text-center mt-2">{error}</p>
        )}
      </div>
      {generatedImages.length > 0 && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {generatedImages.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Generated ${index + 1}`}
              className="rounded shadow-md w-full"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGenerator;
