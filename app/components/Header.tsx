"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AuthModal from "../auth/AuthModal";
import { useUser } from "../context/UserContext";
import Profile from "./Profile";
// TODO: If user already logged in, requires another refresh
const Header = () => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userProfileModalOpened, setUserProfileModalOpened] =
    useState<boolean>(false);
  const { userId, userDetails } = useUser();

  const handleNavigation = (route: string) => {
    router.push(route);
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <>
      <ul className="menu bg-base-400 lg:menu-horizontal rounded-box flex w-full items-center">
        <li>
          <a onClick={() => handleNavigation("/")}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Inbox
            <span className="badge badge-sm">99+</span>
            {/* TODO: Can save sent emails here for reference */}
          </a>
        </li>
        <li onClick={() => handleNavigation("/teams")}>
          <a>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Teams
            <span className="badge badge-sm badge-warning">NEW</span>
          </a>
        </li>
        <li>
          <a onClick={() => handleNavigation("/players")}>
            Players
            <span className="badge badge-xs badge-info"></span>
          </a>
        </li>
        <li>
          <a onClick={() => handleNavigation("/savedContent")}>
            Saved Content
            <span className="badge badge-xs badge-info"></span>
          </a>
        </li>

        {/* <li>
          {userId ? (
            <a onClick={handleSignOut}>Sign Out</a>
          ) : (
            <a onClick={toggleModal}>
              Login or Sign up
              <span className="badge badge-xs badge-info"></span>
            </a>
          )}
        </li> */}
        {/* <li>
         // Can add warning with are you sure?
          {userId && <a onClick={removeAccount}>Delete Account</a>}
        </li> */}

        {/* <li className="ml-auto mr-4">
          <select
            value={language} // Controlled value
            onChange={(e) => {
              setLanguage(e.target.value);
              if (userId) updateUserDetails(userId, "", "", e.target.value);
            }} // Update language when user selects an option
            className="select select-bordered bg-black text-white focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-100 transition-all duration-300"
          >
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="Japanese">Japanese</option>
          </select>
        </li> */}

        <li className="ml-auto mr-4">
          {userId ? (
            <a
              onClick={() => setUserProfileModalOpened(!userProfileModalOpened)}
            >
              Account
              <span className="badge badge-xs badge-info"></span>
            </a>
          ) : (
            <a onClick={toggleModal}>
              Login or Sign up
              <span className="badge badge-xs badge-info"></span>
            </a>
          )}
        </li>
      </ul>

      {isModalOpen && <AuthModal setIsModalOpen={setIsModalOpen} />}
      {userProfileModalOpened && (
        <Profile setIsModalOpen={setUserProfileModalOpened} />
      )}
    </>
  );
};

export default Header;
