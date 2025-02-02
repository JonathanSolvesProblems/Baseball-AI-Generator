"use client";
import { useState, useEffect } from "react";
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";
import BookmarkRemoveIcon from "@mui/icons-material/BookmarkRemove";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SportsBaseballIcon from "@mui/icons-material/SportsBaseball";
import FollowedPlayerHomeRun from "../FollowedPlayerHomeRun";
import HideImageIcon from "@mui/icons-material/HideImage";
import ImageIcon from "@mui/icons-material/Image";
import { useUser } from "@/app/context/UserContext";
import {
  db,
  getSavedArticles,
  getSavedCharts,
  getSavedVideos,
  updateArticle,
  updateChartById,
} from "@/firebase";
import Graph from "./Graph";
import ArticleDownloadButton from "../ArticleDownloadButton";
import { isValidUrl } from "@/app/utils/helper";
import i18n from "@/i18n";
import { useTranslation } from "react-i18next";
import { locales } from "@/locales";
import MinimizeIcon from "@mui/icons-material/Minimize";
import ArticleModal from "@/app/savedContent/ArticleModal";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";

const BaseballDashboard = () => {
  const { userId, userDetails, followedPlayers } = useUser();
  const [savedArticles, setSavedArticles] = useState<any[]>();
  const [savedCharts, setSavedCharts] = useState<any[]>();
  const [savedVideos, setSavedVideos] = useState<any[]>();
  const [dashboardItems, setDashboardItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useTranslation();
  const [expandedChart, setExpandedChart] = useState<any>();
  const [loading, setLoading] = useState<boolean>(true);
  const [graphKey, setGraphKey] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [showVideoElement, setShowVideoElement] = useState(false);

  useEffect(() => {
    if (userDetails?.language) {
      i18n.changeLanguage(locales[userDetails.language]);
    }
  }, [userDetails?.language]);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      const articles = await getSavedArticles(userId);
      const charts = await getSavedCharts(userId);
      const videos = await getSavedVideos(
        userId,
        userDetails?.language || "English"
      );

      setSavedArticles(articles);
      setSavedCharts(charts);
      setSavedVideos(videos);
      await fetchDashboardItems();
    };
    fetchData();
  }, [userId]);

  const fetchSavedCharts = async () => {
    if (!userId) return;
    const charts = await getSavedCharts(userId);
    const sortedCharts = charts.sort(
      (a, b) =>
        new Date(b.savedDate).getTime() - new Date(a.savedDate).getTime()
    );
    setSavedCharts(sortedCharts);
    setLoading(false);
  };

  const fetchChartById = async (chartId: string) => {
    if (!userId) return null;
    const charts = await getSavedCharts(userId);
    return charts.find((chart) => chart.id === chartId) || null;
  };

  useEffect(() => {
    fetchSavedCharts();
  }, [userId]);

  const addToDashboard = async (item: any) => {
    if (!userId) return;

    const sanitizedItem = sanitizeItemData(item);

    const dashboardItemsSnapshot = await getDocs(
      collection(db, "users", userId, "dashboardItems")
    );

    const existingItems = dashboardItemsSnapshot.docs.map((doc) => doc.data());

    if (!existingItems.some((i) => i.id === sanitizedItem.id)) {
      const nextOrder = existingItems.length + 1;

      await addDoc(collection(db, "users", userId, "dashboardItems"), {
        id: sanitizedItem.id,
        type: sanitizedItem.articleTitle
          ? "article"
          : sanitizedItem.chartData
          ? "chart"
          : "video",
        order: nextOrder,
        saved: true,
        ...sanitizedItem,
      });

      setDashboardItems([...existingItems, { ...item, order: nextOrder }]);
    }
  };

  const sanitizeItemData = (item: any) => {
    const sanitizedItem: any = {};

    Object.keys(item).forEach((key) => {
      if (item[key] !== undefined && item[key] !== null) {
        sanitizedItem[key] = item[key];
      } else {
        if (key === "videoSummary") {
          sanitizedItem[key] = "";
        }
      }
    });

    return sanitizedItem;
  };
  const removeFromDashboard = async (id: string) => {
    if (!userId) return;

    const updatedDashboardItems = dashboardItems.filter(
      (item) => item.id !== id
    );
    setDashboardItems(updatedDashboardItems);

    try {
      const itemRef = doc(
        collection(db, "users", userId, "dashboardItems"),
        id
      );
      await deleteDoc(itemRef);

      updatedDashboardItems.forEach(async (item, index) => {
        const itemRef = doc(
          collection(db, "users", userId, "dashboardItems"),
          item.id
        );
        await updateDoc(itemRef, { order: index + 1 });
      });
    } catch (error) {
      console.error("Error removing item from dashboard:", error);

      setDashboardItems(dashboardItems);
    }
  };

  const filteredItems = [
    ...(savedArticles ?? []),
    ...(savedCharts ?? []),
    ...(savedVideos ?? []),
  ].filter(
    (item) =>
      item.articleTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.chartType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.videoName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openModal = (article: any) => {
    setSelectedArticle(article);
    setIsModalOpen(true); // Open the modal
  };

  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
  };

  const handleCloseExpandedChart = async () => {
    if (expandedChart && userId) {
      const updatedChart = await fetchChartById(expandedChart.id);
      if (updatedChart) {
        setExpandedChart(updatedChart);
        setGraphKey((prev) => prev + 1);
      }

      await fetchSavedCharts();
    }

    setExpandedChart(null);
  };

  const reorderDashboardItems = async (newOrder: any[]) => {
    if (!userId) return;
    for (let i = 0; i < newOrder.length; i++) {
      const itemRef = doc(
        collection(db, "users", userId, "dashboardItems"),
        newOrder[i].id
      );
      await updateDoc(itemRef, { order: i + 1 });
    }

    setDashboardItems(newOrder);
  };

  const fetchDashboardItems = async () => {
    if (!userId) return;

    try {
      const dashboardItemsSnapshot = await getDocs(
        query(
          collection(db, "users", userId, "dashboardItems"),
          orderBy("order")
        )
      );

      const fetchedItems = dashboardItemsSnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      setDashboardItems(fetchedItems);
    } catch (error) {
      console.error("Error fetching dashboard items:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-gray-200">
      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardItems.map((item) => (
            <div
              key={item.id}
              className="card bg-gray-800 p-4 rounded-lg relative"
            >
              <button
                className="absolute top-2 right-2 bg-gray-900 hover:bg-gray-700 text-white rounded-full p-1"
                onClick={() => removeFromDashboard(item.id)}
              >
                <BookmarkRemoveIcon fontSize="small" />
              </button>

              {"chartData" in item && (
                <div
                  className="card-body p-4"
                  onClick={() => setExpandedChart(item)}
                >
                  <div className="mt-4">
                    <Graph
                      chartType={item.chartType}
                      chartData={item.chartData}
                      chartOptions={item.chartOptions}
                    />
                  </div>
                </div>
              )}

              {"videoUrl" in item && item.videoUrl && (
                <div className="mt-4">
                  <h3 className="text-lg font-bold">{item.videoName}</h3>
                  <video className="w-full rounded-lg" controls>
                    <source src={item.videoUrl} type="video/mp4" />
                    {t("unSupportedVideoTag")}
                  </video>
                </div>
              )}

              {"articleContent" in item && (
                <div className="card-body p-4">
                  <h2 className="card-title text-xl font-bold text-gray-200">
                    {item.articleTitle}
                  </h2>
                  {isValidUrl(item.articleContent) ? (
                    <div className="card-actions justify-end mt-4">
                      <a
                        href={item.articleContent}
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
                        {item.articleSummary || t("noSummary")}
                      </p>
                      <div className="card-actions justify-end mt-4">
                        <ArticleDownloadButton
                          articleContent={item.articleContent}
                          articleTitle={item.articleTitle}
                        />
                        <button
                          onClick={() => openModal(item)}
                          className="bg-blue-700 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                        >
                          {t("readMore")}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div
        className={`transition-all duration-300 ${
          menuOpen ? "w-80" : "w-12"
        } bg-gray-900 p-4 relative`}
      >
        <button className="absolute -left-6 top-6 bg-gray-800 p-2 rounded-full text-white">
          {menuOpen ? (
            <KeyboardDoubleArrowRightIcon
              onClick={() => setMenuOpen(!menuOpen)}
            />
          ) : (
            <KeyboardDoubleArrowLeftIcon
              onClick={() => setMenuOpen(!menuOpen)}
            />
          )}

          <div className="absolute bottom-[-60px] left-1/2 transform -translate-x-1/2 cursor-pointer bg-gray-800 text-white rounded-full p-1">
            {showVideoElement ? (
              <>
                <HideImageIcon
                  fontSize="inherit"
                  className="text-4xl text-white"
                  onClick={() => setShowVideoElement(false)}
                />
              </>
            ) : (
              <>
                <ImageIcon
                  fontSize="inherit"
                  className="text-4xl text-white"
                  onClick={() => setShowVideoElement(true)}
                />
              </>
            )}
          </div>
        </button>

        {menuOpen && (
          <>
            <input
              type="text"
              placeholder="Search..."
              className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="overflow-y-auto max-h-[70vh]">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center bg-gray-800 p-2 mb-2 rounded"
                >
                  <span>
                    {item.articleTitle ||
                      item.videoName ||
                      item.chartData.datasets[0].label}
                  </span>
                  <button onClick={() => addToDashboard(item)}>
                    <LibraryAddIcon className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {isModalOpen && selectedArticle && (
        <ArticleModal
          articleTitle={selectedArticle.articleTitle}
          articleContent={selectedArticle.articleContent}
          closeModal={closeModal}
        />
      )}

      {expandedChart && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-11/12 sm:w-3/4 lg:w-1/2 relative text-gray-200">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={handleCloseExpandedChart}
            >
              <MinimizeIcon fontSize="large" />
            </button>

            <Graph
              key={graphKey} // Force re-render when key changes
              chartType={expandedChart.chartType}
              chartData={expandedChart.chartData}
              chartOptions={expandedChart.chartOptions}
            />
          </div>
        </div>
      )}

      {showVideoElement && (
        <div
          className={`fixed top-16 left-1/2 transform -translate-x-1/2 transition-all ease-in-out duration-300 ${
            isCollapsed ? "h-16 w-16" : "h-[480px] w-[800px]"
          } z-40 overflow-hidden border-4 border-gray-700 bg-gray-800 shadow-lg rounded-lg p-8`}
        >
          <FollowedPlayerHomeRun followedPlayers={followedPlayers} />

          <div
            className="absolute bottom-[-20px] left-1/2 transform -translate-x-1/2 cursor-pointer bg-gray-800 text-white rounded-full p-2 border-4 border-gray-700"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <>
                <SportsBaseballIcon
                  fontSize="inherit"
                  className="text-4xl text-white"
                />
                <KeyboardArrowDownIcon
                  fontSize="inherit"
                  className="text-4xl text-white"
                />
              </>
            ) : (
              <KeyboardArrowUpIcon
                fontSize="inherit"
                className="text-4xl text-white"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BaseballDashboard;
