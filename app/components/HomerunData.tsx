import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { getHomerunData } from "../utils/bigQuery";
import { deleteVideo, getSavedVideos, saveVideo } from "@/firebase";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import i18n from "@/i18n";
import { useTranslation } from "react-i18next";
import { locales } from "@/locales";
import { translateText } from "../utils/geminiCalls";

interface HomerunDataProps {
  playerName: string;
  homerunData: any[];
  setHomerunData: (homerunData: any[]) => void;
}

const HomerunData = ({
  playerName,
  homerunData,
  setHomerunData,
}: HomerunDataProps) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { userId, userDetails, savedVideos } = useUser();
  const [savedStates, setSavedStates] = useState<boolean[]>([]);
  const [translatedTitles, setTranslatedTitles] = useState<{
    [key: number]: string;
  }>({});
  const { t } = useTranslation();

  useEffect(() => {
    if (userDetails?.language) {
      i18n.changeLanguage(locales[userDetails.language]);
    }
  }, [userDetails?.language]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await getHomerunData(playerName);

      if (result && result.data) {
        setHomerunData(result.data);
      } else {
        setError("Failed to fetch homerun data.");
      }

      setLoading(false);
    };

    fetchData();
  }, [playerName]);

  useEffect(() => {
    if (savedVideos && homerunData) {
      const updatedSavedStates = homerunData.map((row) =>
        savedVideos.some((video) => video.videoUrl === row.Video)
      );
      setSavedStates(updatedSavedStates);
    }
  }, [savedVideos, homerunData]);

  const toggleSave = async (index: number) => {
    if (!userId) return;

    const video = homerunData[index];
    const updatedSavedStates = [...savedStates];
    const titleToSave = translatedTitles[index] || video.Title;

    try {
      if (savedStates[index]) {
        await deleteVideo(userId, video.Video);
      } else {
        await saveVideo(
          userId,
          video.Video,
          titleToSave,
          "",
          userDetails.language
        );
      }

      updatedSavedStates[index] = !savedStates[index];
      setSavedStates(updatedSavedStates);
    } catch (error) {
      console.error("Error saving or deleting content:", error);
    }
  };

  const handleTranslate = async (index: number, title: string) => {
    if (userDetails.language !== "English") {
      const translatedTitle = await translateText(title, userDetails.language);
      setTranslatedTitles((prev) => ({ ...prev, [index]: translatedTitle }));
    }
  };

  if (loading) {
    return <p className="text-center mt-4 text-white">Loading...</p>;
  }

  if (error) {
    return <p className="text-center mt-4 text-red-500">{error}</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-screen-xl">
      <h1 className="text-2xl font-bold text-white mb-4">
        {t("foundHomerunDataFor")} {playerName}
      </h1>

      <div className="overflow-x-auto bg-gray-900 shadow-lg rounded-lg">
        <table className="table w-full table-auto border-separate border-spacing-0 rounded-lg">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-4 py-2 text-left">{t("title")}</th>
              <th className="px-4 py-2 text-left">{t("video")}</th>
              <th className="px-4 py-2 text-left">{t("exitVelocity")}</th>
              <th className="px-4 py-2 text-left">{t("hitDistance")}</th>
              <th className="px-4 py-2 text-left">{t("launchAngle")}</th>
              <th className="px-4 py-2 text-left">{t("year")}</th>
              <th className="px-4 py-2 text-left">{t("postSeason")}</th>
              <th className="px-4 py-2 text-left">{t("save")}</th>
              {userDetails.language !== "English" && (
                <th className="px-4 py-2 text-left">{t("translate")}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {homerunData.map((row: any, index: number) => (
              <tr
                key={index}
                className="hover:bg-blue-600 cursor-pointer transition duration-200"
              >
                <td className="px-4 py-2 text-white">
                  {translatedTitles[index] || row.Title}
                </td>
                <td className="px-4 py-2 text-white">
                  <a
                    href={row.Video}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {t("watchVideo")}
                  </a>
                </td>
                <td className="px-4 py-2 text-white">{row.ExitVelocity}</td>
                <td className="px-4 py-2 text-white">{row.HitDistance}</td>
                <td className="px-4 py-2 text-white">{row.LaunchAngle}</td>
                <td className="px-4 py-2 text-white">{row.Year}</td>
                <td className="px-4 py-2 text-white">{row.IsPostSeason}</td>
                <td className="px-4 py-2">
                  <button onClick={() => toggleSave(index)}>
                    {savedStates[index] ? (
                      <FavoriteIcon className="text-yellow-500" />
                    ) : (
                      <FavoriteBorderIcon className="text-gray-500" />
                    )}
                  </button>
                </td>
                {userDetails.language !== "English" && (
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleTranslate(index, row.Title)}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none transition duration-200"
                    >
                      {t("translate")}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HomerunData;
