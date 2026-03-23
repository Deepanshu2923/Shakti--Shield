import React, { useContext, useEffect, useState } from 'react';
import { Search, Plus, Star, Shield, X } from 'lucide-react';
import BottomNav from './Home/BottomNav';
import { useForm } from 'react-hook-form';
import api from '../../URL/CustomApi';
import { Config } from '../../URL/Config';
import { AuthContext } from '../Context/AuthContext';
import Loader from './Home/Loader';

function Reviews() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAddReview, setShowAddReview] = useState(false);
  const { handleSubmit, register } = useForm();
  const { user } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    setIsLoading(true);
    api.get(Config.GETREVIEWSUrl)
      .then(res => {
        const fetched = res.data.reviews || [];
        setReviews(fetched);
        setAllReviews(fetched);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const res = await api.post(Config.ADDREVIEWUrl, { 
        ...data
      });
      if (res.status === 201) {
        setReviews(prev => [res.data.review, ...prev]);
        setAllReviews(prev => [res.data.review, ...prev]);
        setShowAddReview(false);
      }
    } catch (e) { console.error(e); }
    setIsLoading(false);
  };

  const handleSearch = e => {
    e.preventDefault();
    setIsLoading(true);
    const q = searchQuery.toLowerCase().trim();
    
    let filtered = allReviews;
    
    // Apply filter
    if (activeFilter === 'positive') {
      filtered = filtered.filter(r => r.rating >= 4);
    } else if (activeFilter === 'critical') {
      filtered = filtered.filter(r => r.rating <= 2);
    }
    
    // Apply search
    if (q) {
      filtered = filtered.filter(r =>
        [r.title, r.review, r.location, r.user?.username]
          .some(field => field?.toLowerCase().includes(q))
      );
    }
    
    setReviews(filtered);
    setIsLoading(false);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setIsLoading(true);
    
    let filtered = allReviews;
    
    if (filter === 'positive') {
      filtered = filtered.filter(r => r.rating >= 4);
    } else if (filter === 'critical') {
      filtered = filtered.filter(r => r.rating <= 2);
    }
    
    setReviews(filtered);
    setIsLoading(false);
  };

  // Generate random rating for demo purposes
  const getRandomRating = () => Math.floor(Math.random() * 5) + 1;

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: "url('/bg5.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/80 to-fuchsia-800/80"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <header className="p-6 flex flex-col items-center">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-14 h-14 rounded-full flex items-center justify-center shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white ml-3">
              Shakti <span className="text-yellow-300">Shield</span>
            </h1>
          </div>
          
          <div className="w-full max-w-4xl">
            <h2 className="text-2xl font-bold text-center text-white mb-2">
              Community Safety Reviews
            </h2>
            <p className="text-center text-purple-200 mb-6">
              Share your experiences and read about safety in your community
            </p>
            
            {/* Search */}
            <form onSubmit={handleSearch} className="mb-6">
              <div className="relative">
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search reviews by location, title or user..."
                  className="w-full pl-14 pr-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <Search className="absolute top-3.5 left-4 text-purple-300" />
                <button 
                  type="submit"
                  className="absolute right-2 top-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold px-4 py-1.5 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all"
                >
                  Search
                </button>
              </div>
            </form>
            
            {/* Filters */}
            <div className="flex justify-center gap-4 mb-6">
              <button 
                className={`px-4 py-2 rounded-full font-medium ${
                  activeFilter === 'all' 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                    : 'bg-white/10 backdrop-blur-sm text-purple-200 hover:bg-white/20'
                }`}
                onClick={() => handleFilterChange('all')}
              >
                All Reviews
              </button>
              <button 
                className={`px-4 py-2 rounded-full font-medium ${
                  activeFilter === 'positive' 
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg' 
                    : 'bg-white/10 backdrop-blur-sm text-purple-200 hover:bg-white/20'
                }`}
                onClick={() => handleFilterChange('positive')}
              >
                Positive
              </button>
              <button 
                className={`px-4 py-2 rounded-full font-medium ${
                  activeFilter === 'critical' 
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg' 
                    : 'bg-white/10 backdrop-blur-sm text-purple-200 hover:bg-white/20'
                }`}
                onClick={() => handleFilterChange('critical')}
              >
                Critical
              </button>
            </div>
          </div>
        </header>

        {/* Loader */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <Loader />
          </div>
        )}

        {/* Reviews List */}
        <main className="p-4 max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">
              {activeFilter === 'all' 
                ? 'All Safety Reviews' 
                : activeFilter === 'positive' 
                  ? 'Positive Experiences' 
                  : 'Safety Concerns'}
            </h3>
            <button
              onClick={() => setShowAddReview(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all transform hover:scale-105 shadow-lg"
            >
              <Plus size={18} /> Add Review
            </button>
          </div>
          
          <div className="space-y-6">
            {reviews.length ? (
              reviews.map(review => (
                <div
                  key={review._id}
                  className="p-5 bg-gradient-to-br from-purple-800/60 to-pink-700/60 backdrop-blur-lg rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="px-3 py-1 bg-purple-900/50 backdrop-blur-sm rounded-full text-sm text-yellow-300 border border-yellow-400/30">
                        {review.location}
                      </span>
                      <div className="flex mt-2">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i}
                            className={`w-4 h-4 ${i < (review.rating || getRandomRating()) ? 'fill-yellow-400 text-yellow-400' : 'text-purple-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-purple-300">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{review.title}</h3>
                  <p className="text-purple-200 mb-4">{review.review}</p>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold mr-2">
                      {review.user?.username?.charAt(0) || 'A'}
                    </div>
                    <div className="text-sm">
                      <div className="text-white font-medium">{review.user?.username || 'Anonymous'}</div>
                      <div className="text-purple-300">Shakti Shield User</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-black/30 backdrop-blur-sm rounded-2xl border border-white/20">
                <Star className="mx-auto mb-4 text-yellow-400" size={40} />
                <p className="text-white text-xl mb-2">No reviews found</p>
                <p className="text-purple-300 mb-6">Be the first to share your safety experience</p>
                <button
                  onClick={() => setShowAddReview(true)}
                  className="px-6 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all"
                >
                  Add Your Review
                </button>
              </div>
            )}
          </div>
        </main>

        {/* Add Review Modal */}
        {showAddReview && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-purple-900/95 to-pink-800/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Share Your Safety Experience</h2>
                  <button
                    onClick={() => setShowAddReview(false)}
                    className="text-purple-200 hover:text-white"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">Location</label>
                    <input
                      {...register('location', { required: true })}
                      placeholder="Where did this happen?"
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">Review Title</label>
                    <input
                      {...register('title', { required: true })}
                      placeholder="Brief summary of your experience"
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">Rating</label>
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className="w-6 h-6 text-purple-300 cursor-pointer"
                          // In a real app, you would implement rating selection
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">Your Experience</label>
                    <textarea
                      {...register('review', { required: true })}
                      rows={4}
                      placeholder="Share details about your safety experience..."
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddReview(false)}
                      className="px-4 py-2.5 text-white bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/30 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all"
                    >
                      Share Experience
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
}

export default Reviews;