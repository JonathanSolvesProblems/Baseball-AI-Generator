"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AuthModal from "../auth/AuthModal";
import { useUser } from "../context/UserContext";
import Profile from "./Profile";
import SportsBaseballIcon from "@mui/icons-material/SportsBaseball";
import GroupsIcon from "@mui/icons-material/Groups";
import SportsHandballIcon from "@mui/icons-material/SportsHandball";
import FolderCopyIcon from "@mui/icons-material/FolderCopy";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import LoginIcon from "@mui/icons-material/Login";

const Header = () => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userProfileModalOpened, setUserProfileModalOpened] =
    useState<boolean>(false);
  const { userId } = useUser();

  const handleNavigation = (route: string) => {
    router.push(route);
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <>
      <ul className="menu bg-base-400 lg:menu-horizontal rounded-box flex w-full items-center">
        {/* Home */}
        <li>
          <a onClick={() => handleNavigation("/")}>
            <SportsBaseballIcon className="mr-2" />
            Home
          </a>
        </li>

        {/* Teams */}
        <li>
          <a onClick={() => handleNavigation("/teams")}>
            <GroupsIcon className="mr-2" />
            Teams
          </a>
        </li>

        {/* Players */}
        <li>
          <a onClick={() => handleNavigation("/players")}>
            <SportsHandballIcon className="mr-2" />
            Players
          </a>
        </li>

        {/* Saved Content */}
        <li>
          <a onClick={() => handleNavigation("/savedContent")}>
            <FolderCopyIcon className="mr-2" />
            Saved Content
          </a>
        </li>

        {/* Account / Login */}
        <li className="ml-auto mr-4">
          {userId ? (
            <a
              className="flex items-center gap-2"
              onClick={() => setUserProfileModalOpened(!userProfileModalOpened)}
            >
              <AccountBoxIcon />
              Account
            </a>
          ) : (
            <a className="flex items-center gap-2" onClick={toggleModal}>
              <LoginIcon />
              Login or Sign up
            </a>
          )}
        </li>
      </ul>

      {/* Modals */}
      {isModalOpen && <AuthModal setIsModalOpen={setIsModalOpen} />}
      {userProfileModalOpened && (
        <Profile setIsModalOpen={setUserProfileModalOpened} />
      )}
    </>
  );
};

export default Header;
