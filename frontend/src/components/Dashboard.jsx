import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import EditTagsModal from './EditTagsModal';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    locationMetrics: [],
    agentPerformance: [],
    complaints: [],
    priceRanges: []
  });
  const [selectedReview, setSelectedReview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filters, setFilters] = useState({
    location: '',
    orderPrice: '',
    rating: ''
  });

  const ITEMS_PER_PAGE = 10;
  const COLORS = ['#FFD700', '#FFA500', '#FF6B6B', '#4CAF50', '#2196F3'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reviewsRes, metricsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/reviews'),
        axios.get('http://localhost:5000/api/analytics/metrics')
      ]);
      
      setReviews(reviewsRes.data);
      setMetrics(metricsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const handleUpdateTags = async (reviewId, tags) => {
    try {
      await axios.put(`http://localhost:5000/api/reviews/${reviewId}/tags`, tags);
      fetchData();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating tags:', error);
    }
  };

  const sortedAndFilteredReviews = React.useMemo(() => {
    let result = [...reviews];

    // Apply filters
    if (filters.location) {
      result = result.filter(review => review.location === filters.location);
    }
    if (filters.orderPrice) {
      const price = Number(filters.orderPrice);
      result = result.filter(review => {
        const reviewPrice = Number(review.orderPrice);
        return filters.orderPrice === 'low' ? reviewPrice <= 50 :
               filters.orderPrice === 'medium' ? reviewPrice > 50 && reviewPrice <= 100 :
               reviewPrice > 100;
      });
    }
    if (filters.rating) {
      const rating = Number(filters.rating);
      result = result.filter(review => {
        const reviewRating = Number(review.rating);
        return filters.rating === 'low' ? reviewRating <= 2 :
               filters.rating === 'medium' ? reviewRating > 2 && reviewRating <= 4 :
               reviewRating > 4;
      });
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [reviews, filters, sortConfig]);

  const paginatedReviews = sortedAndFilteredReviews.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(sortedAndFilteredReviews.length / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-8xl mx-auto">
        <h1 className="text-4xl font-bold text-black mb-8 text-center">Delivery Reviews Dashboard</h1>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Average Agent Ratings per Location */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Average Ratings by Location</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.locationMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="location" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="averageRating" fill="#FFD700" name="Average Rating" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top & Bottom Performing Agents */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Agent Performance</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.agentPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 5]} />
                  <YAxis dataKey="agentName" type="category" width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="rating" fill="#4CAF50" name="Rating" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Common Complaints */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Common Complaints</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.complaints}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {metrics.complaints.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Orders by Price Range */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Orders by Price Range</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.priceRanges}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="count" fill="#2196F3" stroke="#2196F3" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="flex flex-col">
            <label className="text-lg font-semibold mb-2">Filter by Location</label>
            <select
              className="form-select rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
              value={filters.location}
              onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
            >
              <option value="">All Locations</option>
              {Array.from(new Set(reviews.map(r => r.location))).map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-lg font-semibold mb-2">Filter by Order Price</label>
            <select
              className="form-select rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
              value={filters.orderPrice}
              onChange={(e) => setFilters(prev => ({ ...prev, orderPrice: e.target.value }))}
            >
              <option value="">All Prices</option>
              <option value="low">Low (≤ $50)</option>
              <option value="medium">Medium ($51-$100)</option>
              <option value="high">High ({'>'}$100)</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-lg font-semibold mb-2">Filter by Rating</label>
            <select
              className="form-select rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
              value={filters.rating}
              onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
            >
              <option value="">All Ratings</option>
              <option value="low">Low (≤ 2)</option>
              <option value="medium">Medium (2-4)</option>
              <option value="high">High ({'>'}4)</option>
            </select>
          </div>
        </div>

        {/* Reviews Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    { key: 'index', label: 'S.No' },
                    { key: 'agentId', label: 'AgentId' },
                    { key: 'agentName', label: 'AgentName' },
                    { key: 'customerId', label: 'CustomerId' },
                    { key: 'location', label: 'Location' },
                    { key: 'discountApplied', label: 'DiscountApplied' },
                    { key: 'orderPrice', label: 'OrderPrice' },
                    { key: 'rating', label: 'Rating' },
                    { key: 'review', label: 'Review' },
                    { key: 'tags', label: 'Tags' },
                    { key: 'actions', label: 'Actions' }
                  ].map(column => (
                    <th
                      key={column.key}
                      onClick={() => column.key !== 'index' && column.key !== 'actions' && handleSort(column.key)}
                      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                        column.key !== 'index' && column.key !== 'actions' ? 'cursor-pointer hover:bg-gray-100' : ''
                      }`}
                    >
                      {column.label}
                      {sortConfig.key === column.key && (
                        <span className="ml-2">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="11" className="px-6 py-4 text-center">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedReviews.map((review, index) => (
                    <tr key={review._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{review.agentId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{review.agentName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{review.customerId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{review.location}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{review.discountApplied || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${review.orderPrice}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{review.rating}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{review.review}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            review.sentiment === 'Positive' ? 'bg-green-100 text-green-800' :
                            review.sentiment === 'Negative' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {review.sentiment}
                          </span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {review.performance}
                          </span>
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                            {review.accuracy}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user?.role === 'admin' && (
                          <button
                            onClick={() => {
                              setSelectedReview(review);
                              setIsModalOpen(true);
                            }}
                            className="text-primary hover:text-primary-dark font-medium"
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span>
                  {' '}-{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * ITEMS_PER_PAGE, sortedAndFilteredReviews.length)}
                  </span>
                  {' '}of{' '}
                  <span className="font-medium">{sortedAndFilteredReviews.length}</span>
                  {' '}results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    First
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = currentPage - 2 + i;
                    if (pageNum > 0 && pageNum <= totalPages) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === pageNum
                              ? 'z-10 bg-primary border-primary text-white'
                              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    return null;
                  })}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    Last
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Tags Modal */}
      <EditTagsModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedReview(null);
        }}
        review={selectedReview}
        onUpdate={handleUpdateTags}
      />
    </div>
  );
};

export default Dashboard; 