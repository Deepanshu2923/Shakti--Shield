import React, { useContext, useState } from 'react';
import { ChevronLeft, User, Mail, Lock, Shield, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../URL/CustomApi';
import { Config } from '../../URL/Config';
import { AuthContext } from '../Context/AuthContext';

function Settings() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { user } = useContext(AuthContext);
  const [activeSection, setActiveSection] = useState('account');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm({
    defaultValues: {
      username: '',
      email: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    setSuccessMessage('');
  
    try {
      if (data.username) {
        const response = await api.post(Config.UPDATEUSERNAME, {
          username: data.username,
        });
  
        if (response.data.success) {
          setSuccessMessage('Username updated successfully');
          reset({ username: '' });
        }
      }
  
      if (data.email) {
        const response = await api.post(Config.UPDATEEMAIL, {
          email: data.email,
          isGoogleUser: user.isGoogleUser,
        });
  
        if (response.data.success) {
          setSuccessMessage('Email updated successfully');
          reset({ email: '' });
        }
      }
  
      if (data.currentPassword && data.newPassword) {
        if (data.newPassword !== data.confirmPassword) {
          setError('New passwords do not match');
          return;
        }
  
        const response = await api.post(Config.UPDATEPASSWORD, {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        });
  
        if (response.data.success) {
          setSuccessMessage('Password updated successfully');
          reset({
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          });
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const newPassword = watch('newPassword');
  const passwordStrength = {
    0: "Very weak",
    1: "Weak",
    2: "Moderate",
    3: "Strong",
    4: "Very strong"
  };
  
  const calculatePasswordStrength = (password) => {
    if (!password) return 0;
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    return strength;
  };

  const strength = calculatePasswordStrength(newPassword);
  
  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: "url('/img1.webp')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Lighter overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/40 to-fuchsia-800/40"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="p-4 flex items-center">
          <Link to="/profile" className="text-white p-2 bg-black/20 backdrop-blur-sm rounded-full border border-white/20">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2 ml-4">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-8 h-8 rounded-full flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Account Settings</h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto p-4">
          {/* Navigation Tabs */}
          <div className="flex mb-6 bg-black/20 backdrop-blur-sm rounded-xl border border-white/20 p-1">
            <button
              className={`flex-1 py-2 rounded-lg text-center ${
                activeSection === 'account' 
                  ? 'bg-gradient-to-r from-purple-600/80 to-pink-600/80 text-white' 
                  : 'text-purple-200 hover:text-white'
              }`}
              onClick={() => setActiveSection('account')}
            >
              Account
            </button>
            <button
              className={`flex-1 py-2 rounded-lg text-center ${
                activeSection === 'privacy' 
                  ? 'bg-gradient-to-r from-purple-600/80 to-pink-600/80 text-white' 
                  : 'text-purple-200 hover:text-white'
              }`}
              onClick={() => setActiveSection('privacy')}
            >
              Privacy
            </button>
            <button
              className={`flex-1 py-2 rounded-lg text-center ${
                activeSection === 'security' 
                  ? 'bg-gradient-to-r from-purple-600/80 to-pink-600/80 text-white' 
                  : 'text-purple-200 hover:text-white'
              }`}
              onClick={() => setActiveSection('security')}
            >
              Security
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-500/30 backdrop-blur-sm border border-red-400/30 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2">
                <X className="h-5 w-5 text-red-200" />
                <span className="text-red-200">{error}</span>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-500/30 backdrop-blur-sm border border-green-400/30 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-200" />
                <span className="text-green-200">{successMessage}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Username Section */}
            {activeSection === 'account' && (
              <div className="bg-gradient-to-br from-purple-800/50 to-pink-700/50 backdrop-blur-lg rounded-2xl border border-white/20 shadow-lg p-5">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-yellow-300" />
                  Update Username
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">New Username</label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        {...register('username', {
                          minLength: {
                            value: 3,
                            message: 'Username must be at least 3 characters'
                          }
                        })}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        placeholder="Enter new username"
                      />
                    </div>
                    {errors.username && (
                      <p className="text-red-300 text-sm mt-1">{errors.username.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Email Section */}
            {activeSection === 'account' && (
              <div className="bg-gradient-to-br from-purple-800/50 to-pink-700/50 backdrop-blur-lg rounded-2xl border border-white/20 shadow-lg p-5">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-yellow-300" />
                  Update Email
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">New Email</label>
                    <div className="flex items-center">
                      <input
                        type="email"
                        {...register('email', {
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: 'Please enter a valid email'
                          }
                        })}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        placeholder="Enter new email"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-300 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Password Section */}
            {activeSection === 'security' && (
              <div className="bg-gradient-to-br from-purple-800/50 to-pink-700/50 backdrop-blur-lg rounded-2xl border border-white/20 shadow-lg p-5">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-yellow-300" />
                  Update Password
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">Current Password</label>
                    <input
                      type="password"
                      {...register('currentPassword')}
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">New Password</label>
                    <input
                      type="password"
                      {...register('newPassword', {
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters'
                        }
                      })}
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      placeholder="Enter new password"
                    />
                    {errors.newPassword && (
                      <p className="text-red-300 text-sm mt-1">{errors.newPassword.message}</p>
                    )}
                    
                    {/* Password Strength Meter */}
                    {newPassword && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-purple-200 mb-1">
                          <span>Password Strength:</span>
                          <span>{passwordStrength[strength]}</span>
                        </div>
                        <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${
                              strength === 0 ? 'bg-red-500 w-1/5' :
                              strength === 1 ? 'bg-orange-500 w-2/5' :
                              strength === 2 ? 'bg-yellow-500 w-3/5' :
                              strength === 3 ? 'bg-green-500 w-4/5' :
                              'bg-emerald-500 w-full'
                            }`}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      {...register('confirmPassword')}
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Section */}
            {activeSection === 'privacy' && (
              <div className="bg-gradient-to-br from-purple-800/50 to-pink-700/50 backdrop-blur-lg rounded-2xl border border-white/20 shadow-lg p-5">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-yellow-300" />
                  Privacy Settings
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                    <div>
                      <h3 className="text-white font-medium">Location Sharing</h3>
                      <p className="text-purple-200 text-sm">Control who can see your location</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                    <div>
                      <h3 className="text-white font-medium">Emergency Contacts</h3>
                      <p className="text-purple-200 text-sm">Who can see your emergency contacts</p>
                    </div>
                    <select className="bg-black/30 backdrop-blur-sm border border-white/20 text-white rounded-lg px-3 py-1 text-sm">
                      <option>Only Me</option>
                      <option>Trusted Contacts</option>
                      <option>Public</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                    <div>
                      <h3 className="text-white font-medium">Activity Status</h3>
                      <p className="text-purple-200 text-sm">Show when you're active</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold py-3.5 rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Settings;