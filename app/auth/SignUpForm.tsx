"use client";
import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, setUserInfo } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import InputIcon from "@mui/icons-material/Input";

const SignUpForm = ({
  setIsModalOpen,
}: {
  setIsModalOpen: (isModalOpen: boolean) => void;
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [language, setLanguage] = useState("English");
  const [error, setError] = useState<string | null>(null);

  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    language: string
  ) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await setUserInfo(user, firstName, lastName, language);

      //   console.log("User signed up:", user);
      setIsModalOpen(false);
    } catch (error: any) {
      setError(error.message);
      console.error("Error signing up:", error);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    await signUp(email, password, firstName, lastName, language);
  };

  return (
    <form
      onSubmit={handleSignUp}
      className="space-y-6 p-6 bg-gray-800 rounded-lg shadow-lg w-96 mx-auto"
    >
      <h2 className="text-3xl font-semibold text-center text-white mb-4">
        Sign Up
      </h2>

      <div className="form-control">
        <label htmlFor="email" className="label text-gray-400">
          <span className="label-text">Email</span>
        </label>
        <input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input input-bordered w-full bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="form-control">
        <label htmlFor="password" className="label text-gray-400">
          <span className="label-text">Password</span>
        </label>
        <input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="input input-bordered w-full bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="form-control">
        <label htmlFor="firstName" className="label text-gray-400">
          <span className="label-text">First Name</span>
        </label>
        <input
          id="firstName"
          type="text"
          placeholder="Enter your first name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          className="input input-bordered w-full bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="form-control">
        <label htmlFor="lastName" className="label text-gray-400">
          <span className="label-text">Last Name</span>
        </label>
        <input
          id="lastName"
          type="text"
          placeholder="Enter your last name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          className="input input-bordered w-full bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="form-control">
        <label htmlFor="language" className="label text-gray-400">
          <span className="label-text">Language</span>
        </label>
        <select
          id="language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="select select-bordered w-full bg-gray-700 text-white border-gray-600 focus:ring-2 focus:ring-blue-500"
        >
          <option value="English">English</option>
          <option value="Spanish">Spanish</option>
          <option value="Japanese">Japanese</option>
        </select>
      </div>

      {error && (
        <div className="alert alert-error bg-red-700 text-white">
          <div>
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="form-control">
        <button
          type="submit"
          className="btn btn-primary w-full bg-blue-600 hover:bg-blue-700 text-white border-none rounded-lg py-2 flex items-center justify-center gap-2"
        >
          <InputIcon />
          Sign Up
        </button>
      </div>
    </form>
  );
};

export default SignUpForm;
