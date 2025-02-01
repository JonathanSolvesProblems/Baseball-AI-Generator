"use client";
import React, { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import {
  auth,
  deleteUserAccount,
  getLoggedInUserDetails,
  getUserNotificationPreference,
  signOut,
  updateUserDetails,
  updateUserNotificationPreference,
} from "@/firebase";
import LogoutIcon from "@mui/icons-material/Logout";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import CloseIcon from "@mui/icons-material/Close";
import PublishIcon from "@mui/icons-material/Publish";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import { useRouter } from "next/navigation";
import i18n from "@/i18n";
import { useTranslation } from "react-i18next";
import { locales } from "@/locales";

const Profile = ({
  setIsModalOpen,
}: {
  setIsModalOpen(isModalOpen: boolean): void;
}) => {
  const { userId, userDetails } = useUser();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("accountSettings");
  const [firstName, setFirstName] = useState(userDetails?.firstName || "");
  const [lastName, setLastName] = useState(userDetails?.lastName || "");
  const [language, setLanguage] = useState(userDetails?.language || "English");
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">(
    userDetails?.notificationPreference?.frequency || "daily"
  );
  const [dayOfWeek, setDayOfWeek] = useState<string>(
    userDetails?.notificationPreference?.dayOfWeek || "Monday"
  );
  const [dayOfMonth, setDayOfMonth] = useState<number>(
    userDetails?.notificationPreference?.dayOfMonth || 1
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [subscribed, setSubscribed] = useState<boolean>(true);
  const { t } = useTranslation();

  useEffect(() => {
    if (userDetails?.language) {
      i18n.changeLanguage(locales[userDetails.language]);
    }
  }, [userDetails?.language]);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      // Fetch user details
      const userDetails: any = await getLoggedInUserDetails(userId);
      if (userDetails) {
        setFirstName(userDetails.firstName);
        setLastName(userDetails.lastName);
        setLanguage(userDetails.language);
      }

      // Fetch notification preferences
      const preferences = await getUserNotificationPreference(userId);
      if (preferences) {
        setFrequency(preferences.frequency || "daily");
        setDayOfWeek(preferences.dayOfWeek || "Monday");
        setDayOfMonth(preferences.dayOfMonth || 1);
        setSubscribed(preferences.subscribed !== false);
      }
    };

    fetchData();
  }, [userId]);

  const updateUserInfo = async () => {
    if (!userId) return;

    await updateUserDetails(userId, firstName, lastName, language);

    showSuccessMessage("Account settings updated successfully!");
    setIsModalOpen(false);

    const isLanguageChanged = language !== userDetails?.language;

    if (isLanguageChanged) {
      window.location.reload();
    }
  };

  const updateNotificationPreference = async () => {
    if (!userId) return;

    await updateUserNotificationPreference(
      userId,
      frequency,
      dayOfWeek,
      dayOfMonth,
      subscribed
    );
    showSuccessMessage("Account settings updated successfully!");
    setIsModalOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // console.log("User signed out successfully");
      router.push("/");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const removeAccount = async () => {
    if (userId) {
      await deleteUserAccount(userId);
      router.push("/");
      setIsModalOpen(false);
    }
  };

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000); // Fade away after 3 seconds
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-[#0a0a0a] text-gray-200 rounded-lg shadow-lg w-full max-w-md relative p-6">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-200"
          onClick={() => setIsModalOpen(false)}
        >
          <CloseIcon fontSize="large" />
        </button>

        <h2 className="text-2xl font-semibold text-center mb-6 flex items-center justify-center gap-2">
          <AccountBoxIcon fontSize="large" />
          {t("profile")}
        </h2>

        <div className="flex justify-center gap-4 mb-6">
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeTab === "accountSettings"
                ? "bg-gray-800 text-white"
                : "bg-gray-700 text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("accountSettings")}
          >
            {t("accountSettings")}
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeTab === "notificationPreferences"
                ? "bg-gray-800 text-white"
                : "bg-gray-700 text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("notificationPreferences")}
          >
            {t("notificationPreferences")}
          </button>
        </div>

        {activeTab === "accountSettings" && (
          <>
            <div className="form-control">
              <label htmlFor="firstName" className="label">
                <span className="label-text text-gray-400">
                  {t("firstName")}
                </span>
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="input input-bordered w-full bg-gray-800 text-gray-200"
              />
            </div>

            <div className="form-control mt-4">
              <label htmlFor="lastName" className="label">
                <span className="label-text text-gray-400">
                  {t("lastName")}
                </span>
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="input input-bordered w-full bg-gray-800 text-gray-200"
              />
            </div>

            <div className="form-control mt-4">
              <label htmlFor="language" className="label">
                <span className="label-text text-gray-400">
                  {t("preferredLanguage")}
                </span>
              </label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="select select-bordered w-full bg-gray-800 text-gray-200"
              >
                <option value="English">{t("english")}</option>
                <option value="Spanish">{t("spanish")}</option>
                <option value="Japanese">{t("japanese")}</option>
              </select>
            </div>

            <div className="form-control mt-6">
              <button
                type="button"
                onClick={updateUserInfo}
                className="btn btn-primary w-full flex items-center justify-center gap-2"
              >
                <PublishIcon />
                {t("submit")}
              </button>
            </div>

            <div className="form-control mt-4">
              <button
                type="button"
                onClick={handleSignOut}
                className="btn btn-secondary w-full flex items-center justify-center gap-2"
              >
                <LogoutIcon />
                {t("signOut")}
              </button>
            </div>

            <div className="form-control mt-4">
              <button
                type="button"
                onClick={removeAccount}
                className="btn btn-error w-full flex items-center justify-center gap-2"
              >
                <DeleteForeverIcon />
                {t("deleteAccount")}
              </button>
            </div>
          </>
        )}

        {activeTab === "notificationPreferences" && (
          <>
            <div className="form-control">
              <div className="form-control flex flex-col items-center justify-center">
                <label className="label cursor-pointer flex items-center gap-4">
                  <span className="label-text text-gray-400">
                    {t("receiveNotifications")}
                  </span>
                  <input
                    type="checkbox"
                    checked={subscribed}
                    onChange={(e) => setSubscribed(e.target.checked)}
                    className="toggle toggle-primary bg-gray-800 border-gray-600 checked:bg-blue-600 checked:border-blue-600"
                  />
                </label>
              </div>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-400">
                  {t("frequency")}
                </span>
              </label>
              <select
                value={frequency}
                onChange={(e) =>
                  setFrequency(e.target.value as "daily" | "weekly" | "monthly")
                }
                className="select select-bordered w-full bg-gray-800 text-gray-200"
                disabled={!subscribed}
              >
                <option value="daily">{t("daily")}</option>
                <option value="weekly">{t("weekly")}</option>
                <option value="monthly">{t("monthly")}</option>
              </select>
            </div>
            {frequency === "weekly" && subscribed && (
              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text text-gray-400">
                    {t("dayOfWeek")}
                  </span>
                </label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value)}
                  className="select select-bordered w-full bg-gray-800 text-gray-200"
                >
                  <option value="Monday">{t("monday")}</option>
                  <option value="Tuesday">{t("tuesday")}</option>
                  <option value="Wednesday">{t("wednesday")}</option>
                  <option value="Thursday">{t("thursday")}</option>
                  <option value="Friday">{t("friday")}</option>
                  <option value="Saturday">{t("saturday")}</option>
                  <option value="Sunday">{t("sunday")}</option>
                </select>
              </div>
            )}
            {frequency === "monthly" && subscribed && (
              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text text-gray-400">
                    {t("dayOfMonth")}
                  </span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={dayOfMonth}
                  onChange={(e) => setDayOfMonth(Number(e.target.value))}
                  className="input input-bordered w-full bg-gray-800 text-gray-200"
                />
              </div>
            )}
            <div className="form-control mt-6">
              <button
                type="button"
                onClick={updateNotificationPreference}
                className="btn btn-primary w-full flex items-center justify-center gap-2"
              >
                <PublishIcon />
                {t("submit")}
              </button>
            </div>
          </>
        )}

        {successMessage && (
          <div className="toast toast-top toast-end">
            <div className="alert alert-success">
              <span>{successMessage}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
