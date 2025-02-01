import React, { useEffect } from "react";
import WarningIcon from "@mui/icons-material/Warning";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CloseIcon from "@mui/icons-material/Close";
import { useRouter } from "next/navigation";
import i18n from "@/i18n";
import { useTranslation } from "react-i18next";
import { locales } from "@/locales";
import { useUser } from "../context/UserContext";

interface PopupMessageProps {
  message: string;
  type: string;
  onClose: () => void;
}

const PopupMessage = ({ message, type, onClose }: PopupMessageProps) => {
  const router = useRouter();
  const { userDetails } = useUser();
  const { t } = useTranslation();

  useEffect(() => {
    if (userDetails?.language) {
      i18n.changeLanguage(locales[userDetails.language]);
    }
  }, [userDetails?.language]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-gray-800 p-6 rounded-xl shadow-xl max-w-lg w-full transform transition-all duration-300 ease-in-out scale-100 opacity-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-3xl text-gray-400 hover:text-red-500 transition duration-200"
        >
          <CloseIcon fontSize="large" />
        </button>
        <div className="flex flex-col items-center space-y-4">
          {type === "error" ? (
            <WarningIcon className="text-red-500" fontSize="large" />
          ) : (
            <CheckBoxIcon className="text-green-500" fontSize="large" />
          )}
          <h2 className="text-2xl font-semibold text-white">
            {type === "error" ? t("error") : t("success")}
          </h2>
          <p className="text-gray-300 text-center">{message}</p>
          <button
            onClick={() =>
              type === "error" ? onClose() : router.push("/savedContent")
            }
            className="w-full py-3 mt-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-lg transform transition duration-300 ease-in-out"
          >
            {type === "error" ? t("close") : t("savedContent")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupMessage;
