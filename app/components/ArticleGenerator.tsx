// can add a user preference as well for users to personalize the type of articles that are generated for them
"use client";
import React, { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import {
  askSQLQuestion,
  generatePersonalizedArticle,
} from "../utils/geminiCalls";
import { downloadPDF, parseSQL } from "../utils/helper";
import { generateArticleText, sendSQLQuerytoBigQuery } from "../utils/bigQuery";
import { saveArticle } from "@/firebase";
import ArticleDownloadButton from "./ArticleDownloadButton";

// daily article idea, and allow users to change that.
const ArticleGenerator = () => {
  const { userId, followedPlayers, userDetails } = useUser();
  const [article, setArticle] = useState<string>("");
  const [articleTitle, setArticleTitle] = useState<string>("");

  useEffect(() => {
    const fetchArticle = async () => {
      if (!userId) return;

      const result = await generateArticleText(
        userId,
        followedPlayers,
        userDetails.language
      );

      if (result) {
        setArticle(result.article);
        setArticleTitle(result.title);
      }
    };

    fetchArticle();
  }, [userId, followedPlayers]);

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white shadow-xl rounded-lg">
      <h2 className="text-2xl font-semibold text-center mb-6">
        {articleTitle || "loading title..."}
      </h2>
      {article ? (
        <div className="prose text-black max-w-none">{article}</div>
      ) : (
        <p className="text-center text-gray-500">Loading article...</p>
      )}

      {/* Download PDF Button */}
      <div className="flex justify-center mt-6">
        <ArticleDownloadButton
          articleContent={article}
          articleTitle={articleTitle}
        />

        {userId && (
          <button
            onClick={() => saveArticle(userId, article, articleTitle)}
            className="btn btn-secondary rounded-full px-6 py-2"
          >
            Save Article
          </button>
        )}
      </div>
    </div>
  );
};

export default ArticleGenerator;
