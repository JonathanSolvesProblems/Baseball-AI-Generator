"use client";

import React, { useState, useEffect } from "react";
import { deleteArticle, getSavedArticles } from "@/firebase";
import { useUser } from "../context/UserContext";
import CloseIcon from "@mui/icons-material/Close";
import ArticleModal from "./ArticleModal";
import ArticleDownloadButton from "../components/ArticleDownloadButton";

// Function to check if a string is a valid URL
const isValidUrl = (str: string) => {
  const pattern = /^(https?:\/\/[^\s$.?#].[^\s]*)$/;
  return pattern.test(str);
};

const SavedArticlesList = () => {
  const { userId } = useUser();
  const [savedArticles, setSavedArticles] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
          Saved Articles
        </h1>
        <p className="text-center text-gray-400">
          Please log in to view your saved articles.
        </p>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center text-gray-600">Loading articles...</div>;
  }

  const removeArticle = async (userId: string, articleTitle: string) => {
    try {
      // Call your delete function here, you may already have this implemented
      // Example: await deleteArticleByTitle(userId, articleTitle);
      // console.log(`Article '${articleTitle}' deleted`);
      // Optionally remove the article from the state as well
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
        Saved Articles
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
              {/* <p className="text-sm text-gray-400">
                Saved on:{" "}
                {convertTimestampToDate(
                  article.savedDate.toString()
                ).toString()}
              </p> */}
              {isValidUrl(article.articleContent) ? (
                <div className="card-actions justify-end mt-4">
                  <a
                    href={article.articleContent}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-700 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                  >
                    Source
                  </a>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-300 mt-2">
                    {article.articleSummary || "No summary available."}
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
                      Read More
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
