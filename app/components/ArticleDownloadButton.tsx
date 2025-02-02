import React, { useEffect } from "react";
import { downloadPDF } from "../utils/helper";
import { useTranslation } from "react-i18next";
import { locales } from "@/locales";
import { useUser } from "../context/UserContext";
import i18n from "@/i18n";

const ArticleDownloadButton = ({
  articleContent,
  articleTitle,
  loading = false,
  downloadLanguage = "English",
}: {
  articleContent: string;
  articleTitle: string;
  loading?: boolean;
  downloadLanguage?: string;
}) => {
  const { userDetails } = useUser();

  const { t } = useTranslation();

  useEffect(() => {
    if (userDetails?.language) {
      i18n.changeLanguage(locales[userDetails.language]);
    }
  }, [userDetails?.language]);

  return (
    <button
      onClick={() =>
        downloadPDF(articleContent, articleTitle, downloadLanguage)
      }
      className={`${
        loading
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-blue-700 hover:bg-blue-600"
      } text-white font-semibold py-2 px-4 rounded-lg transition duration-200`}
      disabled={loading}
    >
      {loading ? t("translating") : t("downloadPDF")}
    </button>
  );
};

export default ArticleDownloadButton;
