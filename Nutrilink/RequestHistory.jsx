import React, { useState, useEffect } from 'react';
import { Clock, Check, X, Filter, Calendar, Package, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { requests } from '../../services/api';

const RequestHistory = () => {
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState('all');
  const [requestHistory, setRequestHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRequestHistory();
  }, []);

  const fetchRequestHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await requests.getRequestHistory(user.userId);
      setRequestHistory(response.data);
    } catch (err) {
      console.error('Error fetching request history:', err);
      setError('Failed to load request history. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = filterStatus === 'all'
    ? requestHistory
    : requestHistory.filter(request => request.status === filterStatus);

  const statusCounts = {
    all: requestHistory.length,
    approved: requestHistory.filter(r => r.status === 'approved').length,
    rejected: requestHistory.filter(r => r.status === 'rejected').length,
    pending: requestHistory.filter(r => r.status === 'pending').length
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Request History</h2>
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Requests ({statusCounts.all})</option>
            <option value="approved">Approved ({statusCounts.approved})</option>
            <option value="rejected">Rejected ({statusCounts.rejected})</option>
            <option value="pending">Pending ({statusCounts.pending})</option>
          </select>
        </div>
      </div>

      {filteredRequests.length > 0 ? (
        <div className="grid gap-4">
          {filteredRequests.map((request) => (
            <div
              key={request._id}
              className="bg-white rounded-lg shadow-sm border border-gray-100 p-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {request.user?.name || 'Anonymous'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Requested on {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
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
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Donation</p>
                  <p className="font-medium text-gray-900">{request.donationId?.title}</p>
                </div>
                <div>
                  <p className="text-gray-500">Quantity</p>
                  <p className="font-medium text-gray-900">{request.quantity}</p>
                </div>
              </div>

              {request.message && (
                <div className="mt-4 bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">{request.message}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Package className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No requests found</h3>
          <p className="text-gray-500">
            {filterStatus === 'all'
              ? "You don't have any donation requests yet"
              : `You don't have any ${filterStatus} requests`}
          </p>
        </div>
      )}
    </div>
  );
};

export default RequestHistory; 