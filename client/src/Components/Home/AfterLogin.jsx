import React, { useContext, useEffect, useState } from 'react';
import ShaktiButton from '../ShaktiButton';
import { Plus, X, CircleX, Shield, MapPin, AlertCircle, UserPlus } from 'lucide-react';
import BottomNav from './BottomNav';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../../Context/AuthContext';
import api from '../../../URL/CustomApi';
import { Config } from '../../../URL/Config';
import Loader from './Loader';
import { toast } from "react-toastify"

function AfterLogin() {
  const [showAddContact, setShowAddContact] = useState(false);
  const { handleSubmit, register } = useForm();
  const { user, setUser } = useContext(AuthContext);
  const [contactsdata, setContactsdata] = useState([]);
  const [showLoader, setShowLoader] = useState(false);
  const [MobileNo, setMobileNo] = useState([]);
  const [locationMethod, setLocationMethod] = useState(null);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    setContactsdata(Array.isArray(user?.contacts) ? user.contacts : []);
    setMobileNo(Array.isArray(user?.contacts) ? user.contacts : [])
  }, [user]);

  const Submit = async (formData) => {
    setShowLoader(true);
    try {
      const contactData = new FormData();
      contactData.append('photo', formData.photo[0]);
      contactData.append('name', formData.name);
      contactData.append('MobileNo', formData.MobileNo);
      const { data: responseData } = await api.post(
        Config.ContactUrl,
        contactData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (responseData) {
        const newContact = responseData.contact;
        setUser((prevUser) => ({
          ...prevUser,
          contacts: [...(prevUser.contacts || []), newContact],
        }));
        setShowAddContact(false);
      }
    } catch (error) {
      console.error('Error adding contact:', error);
    } finally {
      setShowLoader(false);
    }
  };

  const handleDelete = async (contactId) => {
    setShowLoader(true);
    try {
      const response = await api.delete(Config.DELETECONTACTUrl, {
        params: { contactId },
      });

      if (response.status === 200) {
        console.log('Contact deleted successfully');
        setContactsdata((prevContacts) =>
          prevContacts.filter((contact) => contact._id !== contactId)
        );
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
    } finally {
      setShowLoader(false);
    }
  };

  useEffect(() => {
    setContactsdata(Array.isArray(user?.contacts) ? user.contacts : []);
    setMobileNo(Array.isArray(user?.contacts) ? user.contacts : []);
  }, [user]);


  const getIPBasedLocation = async () => {
    try {
      let response = await fetch('https://ipapi.co/json/');
      if (!response.ok) throw new Error('First IP API failed');

      const data = await response.json();
      if (data.latitude && data.longitude) {
        return {
          latitude: data.latitude,
          longitude: data.longitude,
          accuracy: 50000,
          method: 'ipapi'
        };
      }

      response = await fetch('https://ipwho.is/');
      if (!response.ok) throw new Error('Second IP API failed');

      const fallbackData = await response.json();
      return {
        latitude: fallbackData.latitude,
        longitude: fallbackData.longitude,
        accuracy: 50000,
        method: 'ipwhois'
      };
    } catch (error) {
      console.error('IP geolocation failed:', error);
      throw new Error('Could not determine approximate location from IP');
    }
  };


  const getLocation = async () => {
    if (navigator.geolocation) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            { enableHighAccuracy: true, timeout: 10000 }
          );
        });

        setLocationMethod('gps');
        return {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          method: 'gps'
        };
      } catch (gpsError) {
        console.log('GPS failed, falling back to IP:', gpsError);
      }
    }

    try {
      const ipLocation = await getIPBasedLocation();
      setLocationMethod('ip');
      return ipLocation;
    } catch (ipError) {
      console.error('All location methods failed:', ipError);
      throw new Error('Could not determine your location');
    }
  };

  const handleSHAKTI = async () => {
    setShowLoader(true);
    setLocationError(null);

    try {
      if (MobileNo.length === 0) {
        throw new Error('No emergency contacts available');
      }

      const location = await getLocation();
      console.log('Using location:', location);

      const response = await api.post(Config.EMERGENCYUrl, {
        contactNumbers: MobileNo.map(contact => contact.MobileNo),
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
        }
      });

      toast.success(
        <div>
          <p>Emergency alert sent successfully!</p>
          <p className="text-sm mt-1">
            {location.method === 'gps' ? 'Using precise GPS location' :
              'Using approximate IP-based location'}
          </p>
        </div>
      );
    } catch (error) {
      console.error('SHAKTI Error:', error);
      setLocationError(error.message);
      toast.error(
        <div>
          <p className="font-semibold">Emergency alert failed</p>
          <p>{error.message}</p>
          {error.message.includes('location') && (
            <p className="text-sm mt-1">Please check your internet connection</p>
          )}
        </div>,
        { autoClose: false }
      );
    } finally {
      setShowLoader(false);
    }
  };

  const testLocation = async () => {
    toast.info('Testing location access...');
    try {
      const location = await getLocation();
      toast.success(
        <div>
          <p>Location test successful!</p>
          <p className="text-sm mt-1">
            Method: {location.method.toUpperCase()}
            <br />
            Accuracy: ~{Math.round(location.accuracy / 1000)}km
          </p>
        </div>
      );
    } catch (error) {
      toast.error(`Location test failed: ${error.message}`);
    }
  };

  return (
    <div className="w-full min-h-screen relative">
      {/* Background with dark overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: "url('/bg1.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-purple-900/80"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="w-full p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Shakti Shield</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 border border-white/20">
              <MapPin className="h-4 w-4 text-white" />
              <span className="text-white text-sm">
                {locationMethod === 'gps' ? 'GPS Active' : 'IP Location'}
              </span>
            </div>
            <button 
              onClick={testLocation}
              className="bg-black/30 backdrop-blur-sm p-2 rounded-full hover:bg-purple-600 transition-colors border border-white/20"
            >
              <AlertCircle className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        {/* Shakti Button Section */}
        <div className="w-full p-4 flex flex-col items-center justify-center mt-8">
  <div className="relative w-80 h-80 flex items-center justify-center">
    {/* Empowerment Glow */}
    <div className="absolute inset-0 rounded-full bg-yellow-400/20 animate-pulse" style={{ animationDuration: '3s' }}></div>
    
    {/* Animated Protection Rings */}
    <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping"></div>
    <div className="absolute inset-6 rounded-full bg-red-500/30 animate-ping" style={{ animationDelay: '0.5s' }}></div>
    <div className="absolute inset-12 rounded-full bg-red-500/40 animate-ping" style={{ animationDelay: '1s' }}></div>
    
    {/* Shakti Shield Button */}
    <div 
      className="relative w-60 h-60 rounded-full bg-gradient-to-br from-red-600 to-red-800 shadow-2xl flex flex-col items-center justify-center cursor-pointer transform hover:scale-105 transition-transform duration-300 z-10 group"
      onClick={handleSHAKTI}
    >
      {/* Inner glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-500 to-red-700 shadow-inner"></div>
      
      {/* Shakti Text */}
      <div className="flex flex-col items-center justify-center relative z-10">
        <span className="text-5xl font-extrabold text-white tracking-wider leading-none">
          SHAKTI
        </span>
        <div className="mt-2 w-4/5 h-1 bg-yellow-400 rounded-full animate-pulse"></div>
        <span className="mt-3 text-xl font-bold text-yellow-300 tracking-wider">
          SHIELD
        </span>
      </div>
      
      {/* Empowerment Symbol */}
      <div className="absolute -bottom-4">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
      </div>
    </div>
    
    {/* Protection Shield Outline */}
    <div className="absolute -inset-4 rounded-full border-4 border-yellow-400/30 transform rotate-12 animate-pulse-slow z-0"></div>
  </div>
  
  {/* Instruction Text */}
  <p className="text-center text-white text-lg mt-6 max-w-md bg-black/30 backdrop-blur-sm rounded-lg p-3 border border-white/20">
    Press the SHAKTI SHIELD button to activate emergency protection
  </p>
</div>

<style jsx global>{`
  @keyframes pulse-slow {
    0% { opacity: 0.5; transform: scale(0.95) rotate(12deg); }
    50% { opacity: 1; transform: scale(1) rotate(12deg); }
    100% { opacity: 0.5; transform: scale(0.95) rotate(12deg); }
  }
  
  .animate-pulse-slow {
    animation: pulse-slow 3s infinite;
  }
`}</style>

        {/* Emergency Contacts Section */}
        <div className="w-full p-4 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-white text-xl font-bold">Emergency Contacts</h1>
            <button
              className="text-white font-bold flex items-center gap-1 px-3 py-1.5 bg-purple-600/80 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-purple-700 transition-colors"
              onClick={() => setShowAddContact(true)}
              disabled={contactsdata.length >= 3}
            >
              <UserPlus className="w-4 h-4" />
              Add Contact
            </button>
          </div>
          
          {contactsdata.length >= 3 && (
            <div className="text-red-300 text-center text-sm mb-4 bg-black/30 backdrop-blur-sm rounded-lg p-2 border border-red-500/30">
              You can add maximum 3 contacts
            </div>
          )}

          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {contactsdata.length > 0 ? (
              contactsdata.map((contact, index) => (
                <div
                  key={index}
                  className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg flex items-center gap-4"
                >
                  <img
                    className="w-14 h-14 rounded-full object-cover border-2 border-white"
                    src={contact.photo}
                    alt="Contact"
                  />
                  <div className="flex-grow">
                    <h2 className="text-white font-bold">{contact.name}</h2>
                    <h3 className="text-purple-200">{contact.MobileNo}</h3>
                  </div>
                  <button
                    onClick={() => handleDelete(contact._id)}
                    className="w-8 h-8 rounded-full bg-red-500/30 hover:bg-red-500/40 flex items-center justify-center transition-colors"
                  >
                    <CircleX className="h-5 w-5 text-red-300" />
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-8">
                <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <Shield className="h-12 w-12 text-white mx-auto mb-4" />
                  <h1 className="text-white font-bold text-lg">No Emergency Contacts</h1>
                  <p className="text-purple-200 mt-2">
                    Add trusted contacts to alert in emergencies
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Location Status */}
        {locationError && (
          <div className="w-full p-4">
            <div className="bg-red-500/40 backdrop-blur-sm rounded-xl p-4 border border-red-400/30">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-200" />
                <span className="text-red-200">{locationError}</span>
              </div>
            </div>
          </div>
        )}

        {/* Add Contact Modal */}
        {showAddContact && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-purple-900/95 to-pink-800/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 max-w-md w-full">
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Add New Contact</h2>
                  <button
                    onClick={() => setShowAddContact(false)}
                    className="text-purple-200 hover:text-white"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(Submit)} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Profile Photo
                    </label>
                    <input
                      type="file"
                      accept="image/png, image/jpg, image/jpeg, image/webp"
                      className="block w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                      {...register('photo', { required: true })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">Name</label>
                    <input
                      type="text"
                      className="block w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      {...register('name', { required: true })}
                      placeholder="Contact's name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Contact Number
                    </label>
                    <input
                      type="text"
                      className="block w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      {...register('MobileNo', { required: true })}
                      placeholder="Phone number"
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddContact(false)}
                      className="px-4 py-2.5 text-white bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/30 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all"
                    >
                      Add Contact
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Loader */}
        {showLoader && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
            <Loader />
          </div>
        )}

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
}

export default AfterLogin;