import React, { useState } from 'react';

const EditTagsModal = ({ isOpen, onClose, review, onUpdate }) => {
  const [tags, setTags] = useState({
    sentiment: review?.sentiment || 'Positive',
    performance: review?.performance || 'Fast',
    accuracy: review?.accuracy || 'Order Accurate'
  });

  const sentimentOptions = ['Positive', 'Negative', 'Neutral'];
  const performanceOptions = ['Fast', 'Medium', 'Slow'];
  const accuracyOptions = ['Order Accurate', 'Order Inaccurate'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onUpdate(review._id, tags);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Update Tags for Review Id:
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="text-sm text-gray-500 mb-6">
          {review?._id}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sentiment
            </label>
            <select
              value={tags.sentiment}
              onChange={(e) => setTags({ ...tags, sentiment: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            >
              {sentimentOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Performance
            </label>
            <select
              value={tags.performance}
              onChange={(e) => setTags({ ...tags, performance: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            >
              {performanceOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Accuracy
            </label>
            <select
              value={tags.accuracy}
              onChange={(e) => setTags({ ...tags, accuracy: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            >
              {accuracyOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTagsModal; 