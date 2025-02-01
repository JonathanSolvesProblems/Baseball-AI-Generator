"use client";
import React, { useEffect, useState } from "react";
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
import AddchartIcon from "@mui/icons-material/Addchart";
import i18n from "@/i18n";
import { useTranslation } from "react-i18next";
import { locales } from "@/locales";

const Header = () => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userProfileModalOpened, setUserProfileModalOpened] =
    useState<boolean>(false);
  const { userId, userDetails } = useUser();
  const { t } = useTranslation();

  useEffect(() => {
    if (userDetails?.language) {
      i18n.changeLanguage(locales[userDetails.language]);
    }
  }, [userDetails?.language]);

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
          <a
            onClick={() => {
              handleNavigation("/");
            }}
          >
            <SportsBaseballIcon className="mr-2" />
            {t("home")}
          </a>
        </li>

        <li>
          <a onClick={() => handleNavigation("/teams")}>
            <GroupsIcon className="mr-2" />
            {t("teams")}
          </a>
        </li>

        <li>
          <a onClick={() => handleNavigation("/players")}>
            <SportsHandballIcon className="mr-2" />
            {t("players")}
          </a>
        </li>

        <li>
          <a onClick={() => handleNavigation("/generateChart")}>
            <AddchartIcon className="mr-2" />
            {t("generateChart")}
          </a>
        </li>

        <li>
          <a onClick={() => handleNavigation("/savedContent")}>
            <FolderCopyIcon className="mr-2" />
            {t("savedContent")}
          </a>
        </li>

        <li className="ml-auto mr-4">
          {userId ? (
            <a
              className="flex items-center gap-2"
              onClick={() => setUserProfileModalOpened(!userProfileModalOpened)}
            >
              <AccountBoxIcon />
              {t("account")}
            </a>
          ) : (
            <a className="flex items-center gap-2" onClick={toggleModal}>
              <LoginIcon />
              {t("login")}
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
