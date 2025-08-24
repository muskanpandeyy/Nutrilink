import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Check, X, Filter, Calendar, Package } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { requests as requestsApi } from '../../services/api';

const RequestsList = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await requestsApi.getMyRequests();
        setRequests(response.data);
      } catch (err) {
        console.error('Error fetching requests:', err);
        setError('Failed to load requests. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const filteredRequests = filterStatus === 'all'
    ? requests
    : requests.filter(request => request.status === filterStatus);

  const statusCounts = {
    all: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <X className="mx-auto h-12 w-12 text-error-500" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error Loading Requests</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Requests ({statusCounts.all})</option>
            <option value="pending">Pending ({statusCounts.pending})</option>
            <option value="approved">Approved ({statusCounts.approved})</option>
            <option value="rejected">Rejected ({statusCounts.rejected})</option>
          </select>
        </div>
        <Link
          to="/donations"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          Browse Donations
        </Link>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No requests found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filterStatus === 'all' 
              ? "You haven't made any requests yet."
              : `You don't have any ${filterStatus} requests.`}
          </p>
          <div className="mt-6">
            <Link
              to="/donations"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Browse Available Donations
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div
              key={request._id}
              className="bg-white shadow-sm rounded-lg p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {request.donationId?.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Requested on {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  request.status === 'pending' ? 'bg-warning-100 text-warning-800' :
                  request.status === 'approved' ? 'bg-success-100 text-success-800' :
                  'bg-error-100 text-error-800'
                }`}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
              </div>

              {request.message && (
                <div className="mb-4 bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-700">{request.message}</p>
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center">
                  <Package className="h-4 w-4 mr-1" />
                  <span>Quantity: {request.donationId?.quantity}</span>
                </div>
                {request.donationId?.expiryDate && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>
                      Expires: {new Date(request.donationId.expiryDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Status Messages */}
              {request.status === 'approved' && (
                <div className="mt-4 p-4 bg-success-50 border border-success-200 rounded-lg">
                  <div className="flex">
                    <Check className="h-5 w-5 text-success-600" />
                    <div className="ml-3">
                      <p className="text-sm text-success-700">
                        Your request has been approved! Please pick up the donation at the specified location.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {request.status === 'rejected' && (
                <div className="mt-4 p-4 bg-error-50 border border-error-200 rounded-lg">
                  <div className="flex">
                    <X className="h-5 w-5 text-error-600" />
                    <div className="ml-3">
                      <p className="text-sm text-error-700">
                        Your request has been declined. Please try requesting other available donations.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {request.status === 'pending' && (
                <div className="mt-4 p-4 bg-warning-50 border border-warning-200 rounded-lg">
                  <div className="flex">
                    <Clock className="h-5 w-5 text-warning-600" />
                    <div className="ml-3">
                      <p className="text-sm text-warning-700">
                        Your request is pending approval. We'll notify you once the donor responds.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RequestsList; 