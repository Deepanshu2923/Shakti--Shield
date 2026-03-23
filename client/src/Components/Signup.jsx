import React, { useState, useContext } from 'react';
import { FaEye, FaEyeSlash, FaShieldAlt, FaLock, FaUser, FaEnvelope } from 'react-icons/fa';
import { useForm } from "react-hook-form";
import axios from "axios";
import { Config } from '../../URL/Config';
import { useGoogleLogin } from "@react-oauth/google";
import { AuthContext } from '../Context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../URL/CustomApi';

function Signup() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, formState: { errors: formErrors } } = useForm();
    const [errors, setErrors] = useState("");
    const { setAuth, setUser, checkAuth } = useContext(AuthContext);
    const navigate = useNavigate();

    const Submit = async (data) => {
        setErrors("");
        try {
            if (data.password !== password) {
                setErrors("Password Doesn't match");
                return;
            }

            if (!data.agreeToTerms) {
                setErrors("Please agree to the Terms and Privacy Policy");
                return;
            }

            setIsLoading(true);
            const response = await api.post(Config.SignUPUrl,
                {
                    username: data.userName,
                    email: data.email,
                    password: data.password
                }
            );

            if (response.data) {
                await checkAuth()
                navigate("/HomePage");
            }
        } catch (error) {
            setErrors(error.response?.data?.message || "Signup failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = async (tokenResponse) => {
        try {
            setIsLoading(true);
            const userInfoResponse = await axios.get(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                {
                    headers: {
                        Authorization: `Bearer ${tokenResponse.access_token}`
                    }
                }
            );

            const googleUser = userInfoResponse.data;

            const response = await api.post(
                Config.GoogleSignUpUrl,
                {
                    email: googleUser.email,
                    googleId: googleUser.sub,
                    name: googleUser.name,
                    picture: googleUser.picture
                }
            );

            if (response.data) {
                await checkAuth()
                navigate("/HomePage");
            }
        } catch (error) {
            setErrors("Google signup failed: " + (error.response?.data?.message || "Please try again"));
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignup = useGoogleLogin({
        onSuccess: handleGoogleSuccess,
        onError: (error) => {
            console.error("Google login error:", error);
            setErrors("Google signup failed. Please try again.");
        }
    });

    return (
        <div 
            className="min-h-screen flex items-center justify-center p-4"
            style={{
                 backgroundImage: `url('/bg4.jpeg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}
        >
            <div className="w-full max-w-md mx-4">
                <div className="bg-gradient-to-br from-purple-900/90 via-fuchsia-800/90 to-rose-700/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border-2 border-white/20">
                    {/* Header with logo and title */}
                    <div className="bg-gradient-to-r from-purple-800 to-pink-700 p-6 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
                                <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center shadow-lg">
                                    <FaShieldAlt className="h-8 w-8 text-white" />
                                </div>
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Join Shakti Shield</h1>
                        <p className="text-purple-200">Empowering your safety journey</p>
                    </div>

                    {/* Signup Form */}
                    <form onSubmit={handleSubmit(Submit)} className="p-6 space-y-6">
                        {/* Google Sign Up Button */}
                        <button
                            type="button"
                            disabled={isLoading}
                            className={`w-full flex items-center justify-center gap-3 py-3 rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-md text-white font-bold hover:bg-white/20 transition-all duration-300 ${
                                isLoading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            onClick={() => handleGoogleSignup()}
                        >
                            <img
                                src="/logo.jpeg"
                                alt="Google logo"
                                className="w-6 h-6"
                            />
                            {isLoading ? 'Loading...' : 'Sign up with Google'}
                        </button>

                        {errors && (
                            <div className="text-yellow-300 text-center bg-black/30 py-2 px-4 rounded-lg">
                                {errors}
                            </div>
                        )}

                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-white/30"></div>
                            <span className="flex-shrink mx-4 text-purple-200">or continue with email</span>
                            <div className="flex-grow border-t border-white/30"></div>
                        </div>

                        {/* Username Field */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-purple-300">
                                <FaUser />
                            </div>
                            <input
                                type="text"
                                id="userName"
                                name="userName"
                                className="w-full pl-10 pr-3 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/30 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-300"
                                {...register("userName", {
                                    required: "Username is Required",
                                    maxLength: 20
                                })}
                                placeholder="Enter Your Username"
                            />
                        </div>

                        {/* Email Field */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-purple-300">
                                <FaEnvelope />
                            </div>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="w-full pl-10 pr-3 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/30 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-300"
                                placeholder="john.doe@example.com"
                                {...register("email", {
                                    required: true,
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "invalid email address"
                                    }
                                })}
                            />
                        </div>

                        {/* Password Field */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-purple-300">
                                <FaLock />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/30 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-300"
                                placeholder="••••••••"
                                {...register("password", {
                                    required: true,
                                    maxLength: 20
                                })}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-300 hover:text-white"
                            >
                                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                            </button>
                        </div>

                        {/* Confirm Password Field */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-purple-300">
                                <FaLock />
                            </div>
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/30 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-300"
                                placeholder="Confirm Password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-300 hover:text-white"
                            >
                                {showConfirmPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                            </button>
                        </div>
                        {errors && (
                            <p className="text-yellow-300 text-sm">{errors}</p>
                        )}

                        {/* Terms and Conditions */}
                        <div className="flex items-start space-x-3">
                            <input
                                type="checkbox"
                                id="agreeToTerms"
                                name="agreeToTerms"
                                className="mt-1.5 rounded border-white/30 bg-white/10 focus:ring-purple-500 text-purple-500"
                                {...register("agreeToTerms", {
                                    required: "You must agree to the Terms and Privacy Policy"
                                })}
                            />
                            <label htmlFor="agreeToTerms" className="text-sm text-purple-200">
                                I agree to the{' '}
                                <a href="/terms" className="text-yellow-300 hover:underline">Terms of Service</a>
                                {' '}and{' '}
                                <a href="/privacy" className="text-yellow-300 hover:underline">Privacy Policy</a>
                            </label>
                        </div>
                        {formErrors.agreeToTerms && (
                            <p className="text-yellow-300 text-sm">{formErrors.agreeToTerms.message}</p>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-xl py-3.5 hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <FaShieldAlt className="h-5 w-5" />
                            )}
                            <span>Create Secure Account</span>
                        </button>

                        {/* Login Link */}
                        <div className="text-center pt-4">
                            <p className="text-purple-200">
                                Already have an account?{' '}
                                <Link
                                    to={"/login"}
                                    className="font-bold text-yellow-300 hover:underline"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </form>
                    
                    {/* Decorative elements */}
                    <div className="absolute bottom-4 left-4 w-8 h-8 rounded-full bg-purple-500/20 border border-purple-400/30 animate-ping"></div>
                    <div className="absolute top-20 right-6 w-6 h-6 rounded-full bg-yellow-400/30 animate-ping"></div>
                </div>
            </div>
        </div>
    );
}

export default Signup;