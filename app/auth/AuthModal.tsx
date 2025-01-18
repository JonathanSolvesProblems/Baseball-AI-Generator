"use client"
import React, { useState } from 'react'
import SignInForm from './SignInForm'
import SignUpForm from './SignUpForm'
import signInWithGoogle from './SignInWithGoogle'

// May want to check if user already logged in to be persistent
const AuthModal = ({ setIsModalOpen }: { setIsModalOpen: (isModalOpen: boolean) => void }) => {
    const [currentForm, setCurrentForm] = useState<'login' | 'google' | 'signup' | 'none'>('none');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFormChange = (form: 'login' | 'google' | 'signup') => {
        setCurrentForm(form)
    }

    const handleGoogleSignIn = async () => {
        handleFormChange('google');
        setLoading(true); // Set loading state to true when starting the sign-in process
        setError(null); // Clear any previous error messages
        try {
            await signInWithGoogle(); // Call your async Google sign-in function
            // Handle successful sign-in (e.g., close the modal or update the UI)
            setIsModalOpen(false);
        } catch (err) {
            setError('Google sign-in failed. Please try again later.'); // Handle any errors that occur during the sign-in process
        } finally {
            setLoading(false); // Reset loading state
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="modal modal-open">
                <div className="modal-box w-full max-w-md">
                    {currentForm !== 'none' && (
                        <button
                            className="btn btn-ghost btn-sm absolute top-4 left-4"
                            onClick={() => setCurrentForm('none')}
                        >
                            Back
                        </button>
                    )}

                    {currentForm === 'none' && (
                        <div className="space-y-4">
                            <button
                                className="btn btn-primary w-full"
                                onClick={() => handleFormChange('login')}
                            >
                                Login
                            </button>
                            <button
                                className="btn btn-outline w-full"
                                onClick={handleGoogleSignIn}
                            >
                                Login with Google
                            </button>
                            <button
                                className="btn btn-secondary w-full"
                                onClick={() => handleFormChange('signup')}
                            >
                                Sign Up
                            </button>
                        </div>
                    )}


                    {currentForm === 'login' && (
                        <div>
                            <SignInForm setIsModalOpen={setIsModalOpen} />
                        </div>
                    )}
                    {currentForm === 'signup' && (
                        <div>
                            <SignUpForm setIsModalOpen={setIsModalOpen} />
                        </div>
                    )}

                    {error && (
                        <div className="alert alert-error">
                            <div>
                                <span>{error}</span>
                            </div>
                        </div>
                    )}

                    <div className="modal-action">
                        {/* You can add a close button here if needed */}
                        <button className="btn btn-primary" onClick={() => setIsModalOpen(false)}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AuthModal