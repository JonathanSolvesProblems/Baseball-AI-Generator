"use client";
import React, { useEffect, useState } from "react";
import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";
import signInWithGoogle from "./SignInWithGoogle";
import CloseIcon from "@mui/icons-material/Close";
import GoogleIcon from "@mui/icons-material/Google";
import LoginIcon from "@mui/icons-material/Login";
import InputIcon from "@mui/icons-material/Input";

const AuthModal = ({
  setIsModalOpen,
}: {
  setIsModalOpen: (isModalOpen: boolean) => void;
}) => {
  const [currentForm, setCurrentForm] = useState<
    "login" | "google" | "signup" | "none"
  >("none");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormChange = (form: "login" | "google" | "signup") => {
    setCurrentForm(form);
  };

  const handleGoogleSignIn = async () => {
    handleFormChange("google");
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      setIsModalOpen(false);
    } catch (err) {
      setError("Google sign-in failed. Please try again later: " + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-[#0a0a0a] text-gray-200 rounded-lg shadow-lg w-full max-w-md relative p-6">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-200"
          onClick={() => setIsModalOpen(false)}
        >
          <CloseIcon fontSize="large" />
        </button>

        <div className="mt-16 space-y-6">
          {currentForm === "none" && (
            <div className="flex justify-around items-center">
              <button
                className="flex flex-col items-center justify-center bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full w-20 h-20 shadow-md transition-all duration-200"
                onClick={() => handleFormChange("login")}
              >
                <LoginIcon fontSize="large" />
                <span className="mt-2 text-sm">Login</span>
              </button>
              <button
                className="flex flex-col items-center justify-center bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full w-20 h-20 shadow-md transition-all duration-200"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <GoogleIcon fontSize="large" />
                <span className="mt-2 text-sm">Google</span>
              </button>
              <button
                className="flex flex-col items-center justify-center bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full w-20 h-20 shadow-md transition-all duration-200"
                onClick={() => handleFormChange("signup")}
              >
                <InputIcon fontSize="large" />
                <span className="mt-2 text-sm">Sign Up</span>
              </button>
            </div>
          )}

          {currentForm === "login" && (
            <SignInForm setIsModalOpen={setIsModalOpen} />
          )}

          {currentForm === "signup" && (
            <SignUpForm setIsModalOpen={setIsModalOpen} />
          )}

          {error && (
            <div className="alert alert-error bg-red-700 text-white p-4 rounded-lg mt-4">
              <div>
                <span>{error}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
