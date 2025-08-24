import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ReviewSection from '../reviews/ReviewSection';
import MyDonations from '../donations/MyDonations';
import DonationRequests from '../donations/DonationRequests';
import RequestHistory from '../requests/RequestHistory';
import { donations } from '../../services/api';

const DonorDashboard = () => {
  const { user, showLoginSuccess } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0
  });
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await donations.getByDonor();
        const userDonations = response.data;

        // Calculate stats
        setStats({
          total: userDonations.length,
          pending: userDonations.filter(d => d.status === 'pending' || d.status === 'available').length,
          completed: userDonations.filter(d => d.status === 'completed' || d.status === 'claimed').length
        });
        setError('');
      } catch (err) {
        console.error('Error fetching donations:', err);
        setError('Failed to fetch your donations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleDonationSelect = (donationId) => {
    setSelectedDonation(donationId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Login Success Message */}
      {showLoginSuccess && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-6 py-3 rounded-xl shadow-lg z-50 animate-fade-in">
          <span className="block sm:inline">Login successful! Welcome {user?.role === 'donor' ? 'Donor' : 'Receiver'}!</span>
        </div>
      )}

      {/* Welcome Message */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
        <p className="text-gray-600 mt-2">Here's an overview of your food donations and requests.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-primary-500" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Total Donations</h3>
              <p className="text-3xl font-bold text-primary-600">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-warning-500" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Pending</h3>
              <p className="text-3xl font-bold text-warning-500">{stats.pending}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <Check className="h-8 w-8 text-success-500" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Completed</h3>
              <p className="text-3xl font-bold text-success-500">{stats.completed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* My Donations Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">My Donations</h2>
        <MyDonations onDonationSelect={handleDonationSelect} />
      </div>

      {/* Donation Requests Section */}
      {selectedDonation && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Donation Requests</h2>
          <DonationRequests donationId={selectedDonation} />
        </div>
      )}

      {/* Request History Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <RequestHistory />
      </div>

      {/* Reviews Section */}
      <ReviewSection />
    </div>
  );
};

export default DonorDashboard;