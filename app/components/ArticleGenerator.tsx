// can add a user preference as well for users to personalize the type of articles that are generated for them
"use client";
import React, { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import {
  askSQLQuestion,
  generatePersonalizedArticle,
} from "../utils/geminiCalls";
import { downloadPDF, parseSQL } from "../utils/helper";
import { sendSQLQuerytoBigQuery } from "../utils/bigQuery";
import { saveArticle } from "@/firebase";

// daily article idea, and allow users to change that.
const ArticleGenerator = () => {
  const { userId, followedPlayers } = useUser();
  const [article, setArticle] = useState<string>("");
  const [articleTitle, setArticleTitle] = useState<string>("");

  useEffect(() => {
    const getRandomFollowedPlayer = () => {
      if (!followedPlayers.length) return null;

      const randomIndex = Math.floor(Math.random() * followedPlayers.length);
      return followedPlayers[randomIndex];
    };

    const generateArticleText = async () => {
      if (!followedPlayers.length) return; // Ensure both followedPlayer and csvData are available

      const randomPlayer = getRandomFollowedPlayer();

      if (!randomPlayer) return;

      const prompt = `Can you give me information related to player with id ${randomPlayer}`;

      try {
        const result = await askSQLQuestion(prompt); // Returns plain text response
        const cleanedSQL = parseSQL(JSON.parse(result).res); // Extract the clean SQL query
        console.log(`SQL query generated: ${cleanedSQL}`);

        const data = await sendSQLQuerytoBigQuery(cleanedSQL);
        console.log(`Query results: ${JSON.stringify(data)}`);
        console.log(`Query results: ${JSON.stringify(data.data)}`);

        const articleText = await generatePersonalizedArticle(data.data);
        console.log("article is " + articleText);
        setArticle(articleText);
        setArticleTitle(articleText.split("\n")[0] || "Personalized Article");
      } catch (err) {
        console.error("Error asking SQL question:", err);
      }
    };

    generateArticleText();
  }, [followedPlayers]);

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white shadow-xl rounded-lg">
      <h2 className="text-2xl font-semibold text-center mb-6">
        Your Personalized Article
      </h2>
      {article ? (
        <div className="prose text-black max-w-none">{article}</div>
      ) : (
        <p className="text-center text-gray-500">Loading article...</p>
      )}

      {/* Download PDF Button */}
      <div className="flex justify-center mt-6">
        <button
          onClick={() => downloadPDF(article, "personalized_article")}
          className="btn btn-primary rounded-full px-6 py-2 mr-4"
        >
          Download PDF
        </button>

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
