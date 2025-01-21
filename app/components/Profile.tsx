"use client";
import React, { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import {
  auth,
  deleteUserAccount,
  getLoggedInUserDetails,
  signOut,
  updateUserDetails,
} from "@/firebase";
import LogoutIcon from "@mui/icons-material/Logout";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import CloseIcon from "@mui/icons-material/Close";
import PublishIcon from "@mui/icons-material/Publish";
import AccountBoxIcon from "@mui/icons-material/AccountBox";

const Profile = ({
  setIsModalOpen,
}: {
  setIsModalOpen(isModalOpen: boolean): void;
}) => {
  const { userId, userDetails } = useUser();

  if (!userId) return;

  const [firstName, setFirstName] = useState(userDetails?.firstName || "");
  const [lastName, setLastName] = useState(userDetails?.lastName || "");
  const [language, setLanguage] = useState(userDetails?.language || "English");

  useEffect(() => {
    const retrieveUserDetails = async () => {
      if (!userId) return;
      const userDetails: any = await getLoggedInUserDetails(userId);

      if (!userDetails) return;

      setFirstName(userDetails.firstName);
      setLastName(userDetails.lastName);
      setLanguage(userDetails.language);
    };

    retrieveUserDetails();
  }, [userDetails]);

  const updateUserInfo = async () => {
    if (!userId) return;

    await updateUserDetails(userId, firstName, lastName, language);
    setFirstName(firstName);
    setLastName(lastName);
    setLanguage(language);
    setIsModalOpen(false);

    const isLanguageChanged = language !== userDetails?.language;

    if (isLanguageChanged) {
      window.location.reload();
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log("User signed out successfully");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const removeAccount = async () => {
    if (userId) {
      await deleteUserAccount(userId);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-[#0a0a0a] text-gray-200 rounded-lg shadow-lg w-full max-w-md relative p-6">
        {/* Close Icon */}
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-200"
          onClick={() => setIsModalOpen(false)}
        >
          <CloseIcon fontSize="large" />
        </button>

        {/* Profile Heading */}
        <h2 className="text-2xl font-semibold text-center mb-6 flex items-center justify-center gap-2">
          <AccountBoxIcon fontSize="large" />
          Profile
        </h2>

        {/* First Name Input */}
        <div className="form-control">
          <label htmlFor="firstName" className="label">
            <span className="label-text text-gray-400">First Name</span>
          </label>
          <input
            id="firstName"
            type="text"
            placeholder="Enter your first name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="input input-bordered w-full bg-gray-800 text-gray-200"
          />
        </div>

        {/* Last Name Input */}
        <div className="form-control mt-4">
          <label htmlFor="lastName" className="label">
            <span className="label-text text-gray-400">Last Name</span>
          </label>
          <input
            id="lastName"
            type="text"
            placeholder="Enter your last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className="input input-bordered w-full bg-gray-800 text-gray-200"
          />
        </div>

        {/* Preferred Language Dropdown */}
        <div className="form-control mt-4">
          <label htmlFor="language" className="label">
            <span className="label-text text-gray-400">Preferred Language</span>
          </label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="select select-bordered w-full bg-gray-800 text-gray-200"
          >
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="Japanese">Japanese</option>
          </select>
        </div>

        {/* Submit Button */}
        <div className="form-control mt-6">
          <button
            type="button"
            onClick={updateUserInfo}
            className="btn btn-primary w-full flex items-center justify-center gap-2"
          >
            <PublishIcon />
            Submit
          </button>
        </div>

        {/* Sign Out Button */}
        <div className="form-control mt-4">
          <button
            type="button"
            onClick={handleSignOut}
            className="btn btn-secondary w-full flex items-center justify-center gap-2"
          >
            <LogoutIcon />
            Sign Out
          </button>
        </div>

        {/* Delete Account Button */}
        <div className="form-control mt-4">
          <button
            type="button"
            onClick={removeAccount}
            className="btn btn-error w-full flex items-center justify-center gap-2"
          >
            <DeleteForeverIcon />
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
