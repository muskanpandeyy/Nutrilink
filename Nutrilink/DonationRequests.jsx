import React, { useState, useEffect } from 'react';
import { Check, X, User, Phone, MapPin, Info } from 'lucide-react';
import { requests } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const DonationRequests = ({ donationId }) => {
  const [donationRequests, setDonationRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (donationId) {
      fetchRequests();
    }
  }, [donationId]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching requests for donation:', donationId);
      
      const response = await requests.getByDonationId(donationId);
      setDonationRequests(response.data);
    } catch (err) {
      console.error('Error fetching requests:', err);
      const errorMessage = err.response?.data?.message || 
                          (err.message === 'Network Error' ? 'Network error - Please check your connection' : 
                          'Failed to load requests');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      await requests.updateStatus(requestId, 'approve');
      // Refresh requests after approval
      fetchRequests();
    } catch (err) {
      console.error('Error approving request:', err);
      setError('Failed to approve request');
    }
  };

  const handleReject = async (requestId) => {
    try {
      await requests.updateStatus(requestId, 'reject');
      // Refresh requests after rejection
      fetchRequests();
    } catch (err) {
      console.error('Error rejecting request:', err);
      setError('Failed to reject request');
    }
  };

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

  if (donationRequests.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-500">No requests yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {donationRequests.map((request) => (
        <div key={request._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                <User className="h-5 w-5 text-gray-600" />
              </div>
              <div className="ml-3">
                <p className="font-medium text-gray-900">{request.userId?.name || 'Anonymous'}</p>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <Phone className="h-4 w-4 mr-1" />
                  <span>{request.receiverContact}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{request.receiverLocation}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Requested on {new Date(request.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              request.status === 'pending' ? 'bg-warning-100 text-warning-800' :
              request.status === 'approved' ? 'bg-success-100 text-success-800' :
              'bg-error-100 text-error-800'
            }`}>
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </span>
          </div>

          <div className="mb-4">
            <p className="text-gray-700">{request.message}</p>
            <p className="text-sm text-gray-600 mt-2">Requested Quantity: {request.quantity}</p>

            {/* Optional Information Section */}
            {(request.age || request.sourceOfIncome || request.familyDetails) && (
              <div className="mt-4 bg-gray-50 p-3 rounded-md">
                <div className="flex items-center mb-2">
                  <Info className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Additional Information</span>
                </div>
                <div className="space-y-2">
                  {request.age && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Age:</span> {request.age} years
                    </p>
                  )}
                  {request.sourceOfIncome && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Source of Income:</span> {request.sourceOfIncome}
                    </p>
                  )}
                  {request.familyDetails && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Family Details:</span> {request.familyDetails}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {request.status === 'pending' && (
            <div className="flex space-x-3">
              <button
                onClick={() => handleApprove(request._id)}
                className="flex-1 bg-success-600 text-white px-4 py-2 rounded-lg hover:bg-success-700 transition-colors duration-200 flex items-center justify-center"
              >
                <Check className="h-4 w-4 mr-2" />
                Approve
              </button>
              <button
                onClick={() => handleReject(request._id)}
                className="flex-1 bg-error-600 text-white px-4 py-2 rounded-lg hover:bg-error-700 transition-colors duration-200 flex items-center justify-center"
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DonationRequests; 