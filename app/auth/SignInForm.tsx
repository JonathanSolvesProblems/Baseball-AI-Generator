"use client";
import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase";
import LoginIcon from "@mui/icons-material/Login";

const SignInForm = ({
  setIsModalOpen,
}: {
  setIsModalOpen: (isModalOpen: boolean) => void;
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // console.log("User signed in:", user);

      setIsModalOpen(false);
    } catch (error: any) {
      setError(error.message);
      console.error("Error signing in:", error);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn(email, password);
  };

  return (
    <form
      onSubmit={handleSignIn}
      className="space-y-6 p-6 bg-gray-800 rounded-lg shadow-lg w-96 mx-auto"
    >
      <h2 className="text-3xl font-semibold text-center text-white mb-4">
        Sign In
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
          <LoginIcon />
          Sign In
        </button>
      </div>
    </form>
  );
};

export default SignInForm;
