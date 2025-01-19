"use client";

import React, { useState } from "react";
import ArticleDownloadButton from "../components/ArticleDownloadButton";

// TODO: If lang switches, will want to disable to button and such, maybe a new button to regenerate translation?
interface ArticleModalProps {
  articleTitle: string;
  articleContent: string;
  closeModal: () => void;
}

const ArticleModal = ({
  articleTitle,
  articleContent,
  closeModal,
}: ArticleModalProps) => {
  const [language, setLanguage] = useState("en");

  // Function to handle language change
  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setLanguage(event.target.value);
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            {articleTitle}
          </h2>
          <button
            onClick={closeModal}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="text-gray-700 mb-4">
          <p>{articleContent}</p>
        </div>

        <div className="mt-4">
          <label
            htmlFor="language"
            className="text-sm font-medium text-gray-600"
          >
            Select Language:
          </label>
          <select
            id="language"
            value={language}
            onChange={handleLanguageChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="ja">Japanese</option>
          </select>
          <ArticleDownloadButton
            articleContent={articleContent}
            articleTitle={articleTitle}
          />
        </div>
      </div>
    </div>
  );
};

export default ArticleModal;
