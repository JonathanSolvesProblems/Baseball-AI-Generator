import React from "react";
import { downloadPDF } from "../utils/helper";

const ArticleDownloadButton = ({
  articleContent,
  articleTitle,
}: {
  articleContent: string;
  articleTitle: string;
}) => {
  return (
    <button
      onClick={() => downloadPDF(articleContent, articleTitle)}
      className="bg-blue-700 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
    >
      Download PDF
    </button>
  );
};

export default ArticleDownloadButton;
