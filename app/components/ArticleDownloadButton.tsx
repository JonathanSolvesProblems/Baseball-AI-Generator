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
      className="btn btn-primary rounded-full px-6 py-2 mr-4"
    >
      Download PDF
    </button>
  );
};

export default ArticleDownloadButton;
