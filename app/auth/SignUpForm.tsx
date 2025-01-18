"use client"
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, setUserInfo } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore'

// can further improve ui by making mandatory or checks first, empty fields and re-direct when submitted
const SignUpForm = ({ setIsModalOpen }: { setIsModalOpen: (isModalOpen: boolean) => void }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [language, setLanguage] = useState('English')
    const [error, setError] = useState<string | null>(null)

    const signUp = async (email: string, password: string, firstName: string, lastName: string, language: string) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // After creating the user, save additional data to Firestore
            await setUserInfo(user, firstName, lastName, language);

            console.log('User signed up:', user);
            setIsModalOpen(false);

            // redirect or store user details in app
        } catch (error) {
            console.error('Error signing up:', error);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        await signUp(email, password, firstName, lastName, language);
    };

    return (
        <form onSubmit={handleSignUp} className="space-y-4">
            <h2 className="text-2xl font-semibold text-center mb-4">Sign Up</h2>

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

            {/* First Name Input */}
            <div className="form-control">
                <label htmlFor="firstName" className="label">
                    <span className="label-text">First Name</span>
                </label>
                <input
                    id="firstName"
                    type="text"
                    placeholder="Enter your first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="input input-bordered w-full"
                />
            </div>

            {/* Last Name Input */}
            <div className="form-control">
                <label htmlFor="lastName" className="label">
                    <span className="label-text">Last Name</span>
                </label>
                <input
                    id="lastName"
                    type="text"
                    placeholder="Enter your last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="input input-bordered w-full"
                />
            </div>

            {/* Language Dropdown */}
            <div className="form-control">
                <label htmlFor="language" className="label">
                    <span className="label-text">Language</span>
                </label>
                <select
                    id="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="select select-bordered w-full"
                >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="Japanese">Japanese</option>
                </select>
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
                <button type="submit" className="btn btn-primary w-full">Sign Up</button>
            </div>
        </form>
    );
};

export default SignUpForm;
