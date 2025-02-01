"use client";

import React, { useEffect, useState } from "react";
import ArticleDownloadButton from "../components/ArticleDownloadButton";
import MinimizeIcon from "@mui/icons-material/Minimize";
import i18n from "@/i18n";
import { useTranslation } from "react-i18next";
import { locales } from "@/locales";
import { useUser } from "../context/UserContext";

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
  const { userDetails } = useUser();
  const [language, setLanguage] = useState("en");
  const { t } = useTranslation();

  useEffect(() => {
    if (userDetails?.language) {
      i18n.changeLanguage(locales[userDetails.language]);
    }
  }, [userDetails?.language]);

  // Function to handle language change
  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setLanguage(event.target.value);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-gray-900 text-gray-200 p-6 rounded-lg shadow-lg max-w-lg w-full relative">
        {/* Minimize Icon Button */}
        <button
          onClick={closeModal} // Keep the closeModal function, you can customize its behavior
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-200"
        >
          <MinimizeIcon fontSize="large" /> {/* Minimize icon */}
        </button>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-200">
            {articleTitle}
          </h2>
        </div>

        <div className="text-gray-300 mb-4 max-h-96 overflow-y-auto">
          <p>{articleContent}</p>
        </div>

        <div className="mt-4">
          <label
            htmlFor="language"
            className="text-sm font-medium text-gray-400"
          >
            {t("selectLanguage")}:
          </label>
          <select
            id="language"
            value={language}
            onChange={handleLanguageChange}
            className="mt-1 block w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="en">{t("english")}</option>
            <option value="es">{t("spanish")}</option>
            <option value="ja">{t("japanese")}</option>
          </select>
          <div className="mt-4">
            <ArticleDownloadButton
              articleContent={articleContent}
              articleTitle={articleTitle}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleModal;
