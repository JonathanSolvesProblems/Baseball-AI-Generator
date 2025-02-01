"use client";

import React, { useState, useEffect } from "react";
import { deleteArticle, getSavedArticles } from "@/firebase";
import { useUser } from "../context/UserContext";
import CloseIcon from "@mui/icons-material/Close";
import ArticleModal from "./ArticleModal";
import ArticleDownloadButton from "../components/ArticleDownloadButton";
import i18n from "@/i18n";
import { useTranslation } from "react-i18next";
import { locales } from "@/locales";
import { isValidUrl } from "../utils/helper";

const SavedArticlesList = () => {
  const { userId, userDetails } = useUser();
  const [savedArticles, setSavedArticles] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { t } = useTranslation();

  useEffect(() => {
    if (userDetails?.language) {
      i18n.changeLanguage(locales[userDetails.language]);
    }
  }, [userDetails?.language]);

  useEffect(() => {
    const fetchArticles = async () => {
      if (!userId) return;

      setLoading(true);
      try {
        const articles = await getSavedArticles(userId);
        setSavedArticles(articles);
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [userId]);

  if (!userId) {
    return (
      <div className="p-6 bg-[#0a0a0a] min-h-screen text-gray-200">
        <h1 className="text-4xl font-semibold text-center mb-6">
          {t("savedArticles")}
        </h1>
        <p className="text-center text-gray-400">{t("articleLoginMsg")}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center text-gray-600">{t("loadingArticles")}</div>
    );
  }

  const removeArticle = async (userId: string, articleTitle: string) => {
    try {
      setSavedArticles((prev: any) =>
        prev.filter((article: any) => article.articleTitle !== articleTitle)
      );
      await deleteArticle(userId, articleTitle);
    } catch (error) {
      console.error("Error deleting article:", error);
    }
  };

  const openModal = (article: any) => {
    setSelectedArticle(article); // Store selected article data
    setIsModalOpen(true); // Open the modal
  };

  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
  };

  return (
    <div className="p-6 bg-[#0a0a0a] min-h-screen text-gray-200">
      <h1 className="text-4xl font-semibold text-center mb-6">
        {t("savedArticles")}
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {savedArticles.map((article: any, index: number) => (
          <div
            key={index}
            className="card bg-gray-800 text-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg relative"
          >
            <button
              className="absolute top-2 right-2 bg-gray-900 hover:bg-gray-700 text-white rounded-full p-1 transition duration-200"
              onClick={(e) => {
                e.stopPropagation();
                removeArticle(userId, article.articleTitle);
              }}
              aria-label="Delete article"
            >
              <CloseIcon fontSize="small" />
            </button>

            <div className="card-body p-4">
              <h2 className="card-title text-xl font-bold text-gray-200">
                {article.articleTitle}
              </h2>
              {isValidUrl(article.articleContent) ? (
                <div className="card-actions justify-end mt-4">
                  <a
                    href={article.articleContent}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-700 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                  >
                    {t("source")}
                  </a>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-300 mt-2">
                    {article.articleSummary || t("noSummary")}
                  </p>
                  <div className="card-actions justify-end mt-4">
                    <ArticleDownloadButton
                      articleContent={article.articleContent}
                      articleTitle={article.articleTitle}
                    />

                    <button
                      onClick={() => openModal(article)}
                      className="bg-blue-700 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                    >
                      {t("readMore")}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && selectedArticle && (
        <ArticleModal
          articleTitle={selectedArticle.articleTitle}
          articleContent={selectedArticle.articleContent}
          closeModal={closeModal}
        />
      )}
    </div>
  );
};

export default SavedArticlesList;
