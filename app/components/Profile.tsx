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
      <div className="modal modal-open">
        <div className="modal-box w-full max-w-md">
          <h2 className="text-2xl font-semibold text-center mb-4 text-black">
            Profile
          </h2>

          {/* First Name Input */}
          <div className="form-control">
            <label htmlFor="firstName" className="label">
              <span className="label-text text-black">First Name</span>
            </label>
            <input
              id="firstName"
              type="text"
              placeholder="Enter your first name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="input input-bordered w-full text-black"
            />
          </div>

          {/* Last Name Input */}
          <div className="form-control">
            <label htmlFor="lastName" className="label">
              <span className="label-text text-black">Last Name</span>
            </label>
            <input
              id="lastName"
              type="text"
              placeholder="Enter your last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="input input-bordered w-full text-black"
            />
          </div>

          {/* Preferred Language Dropdown */}
          <div className="form-control">
            <label htmlFor="language" className="label">
              <span className="label-text text-black">Preferred Language</span>
            </label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="select select-bordered w-full text-black"
            >
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="Japanese">Japanese</option>
            </select>
          </div>

          <div className="form-control mt-4">
            <button
              type="button"
              onClick={updateUserInfo}
              className="btn btn-primary w-full mt-4"
            >
              Submit
            </button>
          </div>

          {/* Sign Out Button */}
          <div className="form-control mt-4">
            <button
              type="button"
              onClick={handleSignOut}
              className="btn btn-secondary w-full"
            >
              Sign Out
            </button>
          </div>

          {/* Delete Account Button */}
          <div className="form-control mt-4">
            <button
              type="button"
              onClick={removeAccount}
              className="btn btn-error w-full"
            >
              Delete Account
            </button>
          </div>

          {/* Close Button */}
          <div className="modal-action">
            <button
              className="btn btn-primary w-full mt-4"
              onClick={() => setIsModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
