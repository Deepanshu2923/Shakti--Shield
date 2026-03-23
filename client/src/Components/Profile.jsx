import { Home, Map, MessageSquare, User, Camera, X, Shield, Star, LogOut, Settings } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useContext, useState } from 'react';
import BottomNav from './Home/BottomNav';
import ReviewCard from './ReviewCard';
import api from '../../URL/CustomApi';
import { Config } from '../../URL/Config';
import { AuthContext } from '../Context/AuthContext';

const ProfileSection = ({ title, children }) => (
  <div className="w-full bg-gradient-to-br from-purple-800/60 to-pink-700/60 backdrop-blur-lg rounded-2xl border border-white/20 shadow-lg p-4">
    <h2 className="font-semibold text-white text-lg mb-3">{title}</h2>
    {children}
  </div>
);

function Profile() {
  const navigate = useNavigate();
  const { user, logout, setUser } = useContext(AuthContext);
  const [isUploading, setIsUploading] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const { register, handleSubmit, reset, watch } = useForm();

  const photoFile = watch('photo');

  const handleLogout = async () => {
    if (await logout()) navigate("/login");
  };

  const handleSettings = () => navigate("/settings");

  const handlePhotoChange = () => setShowPhotoModal(true);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      reset({ photo: null });
      return;
    }

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      alert('File size should be less than 5MB');
      reset({ photo: null });
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
  };

  const onSubmit = async (data) => {
    if (!data.photo?.[0]) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', data.photo[0]);

      const response = await api.post(Config.ADDPROFILEPHOTO, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.status === 200) {
        setUser((prev) => ({
          ...prev,
          profilePhoto: response.data.updatedUser.profilePhoto,
        }));
      }
    } catch (err) {
      console.error("Failed to upload the file", err);
    } finally {
      setIsUploading(false);
      setShowPhotoModal(false);
      reset();
      setPreviewUrl(null);
    }
  };

  const handleCloseModal = () => {
    setShowPhotoModal(false);
    setPreviewUrl(null);
    reset();
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: "url('/img1.webp')",
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/80 to-fuchsia-800/80"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              Shakti <span className="text-yellow-300">Shield</span>
            </h1>
          </div>
          
          <button 
            onClick={handleSettings}
            className="bg-black/30 backdrop-blur-sm p-2 rounded-full border border-white/20 hover:bg-purple-600 transition-colors"
          >
            <Settings className="h-5 w-5 text-white" />
          </button>
        </div>

        <div className="max-w-2xl mx-auto p-4 space-y-6">
          {/* User Info */}
          <div className="flex items-center gap-4 bg-gradient-to-br from-purple-800/60 to-pink-700/60 backdrop-blur-lg rounded-2xl border border-white/20 shadow-lg p-6 relative">
            <div className="relative">
              <img
                src={user.profilePhoto || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQvFbJHIvlkPWSvsJ1rWRbr64ZPiCCdb1SCLg&s"}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-2 border-white"
              />
              <button
                className="absolute bottom-0 right-0 bg-gradient-to-r from-yellow-500 to-orange-500 p-1.5 rounded-full text-black hover:from-yellow-600 hover:to-orange-600 transition-colors"
                onClick={handlePhotoChange}
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">{user.username}</h2>
              <p className="text-purple-200">{user.email}</p>
              <div className="flex items-center mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i}
                    className={`w-4 h-4 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-purple-300'}`}
                  />
                ))}
                <span className="text-sm text-purple-300 ml-2">4.8</span>
              </div>
            </div>
          </div>

          {/* Safety Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-purple-800/60 to-pink-700/60 backdrop-blur-lg rounded-2xl border border-white/20 shadow-lg p-4 text-center">
              <div className="text-3xl font-bold text-white">24</div>
              <div className="text-sm text-purple-200">SOS Alerts</div>
            </div>
            <div className="bg-gradient-to-br from-purple-800/60 to-pink-700/60 backdrop-blur-lg rounded-2xl border border-white/20 shadow-lg p-4 text-center">
              <div className="text-3xl font-bold text-white">42</div>
              <div className="text-sm text-purple-200">Safe Zones</div>
            </div>
          </div>

          {/* Reviews */}
          <ProfileSection title="Your Safety Reviews">
            {user.reviews.length > 0 ? (
              <div className="space-y-4">
                {user.reviews.map((review, idx) => (
                  <ReviewCard key={idx} {...review} username={user.username} />
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Star className="mx-auto text-yellow-400 mb-2" />
                <p className="text-purple-200">No reviews yet</p>
                <button
                  className="mt-3 text-yellow-300 hover:underline"
                  onClick={() => navigate('/reviews')}
                >
                  Share your first review
                </button>
              </div>
            )}
          </ProfileSection>

          {/* Logout */}
          <button
            className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold py-3 rounded-xl hover:from-red-700 hover:to-orange-700 transition-all flex items-center justify-center gap-2"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>

        {/* Photo Modal */}
        {showPhotoModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-purple-900/95 to-pink-800/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 max-w-md w-full">
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">Update Profile Photo</h2>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="text-purple-200 hover:text-white"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {previewUrl ? (
                    <div className="relative w-40 h-40 mx-auto rounded-full overflow-hidden">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          reset({ photo: null });
                          setPreviewUrl(null);
                        }}
                        className="absolute top-2 right-2 bg-red-500 rounded-full p-1 text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => document.getElementById('photo-upload').click()}
                      className="w-40 h-40 mx-auto border-2 border-dashed border-purple-400 rounded-full flex items-center justify-center cursor-pointer hover:border-yellow-500 transition-colors"
                    >
                      <Camera className="w-10 h-10 text-purple-300" />
                    </div>
                  )}

                  <input
                    id="photo-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    {...register('photo', { onChange: handleFileChange })}
                  />

                  <p className="text-sm text-purple-200 text-center">
                    Click to {previewUrl ? 'change' : 'upload'} photo
                  </p>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2.5 text-white bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/30 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!photoFile?.[0] || isUploading}
                    className={`px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 ${
                      !photoFile?.[0] || isUploading
                        ? 'bg-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:from-yellow-600 hover:to-orange-600'
                    }`}
                  >
                    {isUploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      'Upload Photo'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="w-full sticky bottom-0 z-10">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}

export default Profile;