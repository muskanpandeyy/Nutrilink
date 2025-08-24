import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, Check, Search, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ReviewSection from '../reviews/ReviewSection';
import { requests } from '../../services/api';

const ReceiverDashboard = () => {
  const { user, showLoginSuccess } = useAuth();
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await requests.getMyRequests();
      const userRequests = response.data;

      // Calculate stats
      setStats({
        totalRequests: userRequests.length,
        pendingRequests: userRequests.filter(r => r.status === 'pending').length,
        approvedRequests: userRequests.filter(r => r.status === 'approved').length,
        rejectedRequests: userRequests.filter(r => r.status === 'rejected').length
      });

      // Get recent requests (most recent 5)
      const sortedRequests = userRequests.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setRecentRequests(sortedRequests.slice(0, 5));
      setError('');
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('Failed to fetch your requests. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (requestId) => {
    try {
      await requests.delete(requestId);
      // Refresh the data
      fetchData();
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting request:', err);
      setError('Failed to delete request. Please try again.');
    }
  };

  // Delete confirmation modal
  const DeleteConfirmModal = ({ requestId, onCancel, onConfirm }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Request</h3>
        <p className="text-gray-600 mb-6">Are you sure you want to delete this request? This action cannot be undone.</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-error-600 text-white rounded-lg hover:bg-error-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

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
          <span className="block sm:inline">Login successful! Welcome {user?.name}!</span>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-primary-500" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Total Requests</h3>
              <p className="text-3xl font-bold text-primary-600">{stats.totalRequests}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-warning-500" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Pending</h3>
              <p className="text-3xl font-bold text-warning-500">{stats.pendingRequests}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <Check className="h-8 w-8 text-success-500" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Approved</h3>
              <p className="text-3xl font-bold text-success-500">{stats.approvedRequests}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
          <div className="space-x-4">
            <Link
              to="/donations"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Browse Donations
            </Link>
            <Link
              to="/requests"
              className="px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
            >
              View All Requests
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Requests</h2>
        {recentRequests.length > 0 ? (
          <div className="space-y-4">
            {recentRequests.map((request) => (
              <div key={request._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {request.donationId?.title || 'Donation'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Requested on {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      request.status === 'pending'
                        ? 'bg-warning-100 text-warning-800'
                        : request.status === 'approved'
                        ? 'bg-success-100 text-success-800'
                        : 'bg-error-100 text-error-800'
                    }`}
                  >
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                  {request.status === 'pending' && (
                    <button
                      onClick={() => setShowDeleteConfirm(request._id)}
                      className="text-error-600 hover:text-error-700 p-1"
                      title="Delete request"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No requests yet</h3>
            <p className="text-gray-600 mb-4">Start by browsing available donations</p>
            <Link
              to="/donations"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Browse Donations
            </Link>
          </div>
        )}
      </div>

      {/* Reviews Section */}
      <ReviewSection />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          requestId={showDeleteConfirm}
          onCancel={() => setShowDeleteConfirm(null)}
          onConfirm={() => handleDelete(showDeleteConfirm)}
        />
      )}
    </div>
  );
};

export default ReceiverDashboard;