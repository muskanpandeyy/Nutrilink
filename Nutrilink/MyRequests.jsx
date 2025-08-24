import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Check, X, Filter, Calendar, Package } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { mockRequests, mockDonations } from '../../data/mockData';
import { requests } from '../../services/api';
import { toast } from 'react-hot-toast';

const MyRequests = () => {
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!user) return;
    
    // Get all requests for the current user
    const userRequests = mockRequests
      .filter(request => request.receiverId === user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    setRequests(userRequests);
  }, [user]);
  
  // Filter requests based on status
  const filteredRequests = filterStatus === 'all'
    ? requests
    : requests.filter(request => request.status === filterStatus);
  
  // Get the donation details for each request
  const requestsWithDonations = filteredRequests.map(request => {
    const donation = mockDonations.find(d => d.id === request.donationId);
    return { ...request, donation };
  });
  
  const statusCounts = {
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
    collected: requests.filter(r => r.status === 'collected').length,
  };

  const handleCollect = async (requestId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await requests.collect(requestId);
      
      // Update the local state to reflect the change
      setRequests(prevRequests => 
        prevRequests.map(request => 
          request.id === requestId 
            ? { ...request, status: 'collected' } 
            : request
        )
      );

      // Show success message
      toast.success('Request marked as collected successfully!');
    } catch (err) {
      console.error('Error marking request as collected:', err);
      setError('Failed to mark request as collected. Please try again.');
      toast.error('Failed to mark request as collected');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Requests</h1>
        <p className="mt-1 text-gray-600">
          Track and manage all your donation requests
        </p>
      </div>

      {/* Stats Overview */}
      <div className="mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div 
            className={`bg-white p-4 rounded-xl shadow-sm border ${
              filterStatus === 'all' ? 'border-primary-300 ring-2 ring-primary-100' : 'border-gray-100'
            } cursor-pointer hover:shadow-md transition-all duration-200`}
            onClick={() => setFilterStatus('all')}
          >
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-primary-100">
                <Package className="h-5 w-5 text-primary-600" />
              </div>
              <span className="ml-2 text-sm font-medium text-gray-500">All Requests</span>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">{requests.length}</p>
          </div>
          
          <div 
            className={`bg-white p-4 rounded-xl shadow-sm border ${
              filterStatus === 'pending' ? 'border-warning-300 ring-2 ring-warning-100' : 'border-gray-100'
            } cursor-pointer hover:shadow-md transition-all duration-200`}
            onClick={() => setFilterStatus('pending')}
          >
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-warning-100">
                <Clock className="h-5 w-5 text-warning-600" />
              </div>
              <span className="ml-2 text-sm font-medium text-gray-500">Pending</span>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">{statusCounts.pending}</p>
          </div>
          
          <div 
            className={`bg-white p-4 rounded-xl shadow-sm border ${
              filterStatus === 'approved' ? 'border-accent-300 ring-2 ring-accent-100' : 'border-gray-100'
            } cursor-pointer hover:shadow-md transition-all duration-200`}
            onClick={() => setFilterStatus('approved')}
          >
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-accent-100">
                <Check className="h-5 w-5 text-accent-600" />
              </div>
              <span className="ml-2 text-sm font-medium text-gray-500">Approved</span>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">{statusCounts.approved}</p>
          </div>
          
          <div 
            className={`bg-white p-4 rounded-xl shadow-sm border ${
              filterStatus === 'collected' ? 'border-success-300 ring-2 ring-success-100' : 'border-gray-100'
            } cursor-pointer hover:shadow-md transition-all duration-200`}
            onClick={() => setFilterStatus('collected')}
          >
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-success-100">
                <Check className="h-5 w-5 text-success-600" />
              </div>
              <span className="ml-2 text-sm font-medium text-gray-500">Collected</span>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">{statusCounts.collected}</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="mb-6 bg-white p-4 rounded-xl shadow-sm flex items-center">
        <Filter className="h-5 w-5 text-gray-400 mr-2" />
        <span className="text-sm text-gray-600 mr-3">Filter by status:</span>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-gray-300 py-1 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
        >
          <option value="all">All Requests</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="collected">Collected</option>
        </select>
      </div>

      {/* Requests List */}
      {requestsWithDonations.length > 0 ? (
        <div className="space-y-4">
          {requestsWithDonations.map((request) => (
            <div key={request.id} className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4">
                <div>
                  <Link 
                    to={`/dashboard/donation/${request.donationId}`}
                    className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors duration-200"
                  >
                    {request.donation?.title || 'Donation'}
                  </Link>
                  <p className="text-sm text-gray-500">
                    Requested on {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="mt-2 sm:mt-0">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    request.status === 'pending' ? 'bg-warning-100 text-warning-800' : 
                    request.status === 'approved' ? 'bg-accent-100 text-accent-800' : 
                    request.status === 'rejected' ? 'bg-error-100 text-error-800' :
                    'bg-success-100 text-success-800'
                  }`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
              </div>
              
              <div className="mb-4 bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-700">
                  <p className="font-medium mb-1">Your Message:</p>
                  <p>{request.message}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Donation Type</p>
                  <p className="text-gray-900">{request.donation?.category || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Quantity</p>
                  <p className="text-gray-900">{request.donation?.quantity || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Pickup Location</p>
                  <p className="text-gray-900">{request.donation?.location || 'Unknown'}</p>
                </div>
              </div>
              
              {/* Actions based on status */}
              {request.status === 'approved' && (
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <div className="bg-accent-50 p-3 rounded-lg">
                    <p className="text-sm text-accent-800">
                      <strong>Congratulations!</strong> Your request has been approved. 
                      Please arrange pickup according to the donor's instructions.
                    </p>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => handleCollect(request.id)}
                      disabled={isLoading}
                      className={`bg-success-600 text-white px-4 py-2 rounded-lg hover:bg-success-700 transition-colors duration-200 text-sm ${
                        isLoading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isLoading ? 'Processing...' : 'Mark as Collected'}
                    </button>
                  </div>
                </div>
              )}
              
              {request.status === 'rejected' && (
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <div className="bg-error-50 p-3 rounded-lg">
                    <p className="text-sm text-error-800">
                      Your request was not approved. This could be because the donation was already claimed 
                      or the donor chose another recipient.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl text-center border border-dashed border-gray-300">
          <Package className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No requests found</h3>
          <p className="text-gray-600 mb-4">
            {filterStatus === 'all' 
              ? "You haven't made any donation requests yet" 
              : `You don't have any ${filterStatus} requests`
            }
          </p>
          {filterStatus !== 'all' ? (
            <button
              onClick={() => setFilterStatus('all')}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              View All Requests
            </button>
          ) : (
            <Link
              to="/dashboard/browse"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Browse Available Donations
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default MyRequests;