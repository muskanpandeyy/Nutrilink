import React, { useState, useEffect } from 'react';
import { Package, Calendar, MapPin, MessageSquare, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { donations, requests } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const MyDonations = ({ onDonationSelect }) => {
  const [myDonations, setMyDonations] = useState([]);
  const [unseenRequests, setUnseenRequests] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDonationId, setSelectedDonationId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    fetchMyDonations();
  }, [isAuthenticated, navigate]);

  const fetchMyDonations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await donations.getByDonor();
      setMyDonations(response.data);

      // Fetch unseen requests count for each donation
      const unseenCounts = {};
      await Promise.all(
        response.data.map(async (donation) => {
          const requestsResponse = await requests.getByDonationId(donation._id);
          const unseenCount = requestsResponse.data.filter(r => !r.seen).length;
          if (unseenCount > 0) {
            unseenCounts[donation._id] = unseenCount;
          }
        })
      );
      setUnseenRequests(unseenCounts);
    } catch (err) {
      console.error('Error fetching donations:', err);
      setError(err.response?.data?.message || 'Failed to load donations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewRequests = (donationId) => {
    navigate(`/donations/${donationId}/requests`);
  };

  const handleDelete = async (donationId) => {
    try {
      await donations.delete(donationId);
      // Refresh the donations list
      fetchMyDonations();
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting donation:', err);
      setError('Failed to delete donation. Please try again.');
    }
  };

  // Delete confirmation modal
  const DeleteConfirmModal = ({ donationId, onCancel, onConfirm }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Donation</h3>
        <p className="text-gray-600 mb-6">Are you sure you want to delete this donation? This action cannot be undone.</p>
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
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 text-error-600">
        <p>{error}</p>
      </div>
    );
  }

  if (myDonations.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="h-12 w-12 mx-auto text-gray-400 mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No donations yet</h3>
        <p className="text-gray-600 mb-4">Start by creating your first donation</p>
        <Link
          to="/create-donation"
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Create Donation
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {myDonations.map((donation) => (
        <div 
          key={donation._id} 
          className={`bg-white p-4 rounded-lg shadow-sm border ${
            selectedDonationId === donation._id ? 'border-primary-500' : 'border-gray-100'
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{donation.title}</h3>
              <p className="text-sm text-gray-500">
                Created on {new Date(donation.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                donation.status === 'available' ? 'bg-success-100 text-success-800' :
                donation.status === 'claimed' ? 'bg-warning-100 text-warning-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
              </span>
              <button
                onClick={() => setShowDeleteConfirm(donation._id)}
                className="text-error-600 hover:text-error-700 p-1"
                title="Delete donation"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Package className="h-4 w-4 mr-2" />
              <span>Quantity: {donation.quantity}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span>Expires: {new Date(donation.expiryDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{donation.location}</span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Link
              to={`/donations/${donation._id}`}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View Details
            </Link>
            <button
              onClick={() => handleViewRequests(donation._id)}
              className="flex items-center px-3 py-1 bg-accent-50 text-accent-700 rounded-lg hover:bg-accent-100 transition-colors text-sm relative"
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              View Requests
              {unseenRequests[donation._id] > 0 && (
                <span className="absolute -top-2 -right-2 bg-error-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unseenRequests[donation._id]}
                </span>
              )}
            </button>
          </div>
        </div>
      ))}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          donationId={showDeleteConfirm}
          onCancel={() => setShowDeleteConfirm(null)}
          onConfirm={() => handleDelete(showDeleteConfirm)}
        />
      )}
    </div>
  );
};

export default MyDonations; 