"use client";

import React, { useState, useEffect } from "react";
import { getSavedArticles } from "@/firebase";
import { useUser } from "../context/UserContext";
import { convertTimestampToDate, downloadPDF } from "../utils/helper";
import ArticleModal from "./ArticleModal";
import ArticleDownloadButton from "../components/ArticleDownloadButton";

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
      <div className="p-6">
        <h1 className="text-4xl font-semibold text-center mb-6">
          Saved Articles
        </h1>
        <p className="text-center text-gray-600">
          Please log in to view your saved articles.
        </p>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center text-gray-600">Loading articles...</div>;
  }

  const openModal = (article: any) => {
    setSelectedArticle(article); // Store selected article data
    setIsModalOpen(true); // Open the modal
  };

  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
  };

  return (
    <div className="p-6">
      <h1 className="text-4xl font-semibold text-center mb-6">
        Saved Articles
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {savedArticles.map((article: any, index: number) => (
          <div
            key={index}
            className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300"
          >
            <div className="card-body p-4">
              <h2 className="card-title text-xl font-bold text-gray-800">
                {article.articleTitle}
              </h2>
              <p className="text-sm text-gray-500">
                Saved on:{" "}
                {convertTimestampToDate(
                  article.savedDate.toString()
                ).toString()}
              </p>
              <p className="text-sm text-gray-700 mt-2">
                {article.articleSummary || "No summary available."}
              </p>
              <div className="card-actions justify-end mt-4">
                <ArticleDownloadButton
                  articleContent={article.articleContent}
                  articleTitle={article.articleTitle}
                />

                <button
                  onClick={() => openModal(article)}
                  className="btn btn-primary bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg"
                >
                  Read More
                </button>
              </div>
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
