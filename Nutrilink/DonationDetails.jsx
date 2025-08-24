import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, MapPin, Calendar, Clock, User, Phone, Info } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { donations, requests } from '../../services/api';

const DonationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [requestQuantity, setRequestQuantity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [receiverName, setReceiverName] = useState('');
  const [receiverContact, setReceiverContact] = useState('');
  const [receiverLocation, setReceiverLocation] = useState('');
  const [age, setAge] = useState('');
  const [sourceOfIncome, setSourceOfIncome] = useState('');
  const [familyDetails, setFamilyDetails] = useState('');

  useEffect(() => {
    const fetchDonation = async () => {
      try {
        setLoading(true);
        const response = await donations.getById(id);
        setDonation(response.data);
        setRequestQuantity(response.data.quantity);
      } catch (err) {
        console.error('Error fetching donation:', err);
        setError('Failed to load donation details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDonation();
  }, [id]);

  const handleRequest = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);

      // Debug log the form values
      console.log('Form Values:', {
        receiverName,
        receiverContact,
        receiverLocation,
        requestQuantity,
        message: requestMessage
      });

      // Validate user is logged in
      if (!user || !user.userId) {
        setError('Please log in to submit a request');
        return;
      }

      // Validate form fields
      if (!receiverName || !receiverContact || !receiverLocation || !requestQuantity) {
        setError('Please fill in all required fields');
        return;
      }

      // Convert quantity to number and validate
      const quantity = parseInt(requestQuantity);
      if (isNaN(quantity) || quantity <= 0) {
        setError('Please enter a valid quantity');
        return;
      }

      if (!donation || !donation._id) {
        setError('Invalid donation information');
        return;
      }

      // Create request data
      const requestData = {
        donationId: donation._id,
        userId: user.userId,
        quantity: quantity,
        receiverName: receiverName.trim(),
        receiverContact: receiverContact.trim(),
        receiverLocation: receiverLocation.trim(),
        message: requestMessage ? requestMessage.trim() : 'Interested in this donation'
      };

      // Debug log the request data
      console.log('Sending request data:', requestData);

      const response = await requests.create(requestData);
      
      if (response.data) {
        setShowSuccess(true);
        setTimeout(() => {
          navigate('/requests');
        }, 2000);
      }
    } catch (err) {
      console.error('Error creating request:', err);
      const errorMessage = err.response?.data?.message || 
                        (err.message === 'Network Error' ? 'Network error - Please check your connection' : 
                        'Failed to submit request. Please try again.');
      setError(errorMessage);
      // Debug log the error response
      if (err.response) {
        console.log('Error Response:', err.response.data);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Error</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!donation) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{donation.title}</h1>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                donation.status === 'available'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
            </span>
          </div>

          <p className="text-gray-600 mb-6">{donation.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="flex items-center">
              <Package className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Available Quantity</p>
                <p className="text-gray-900">{donation.quantity}</p>
              </div>
            </div>

            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="text-gray-900">{donation.location}</p>
              </div>
            </div>

            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Expiry Date</p>
                <p className="text-gray-900">
                  {new Date(donation.expiryDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <User className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Donor</p>
                <p className="text-gray-900">{donation.donorName}</p>
              </div>
            </div>
          </div>

          {user && user.role === 'receiver' && donation.status === 'available' && (
            <form onSubmit={handleRequest} className="mt-6 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Request this donation</h3>
              
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-700 mb-4">Required Information</h4>
                
                <div className="mb-4">
                  <label htmlFor="receiverName" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    id="receiverName"
                    name="receiverName"
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="receiverContact" className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    id="receiverContact"
                    name="receiverContact"
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    value={receiverContact}
                    onChange={(e) => setReceiverContact(e.target.value)}
                    placeholder="Enter your contact number"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="receiverLocation" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Location *
                  </label>
                  <input
                    type="text"
                    id="receiverLocation"
                    name="receiverLocation"
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    value={receiverLocation}
                    onChange={(e) => setReceiverLocation(e.target.value)}
                    placeholder="Enter your location"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity Needed *
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    required
                    min="1"
                    max={donation.quantity}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    value={requestQuantity}
                    onChange={(e) => setRequestQuantity(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <h4 className="text-md font-medium text-gray-700">Additional Information (Optional)</h4>
                  <Info className="h-4 w-4 ml-2 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  The following information is optional and helps us better understand your needs. Your privacy is important to us.
                </p>

                <div className="mb-4">
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    id="age"
                    min="0"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Optional"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="sourceOfIncome" className="block text-sm font-medium text-gray-700 mb-2">
                    Source of Income
                  </label>
                  <input
                    type="text"
                    id="sourceOfIncome"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    value={sourceOfIncome}
                    onChange={(e) => setSourceOfIncome(e.target.value)}
                    placeholder="Optional - e.g., Employment, Self-employed, Retired"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="familyDetails" className="block text-sm font-medium text-gray-700 mb-2">
                    Family Details
                  </label>
                  <textarea
                    id="familyDetails"
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    value={familyDetails}
                    onChange={(e) => setFamilyDetails(e.target.value)}
                    placeholder="Optional - Brief description of your family situation"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  placeholder="Add any additional information..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonationDetails; 