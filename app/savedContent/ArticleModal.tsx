"use client";

import React, { useEffect, useState } from "react";
import ArticleDownloadButton from "../components/ArticleDownloadButton";
import MinimizeIcon from "@mui/icons-material/Minimize";
import i18n from "@/i18n";
import { useTranslation } from "react-i18next";
import { locales } from "@/locales";
import { useUser } from "../context/UserContext";
import { translateText } from "../utils/geminiCalls";

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
  const [language, setLanguage] = useState("English");
  const [translatedTitle, setTranslatedTitle] = useState(articleTitle);
  const [translatedContent, setTranslatedContent] = useState(articleContent);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (userDetails?.language) {
      i18n.changeLanguage(locales[userDetails.language]);
    }
  }, [userDetails?.language]);

  useEffect(() => {
    const translateIfNeeded = async () => {
      if (
        language !== "English" &&
        (language === "Spanish" || language === "Japanese")
      ) {
        setLoading(true);
        try {
          const translatedTitle = await translateText(articleTitle, language);
          const translatedContent = await translateText(
            articleContent,
            language
          );
          setTranslatedTitle(translatedTitle);
          setTranslatedContent(translatedContent);
        } catch (error) {
          console.error("Translation error:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setTranslatedTitle(articleTitle);
        setTranslatedContent(articleContent);
      }
    };

    translateIfNeeded();
  }, [language, articleTitle, articleContent]);

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
            <option value="English">{t("english")}</option>
            <option value="Spanish">{t("spanish")}</option>
            <option value="Japanese">{t("japanese")}</option>
          </select>
          <div className="mt-4">
            <ArticleDownloadButton
              articleContent={translatedContent}
              articleTitle={translatedTitle}
              loading={loading}
              downloadLanguage={language}
            />
            {loading && (
              <div className="text-sm text-gray-400 mt-2">
                {t("translating")}...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleModal;
