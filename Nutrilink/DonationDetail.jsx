import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, 
  Calendar, 
  Package, 
  Clock, 
  Check, 
  X, 
  ArrowLeft, 
  User,
  AlertTriangle,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { mockDonations, mockUsers, mockRequests } from '../../data/mockData';

const DonationDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [donation, setDonation] = useState(null);
  const [donor, setDonor] = useState(null);
  const [requests, setRequests] = useState([]);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Simulate API call to fetch donation details
    const fetchDonation = () => {
      setLoading(true);
      setTimeout(() => {
        const foundDonation = mockDonations.find(d => d.id === id);
        if (foundDonation) {
          setDonation(foundDonation);
          const donorData = mockUsers.find(u => u.id === foundDonation.donorId);
          setDonor(donorData);
        } else {
          setError('Donation not found');
        }
        setLoading(false);
      }, 500);
    };

    fetchDonation();
  }, [id]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !donation) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">{error}</h3>
      </div>
    );
  }
  
  const isOwner = user?.id === donation.donorId;
  const isPastExpiry = new Date(donation.expiryDate) < new Date();
  const canRequest = user?.role === 'receiver' && donation.status === 'available' && !isPastExpiry;
  
  // Check if user has already requested this donation
  const hasRequested = mockRequests.some(
    r => r.donationId === id && r.receiverId === user?.id
  );
  
  const handleStatusUpdate = (newStatus) => {
    // Simulate updating donation status
    setDonation({ ...donation, status: newStatus });
  };
  
  const handleSubmitRequest = () => {
    if (!requestMessage.trim()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setIsSubmitting(false);
      setIsRequestModalOpen(false);
      
      // Create a new request (this would normally be done via API)
      const newRequest = {
        id: `req-${Date.now()}`,
        donationId: donation.id,
        receiverId: user?.id,
        message: requestMessage,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      
      // Add to mock requests (would normally be handled by API)
      mockRequests.push(newRequest);
      
      // Show success feedback
      alert('Request submitted successfully!');
      
      // Redirect to requests page
      navigate('/dashboard/requests');
    }, 1000);
  };
  
  const approveRequest = (requestId) => {
    // Find the request
    const request = requests.find(r => r.id === requestId);
    if (!request) return;
    
    // Update request status (this would normally be done via API)
    request.status = 'approved';
    
    // Update donation status
    setDonation({ ...donation, status: 'claimed' });
    
    // Update the requests list
    setRequests([...requests]);
  };
  
  const rejectRequest = (requestId) => {
    // Find the request
    const request = requests.find(r => r.id === requestId);
    if (!request) return;
    
    // Update request status (this would normally be done via API)
    request.status = 'rejected';
    
    // Update the requests list
    setRequests([...requests]);
  };
  
  const markAsCompleted = () => {
    // Update donation status
    setDonation({ ...donation, status: 'completed' });
  };
  
  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Back button */}
      <div className="mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Donation header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{donation.title}</h1>
              <div className="flex items-center text-gray-600 text-sm">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Posted on {new Date(donation.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                donation.status === 'available' ? 'bg-warning-100 text-warning-800' : 
                donation.status === 'claimed' ? 'bg-accent-100 text-accent-800' : 
                'bg-success-100 text-success-800'
              }`}>
                {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Donation details */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
                <p className="text-gray-700">{donation.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Category</h3>
                  <p className="text-gray-900">{donation.category}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Quantity</h3>
                  <div className="flex items-center">
                    <Package className="h-4 w-4 mr-1 text-gray-500" />
                    <p className="text-gray-900">{donation.quantity}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Expiry Date</h3>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-gray-500" />
                    <p className={`${isPastExpiry ? 'text-error-600' : 'text-gray-900'}`}>
                      {new Date(donation.expiryDate).toLocaleDateString()}
                      {isPastExpiry && ' (Expired)'}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Location</h3>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                    <p className="text-gray-900">{donation.location}</p>
                  </div>
                </div>
              </div>
              
              {donation.pickupInstructions && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Pickup Instructions</h3>
                  <p className="text-gray-700">{donation.pickupInstructions}</p>
                </div>
              )}
              
              {/* Expiry warning if applicable */}
              {isPastExpiry && (
                <div className="p-4 bg-error-50 border border-error-200 rounded-lg mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-error-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-error-800">Expired Item</h3>
                      <p className="mt-1 text-sm text-error-700">
                        This item has passed its expiry date and may no longer be available or safe for consumption.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Donor info or Request actions */}
            <div className="bg-gray-50 p-4 rounded-lg">
              {isOwner ? (
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Donation Status</h3>
                  <div className="space-y-2">
                    {donation.status === 'available' && (
                      <p className="text-sm text-gray-600">
                        Your donation is currently available for requests.
                      </p>
                    )}
                    {donation.status === 'claimed' && (
                      <button
                        onClick={markAsCompleted}
                        className="w-full bg-success-600 text-white px-4 py-2 rounded-lg hover:bg-success-700 transition-colors duration-200"
                      >
                        Mark as Completed
                      </button>
                    )}
                    {donation.status === 'completed' && (
                      <div className="flex items-center justify-center text-success-600">
                        <Check className="h-5 w-5 mr-1" />
                        <span>Donation Completed</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Donor Information</h3>
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary-600" />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">{donor?.name}</p>
                      <p className="text-sm text-gray-500">Joined {new Date(donor?.joinedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  {canRequest && (
                    <div>
                      {hasRequested ? (
                        <div className="p-3 bg-accent-50 border border-accent-200 rounded-lg text-center">
                          <p className="text-accent-800 text-sm">
                            You have already requested this donation. Check your requests page for status.
                          </p>
                        </div>
                      ) : (
                        <button
                          onClick={() => setIsRequestModalOpen(true)}
                          className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center justify-center"
                        >
                          <MessageSquare className="h-5 w-5 mr-2" />
                          Request This Donation
                        </button>
                      )}
                    </div>
                  )}
                  
                  {!canRequest && donation.status !== 'available' && (
                    <div className="p-3 bg-gray-100 border border-gray-200 rounded-lg text-center">
                      <p className="text-gray-700 text-sm">
                        This donation is no longer available for requests.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Requests section (only visible to the donor) */}
          {isOwner && requests.length > 0 && (
            <div className="mt-8 border-t border-gray-100 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Requests ({requests.length})</h2>
              <div className="space-y-4">
                {requests.map(request => {
                  const requester = mockUsers.find(u => u.id === request.receiverId);
                  
                  return (
                    <div key={request.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary-600" />
                          </div>
                          <div className="ml-3">
                            <p className="font-medium text-gray-900">{requester?.name}</p>
                            <p className="text-sm text-gray-500">
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
                      <p className="mt-2 text-gray-700">{request.message}</p>
                      
                      {request.status === 'pending' && (
                        <div className="mt-4 flex space-x-3">
                          <button
                            onClick={() => approveRequest(request.id)}
                            className="flex-1 bg-success-600 text-white px-3 py-1 rounded-lg hover:bg-success-700 transition-colors duration-200 flex items-center justify-center"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => rejectRequest(request.id)}
                            className="flex-1 bg-error-600 text-white px-3 py-1 rounded-lg hover:bg-error-700 transition-colors duration-200 flex items-center justify-center"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Request Modal */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Request Donation</h2>
              <button 
                onClick={() => setIsRequestModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-gray-700 mb-4">
              Send a message to the donor explaining why you need this donation and your pickup arrangements.
            </p>
            <div className="mb-4">
              <label htmlFor="requestMessage" className="block text-sm font-medium text-gray-700 mb-1">
                Your Message
              </label>
              <textarea
                id="requestMessage"
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                rows={4}
                placeholder="Explain your need for this donation and when you can pick it up..."
                className="block w-full rounded-lg border border-gray-300 py-2 px-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              ></textarea>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsRequestModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRequest}
                disabled={!requestMessage.trim() || isSubmitting}
                className={`px-4 py-2 rounded-lg text-white ${
                  !requestMessage.trim() || isSubmitting
                    ? 'bg-primary-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700'
                } transition-colors duration-200`}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  'Send Request'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationDetail;