import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { reviews } from '../../services/api';
import { Star, Edit2, Trash2, Check } from 'lucide-react';

const ReviewSection = () => {
  const { user } = useAuth();
  const [allReviews, setAllReviews] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingReview, setEditingReview] = useState(null);

  useEffect(() => {
    console.log('Current user in ReviewSection:', user); // Debug log
  }, [user]);

  // Fetch all approved reviews and user's own reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const [allReviewsRes, myReviewsRes] = await Promise.all([
          reviews.getAll(),
          user ? reviews.getMyReviews() : Promise.resolve({ data: [] })
        ]);
        setAllReviews(allReviewsRes.data);
        setUserReviews(myReviewsRes.data);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!user) {
      setError('Please log in to submit a review');
      return;
    }

    if (!newReview.comment.trim()) {
      setError('Please enter a comment');
      return;
    }

    try {
      const reviewData = {
        rating: parseInt(newReview.rating),
        comment: newReview.comment.trim()
      };
      
      const response = await reviews.create(reviewData);
      
      // Add the new review to userReviews
      setUserReviews(prevReviews => [response.data, ...prevReviews]);
      
      // Reset form
      setNewReview({ rating: 5, comment: '' });
      
      // Show success message
      setSuccess('Thank you for your review! It will be visible after approval.');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.response?.data?.message || 'Failed to submit review. Please try again.');
    }
  };

  const handleEdit = async (reviewId) => {
    setError('');
    setSuccess('');
    
    try {
      const response = await reviews.update(reviewId, editingReview);
      setUserReviews(userReviews.map(review => 
        review._id === reviewId ? response.data : review
      ));
      setEditingReview(null);
      setSuccess('Review updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update review. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDelete = async (reviewId) => {
    setError('');
    setSuccess('');
    
    try {
      await reviews.delete(reviewId);
      setUserReviews(userReviews.filter(review => review._id !== reviewId));
      setSuccess('Review deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete review. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`h-5 w-5 ${index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) return <div className="text-center py-4">Loading reviews...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-2xl font-semibold mb-6">Reviews</h2>
      
      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg flex items-center justify-between animate-fade-in">
          <div className="flex items-center">
            <Check className="h-5 w-5 mr-2" />
            <span>{success}</span>
          </div>
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg flex items-center justify-between">
          <span>{error}</span>
        </div>
      )}

      {/* Review Form */}
      {user && (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Rating
            </label>
            <div className="flex gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-6 w-6 cursor-pointer ${
                    star <= newReview.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                  onClick={() => setNewReview({ ...newReview, rating: star })}
                />
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Comment
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows="4"
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Submit Review
          </button>
        </form>
      )}

      {/* User's Reviews */}
      {user && userReviews.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Your Reviews</h3>
          <div className="space-y-4">
            {userReviews.map((review) => (
              <div key={review._id} className="border rounded-lg p-4">
                {editingReview && editingReview._id === review._id ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Rating</label>
                      <div className="flex gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 cursor-pointer ${
                              star <= editingReview.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                            onClick={() => setEditingReview({ ...editingReview, rating: star })}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Comment</label>
                      <textarea
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        rows="3"
                        value={editingReview.comment}
                        onChange={(e) => setEditingReview({ ...editingReview, comment: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(review._id)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingReview(null)}
                        className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex gap-1">{renderStars(review.rating)}</div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingReview(review)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(review._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Approved Reviews */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Community Reviews</h3>
        {allReviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet. Be the first to review!</p>
        ) : (
          <div className="space-y-4">
            {allReviews.map((review) => (
              <div key={review._id} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{review.userId.name}</span>
                  <div className="flex gap-1">{renderStars(review.rating)}</div>
                </div>
                <p className="text-gray-700">{review.comment}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSection; 