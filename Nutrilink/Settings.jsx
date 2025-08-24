import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { settings, contact } from '../../services/api';
import { ChevronDown, ChevronUp } from 'lucide-react';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showContactSuccess, setShowContactSuccess] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    topic: '',
    message: ''
  });
  const [formData, setFormData] = useState({
    name: user?.name || '',
    emailNotifications: user?.settings?.emailNotifications ?? true,
    newDonationsAlerts: user?.settings?.newDonationsAlerts ?? true,
  });

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        emailNotifications: user?.settings?.emailNotifications ?? true,
        newDonationsAlerts: user?.settings?.newDonationsAlerts ?? true,
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleContactFormChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await contact.submit(contactForm);
      
      // Reset form
      setContactForm({
        name: '',
        email: '',
        topic: '',
        message: ''
      });

      // Show success message
      setShowContactSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowContactSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting contact form:', error);
      // You could add error handling here
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await settings.update(formData);
      
      if (response.data.success) {
        updateUser(response.data.user);
        setShowSuccess(true);
        // Hide success message after 3 seconds
        setTimeout(() => {
          setShowSuccess(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      // Show error in a more user-friendly way
      setShowSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const receiverFaqs = [
    {
      question: 'How to request a donation?',
      answer: 'Browse available donations, click on one you\'re interested in, and use the "Request Donation" button. Fill in the required information about your needs and submit the form.'
    },
    {
      question: 'What information should I provide?',
      answer: 'Provide your contact details, location for pickup, and any specific requirements. Optional fields include age, source of income, and family details - these help donors better understand your situation but are not mandatory.'
    },
    {
      question: 'Can I edit or cancel a request?',
      answer: 'Yes, you can edit or cancel your request before it\'s approved. Once approved, please contact the donor directly for any changes.'
    },
    {
      question: 'Is my personal information safe?',
      answer: 'Yes, we take privacy seriously. Your optional information is only shared with approved donors, and you control what information you provide.'
    }
  ];

  const donorFaqs = [
    {
      question: 'How to donate food?',
      answer: 'Click "Create Donation" from your dashboard, fill in the details about the food items, quantity, and pickup arrangements, then submit the form.'
    },
    {
      question: 'How to find someone to donate to?',
      answer: 'Once you create a donation, receivers can request it. You\'ll receive notifications and can review requests in your dashboard.'
    },
    {
      question: 'What happens after I accept a request?',
      answer: 'After accepting, you\'ll be connected with the receiver to arrange pickup details. Both parties receive contact information to coordinate.'
    },
    {
      question: 'How do I communicate with the receiver?',
      answer: 'Once you accept a request, you\'ll have access to the receiver\'s contact information. You can communicate directly to arrange pickup details.'
    },
    {
      question: 'Can I reject a request?',
      answer: 'Yes, you can reject requests if they don\'t meet your criteria. You can optionally provide a reason for the rejection.'
    }
  ];

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>
        
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg flex items-center justify-between">
            <span>Changes saved successfully!</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Settings */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={user.email}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="emailNotifications"
                  name="emailNotifications"
                  checked={formData.emailNotifications}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="emailNotifications" className="ml-2 text-gray-700">
                  Email Notifications
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="newDonationsAlerts"
                  name="newDonationsAlerts"
                  checked={formData.newDonationsAlerts}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="newDonationsAlerts" className="ml-2 text-gray-700">
                  New Donations Alerts
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-48 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Help Center */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Help Center</h2>

        {/* Role-specific FAQs */}
        {user.role === 'receiver' ? (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">For Receivers</h3>
            <div className="space-y-4">
              {receiverFaqs.map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-lg">
                  <button
                    className="w-full px-4 py-3 flex justify-between items-center text-left"
                    onClick={() => toggleFaq(index)}
                  >
                    <span className="font-medium text-gray-900">{faq.question}</span>
                    {expandedFaq === index ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                  {expandedFaq === index && (
                    <div className="px-4 pb-3 text-gray-600">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">For Donors</h3>
            <div className="space-y-4">
              {donorFaqs.map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-lg">
                  <button
                    className="w-full px-4 py-3 flex justify-between items-center text-left"
                    onClick={() => toggleFaq(index)}
                  >
                    <span className="font-medium text-gray-900">{faq.question}</span>
                    {expandedFaq === index ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                  {expandedFaq === index && (
                    <div className="px-4 pb-3 text-gray-600">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Still Need Help Section */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Still need help?</h3>
          <p className="text-gray-600 mb-4">
            Contact our support team at{' '}
            <a 
              href="mailto:supportnutilink@gmail.com" 
              className="text-primary-600 hover:text-primary-700"
            >
              supportnutilink@gmail.com
            </a>
          </p>

          {/* Contact Form Success Message */}
          {showContactSuccess && (
            <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
              <span>Your query has been submitted successfully. We will reach you soon.</span>
            </div>
          )}

          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={contactForm.name}
                onChange={handleContactFormChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={contactForm.email}
                onChange={handleContactFormChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
              <select
                name="topic"
                value={contactForm.topic}
                onChange={handleContactFormChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="">Select a topic</option>
                <option value="account">Account</option>
                <option value="donations">Donations</option>
                <option value="requests">Requests</option>
                <option value="technical">Technical issue</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                name="message"
                value={contactForm.message}
                onChange={handleContactFormChange}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-48 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400"
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings; 