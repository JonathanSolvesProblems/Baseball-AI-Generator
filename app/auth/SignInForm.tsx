"use client";
import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase";

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

      console.log("User signed in:", user);

      setIsModalOpen(false);
    } catch (error: any) {
      setError(error.message); // Set error message if sign-in fails
      console.error("Error signing in:", error);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn(email, password);
  };

  return (
    <form onSubmit={handleSignIn} className="space-y-4">
      <h2 className="text-2xl font-semibold text-center mb-4">Sign In</h2>

      {/* Email Input */}
      <div className="form-control">
        <label htmlFor="email" className="label">
          <span className="label-text">Email</span>
        </label>
        <input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input input-bordered w-full"
        />
      </div>

      {/* Password Input */}
      <div className="form-control">
        <label htmlFor="password" className="label">
          <span className="label-text">Password</span>
        </label>
        <input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="input input-bordered w-full"
        />
      </div>

      {/* Error message display */}
      {error && (
        <div className="alert alert-error">
          <div>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="form-control">
        <button type="submit" className="btn btn-primary w-full">
          Sign In
        </button>
      </div>
    </form>
  );
};

export default SignInForm;
