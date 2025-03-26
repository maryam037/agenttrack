import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminPanel = () => {
  const [reviews, setReviews] = useState([]);
  const [users, setUsers] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReviews();
    fetchUsers();
  }, []);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/reviews/getreviews', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews(response.data.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/user/fetchusers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleUpdateReview = async (reviewId, updatedData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/reviews/updatetag/${reviewId}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchReviews();
      setShowReviewModal(false);
    } catch (error) {
      console.error('Error updating review:', error);
    }
  };

  const handleUpdateUser = async (userId, updatedData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/user/update-role/${userId}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
      setShowUserModal(false);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  return (
    <div className="p-8 bg-gray-950 min-h-screen text-white">
      <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
        <h2 className="text-3xl font-semibold">Admin Panel</h2>
        <button 
          className="bg-orange-600 hover:bg-orange-700 transition px-5 py-2 rounded-lg font-medium" 
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </button>
      </div>

      {/* Reviews Section */}
      <div className="mb-12">
        <h3 className="text-xl font-semibold mb-4">Reviews Management</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-900 rounded-lg overflow-hidden">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-left">Agent</th>
                <th className="px-4 py-2 text-left">Rating</th>
                <th className="px-4 py-2 text-left">Sentiment</th>
                <th className="px-4 py-2 text-left">Performance</th>
                <th className="px-4 py-2 text-left">Accuracy</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {reviews.map((review) => (
                <tr key={review._id} className="hover:bg-gray-800">
                  <td className="px-4 py-2">{review.agentName}</td>
                  <td className="px-4 py-2">{review.rating}</td>
                  <td className="px-4 py-2">{review.tags.sentiment}</td>
                  <td className="px-4 py-2">{review.tags.performance}</td>
                  <td className="px-4 py-2">{review.tags.accuracy}</td>
                  <td className="px-4 py-2">
                    <button
                      className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-sm"
                      onClick={() => {
                        setSelectedReview(review);
                        setShowReviewModal(true);
                      }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Users Section */}
      <div className="mb-12">
        <h3 className="text-xl font-semibold mb-4">Users Management</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-900 rounded-lg overflow-hidden">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium">Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Email</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Role</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap">{`${user.firstname} ${user.lastname}`}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowUserModal(true);
                      }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Edit Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Edit Review</h3>
              <button 
                onClick={() => setShowReviewModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            {selectedReview && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Sentiment</label>
                  <select
                    value={selectedReview.tags.sentiment}
                    onChange={(e) =>
                      setSelectedReview({
                        ...selectedReview,
                        tags: { ...selectedReview.tags, sentiment: e.target.value }
                      })
                    }
                    className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Positive">Positive</option>
                    <option value="Neutral">Neutral</option>
                    <option value="Negative">Negative</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Performance</label>
                  <select
                    value={selectedReview.tags.performance}
                    onChange={(e) =>
                      setSelectedReview({
                        ...selectedReview,
                        tags: { ...selectedReview.tags, performance: e.target.value }
                      })
                    }
                    className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Fast">Fast</option>
                    <option value="Average">Average</option>
                    <option value="Slow">Slow</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Accuracy</label>
                  <select
                    value={selectedReview.tags.accuracy}
                    onChange={(e) =>
                      setSelectedReview({
                        ...selectedReview,
                        tags: { ...selectedReview.tags, accuracy: e.target.value }
                      })
                    }
                    className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Order Accurate">Order Accurate</option>
                    <option value="Order Mistake">Order Mistake</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleUpdateReview(selectedReview._id, selectedReview.tags)}
                    className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 transition"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* User Edit Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Edit User</h3>
              <button 
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            {selectedUser && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Role</label>
                  <select
                    value={selectedUser.role}
                    onChange={(e) =>
                      setSelectedUser({ ...selectedUser, role: e.target.value })
                    }
                    className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    value={selectedUser.status}
                    onChange={(e) =>
                      setSelectedUser({ ...selectedUser, status: e.target.value })
                    }
                    className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleUpdateUser(selectedUser._id, {
                      role: selectedUser.role,
                      status: selectedUser.status
                    })}
                    className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 transition"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;