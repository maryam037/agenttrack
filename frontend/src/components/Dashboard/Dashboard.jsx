import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import axios from 'axios';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [locations, setLocations] = useState([]);
  const [agents, setAgents] = useState([]);
  const [location, setLocation] = useState('');
  const [agentName, setAgentName] = useState('');
  const [rating, setRating] = useState('');
  const [sentiment, setSentiment] = useState('');
  const [error, setError] = useState('');
  const [isLoadingAgents, setIsLoadingAgents] = useState(true);
  const [locationRatings, setLocationRatings] = useState([]);
  const [agentPerformance, setAgentPerformance] = useState({ top: [], bottom: [] });
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewsPerPage] = useState(10);
  const [allReviews, setAllReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const priceRangeData = [
    { priceRange: "₹0-500", count: 4500, avgRating: 3.8 },
    { priceRange: "₹500-1000", count: 3200, avgRating: 4.2 },
    { priceRange: "₹1000-1500", count: 2500, avgRating: 4.5 },
    { priceRange: "₹1500-2000", count: 1800, avgRating: 4.3 },
    { priceRange: "₹2000+", count: 1200, avgRating: 4.1 },
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchLocations();
    fetchAgents();
    fetchLocationRatings();
    fetchAgentPerformance();
    fetchAllReviews();
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, [location, agentName, rating, sentiment, navigate]);

  const fetchLocations = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await axios.get('http://localhost:5000/api/analysis/locations', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Received locations:', response.data.locations);
      if (response.data && response.data.locations) {
        setLocations(response.data.locations);
      } else {
        setError('Failed to load locations');
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      setError('Failed to load locations. Please try again later.');
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    }
  };

  const fetchAgents = async () => {
    try {
      setIsLoadingAgents(true);
      setError('');
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await axios.get('http://localhost:5000/api/analysis/agents', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Received agents:', response.data.agents);
      if (response.data && response.data.agents) {
        setAgents(response.data.agents);
      } else {
        setError('No agents found in the system');
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
      setError('Failed to load agents. Please try again later.');
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } finally {
      setIsLoadingAgents(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await axios.get('http://localhost:5000/api/analysis/dashboard', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        params: { 
          location, 
          agentName,
          rating: rating || undefined,
          sentiment 
        }
      });
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    }
  };

  const fetchLocationRatings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await axios.get('http://localhost:5000/api/analysis/location-ratings', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setLocationRatings(response.data);
    } catch (error) {
      console.error('Error fetching location ratings:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    }
  };

  const fetchAgentPerformance = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await axios.get('http://localhost:5000/api/analysis/agent-performance', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setAgentPerformance(response.data);
    } catch (error) {
      console.error('Error fetching agent performance:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    }
  };

  const fetchAllReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await axios.get('http://localhost:5000/api/reviews/getreviews', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllReviews(response.data.data);
      setFilteredReviews(response.data.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    }
  };

  const handleFilter = () => {
    let filtered = [...allReviews];
    
    if (location) {
      filtered = filtered.filter(review => review.location === location);
    }
    if (agentName) {
      filtered = filtered.filter(review => review.agentName === agentName);
    }
    if (rating) {
      filtered = filtered.filter(review => review.rating === parseInt(rating));
    }
    if (sentiment) {
      filtered = filtered.filter(review => review.tags.sentiment === sentiment);
    }
    
    setFilteredReviews(filtered);
    setCurrentPage(1);
  };

  useEffect(() => {
    handleFilter();
  }, [location, agentName, rating, sentiment]);

  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = filteredReviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);

  if (!dashboardData) return <div className="flex justify-center items-center h-screen text-white text-xl">Loading...</div>;

  return (
    <div className="p-8 bg-gray-950 min-h-screen text-white">
      <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
        <h2 className="text-3xl font-semibold">Delivery Agent Analytics Dashboard</h2>
        {user.role === 'admin' && (
          <button 
            className="bg-orange-600 hover:bg-orange-700 transition px-5 py-2 rounded-lg font-medium" 
            onClick={() => navigate('/admin')}
          >
            Admin Panel
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 bg-red-900 text-white p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium mb-2">Location</label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Locations</option>
            {locations && locations.length > 0 ? (
              locations.map((loc, index) => (
                <option key={index} value={loc}>
                  {loc}
                </option>
              ))
            ) : (
              <option value="" disabled>Loading locations...</option>
            )}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Agent Name</label>
          <select
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
            disabled={isLoadingAgents}
          >
            <option value="">All Agents</option>
            {isLoadingAgents ? (
              <option value="" disabled>Loading agents...</option>
            ) : agents.length > 0 ? (
              agents.map((agent, index) => (
                <option key={index} value={agent}>
                  {agent}
                </option>
              ))
            ) : (
              <option value="" disabled>No agents available</option>
            )}
          </select>
          {error && error.includes('agents') && (
            <p className="mt-1 text-sm text-red-500">{error}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Rating</label>
          <select
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Ratings</option>
            {[1, 2, 3, 4, 5].map((value) => (
              <option key={value} value={value}>
                {value} Star{value !== 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Sentiment</label>
          <select
            value={sentiment}
            onChange={(e) => setSentiment(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Sentiments</option>
            <option value="Positive">Positive</option>
            <option value="Neutral">Neutral</option>
            <option value="Negative">Negative</option>
          </select>
        </div>
      </div>

      {/* Detailed Reviews Table */}
      <div className="bg-gray-900 p-6 rounded-xl shadow-md mb-8">
        <h3 className="text-lg font-semibold mb-4 text-white">Detailed Reviews</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-left">Location</th>
                <th className="px-4 py-2 text-left">Agent</th>
                <th className="px-4 py-2 text-left">Rating</th>
                <th className="px-4 py-2 text-left">Sentiment</th>
                <th className="px-4 py-2 text-left">Performance</th>
                <th className="px-4 py-2 text-left">Accuracy</th>
                <th className="px-4 py-2 text-left">Delivery Time</th>
                <th className="px-4 py-2 text-left">Order Price</th>
                <th className="px-4 py-2 text-left">Discount</th>
                <th className="px-4 py-2 text-left">Review Text</th>
                <th className="px-4 py-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {currentReviews.map((review) => (
                <tr key={review._id} className="hover:bg-gray-800">
                  <td className="px-4 py-2">{review.location}</td>
                  <td className="px-4 py-2">{review.agentName}</td>
                  <td className="px-4 py-2">{review.rating}</td>
                  <td className="px-4 py-2">{review.tags.sentiment}</td>
                  <td className="px-4 py-2">{review.tags.performance}</td>
                  <td className="px-4 py-2">{review.tags.accuracy}</td>
                  <td className="px-4 py-2">{review.deliveryTime}</td>
                  <td className="px-4 py-2">₹{review.orderPrice}</td>
                  <td className="px-4 py-2">{review.discountApplied ? `₹${review.discountApplied}` : 'None'}</td>
                  <td className="px-4 py-2 max-w-xs truncate">{review.reviewText}</td>
                  <td className="px-4 py-2">{new Date(review.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-400">
            Showing {indexOfFirstReview + 1} to {Math.min(indexOfLastReview, filteredReviews.length)} of {filteredReviews.length} reviews
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-900 p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-4">Sentiment Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dashboardData.sentimentDistribution}
                dataKey="count"
                nameKey="_id"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {dashboardData.sentimentDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-4">Performance Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboardData.performanceStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="gray" />
              <XAxis dataKey="_id" stroke="white" />
              <YAxis stroke="white" />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', color: 'white' }} />
              <Legend />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Key Metrics Section */}
      <h2 className="text-2xl font-bold text-white mt-8 mb-6">KEY METRICS</h2>

      {/* Location Ratings Chart */}
      <div className="bg-gray-900 p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold mb-4">Average Agent Ratings per Location</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={locationRatings}>
              <CartesianGrid strokeDasharray="3 3" stroke="gray" />
              <XAxis 
                dataKey="_id" 
                stroke="white"
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
              />
              <YAxis 
                domain={[2.8, 3.4]} 
                stroke="white"
                tickCount={7}
                ticks={[2.8, 2.9, 3.0, 3.1, 3.2, 3.3, 3.4]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  color: 'white',
                  border: '1px solid #374151'
                }}
                labelStyle={{ color: 'white' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="avgRating" 
                stroke="#F59E0B" 
                strokeWidth={2}
                dot={{ fill: '#F59E0B', strokeWidth: 2 }}
                name="Average Rating"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Orders by Price Range Chart */}
      <div className="bg-gray-900 p-6 rounded-xl shadow-md mt-8">
        <h3 className="text-lg font-semibold mb-4 text-white">Orders by Price Range</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={priceRangeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="gray" />
            <XAxis dataKey="priceRange" stroke="white" />
            <YAxis yAxisId="left" stroke="#10B981" />
            <YAxis yAxisId="right" stroke="#F59E0B" orientation="right" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F2937', color: 'white', border: '1px solid #374151' }} 
              labelStyle={{ color: 'white' }} 
            />
            <Legend />
            <Bar yAxisId="left" dataKey="count" fill="#10B981" name="Number of Orders" />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="avgRating" 
              stroke="#F59E0B" 
              strokeWidth={2} 
              dot={{ fill: '#F59E0B', strokeWidth: 2 }} 
              name="Average Rating" 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Most Common Customer Complaints */}
      <div className="bg-gray-900 p-6 rounded-xl shadow-md mt-8">
        <h3 className="text-lg font-semibold mb-4 text-white">Most Common Customer Complaints</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart 
            data={[
              { complaint: 'Late Delivery', count: 245, percentage: 32 },
              { complaint: 'Wrong Items', count: 189, percentage: 25 },
              { complaint: 'Missing Items', count: 156, percentage: 21 },
              { complaint: 'Poor Packaging', count: 98, percentage: 13 },
              { complaint: 'Rude Behavior', count: 67, percentage: 9 }
            ]}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="gray" />
            <XAxis type="number" stroke="white" />
            <YAxis dataKey="complaint" type="category" stroke="white" width={120} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F2937', color: 'white', border: '1px solid #374151' }}
              formatter={(value, name, props) => [
                `${value} complaints (${props.payload.percentage}%)`,
                'Frequency'
              ]}
            />
            <Legend />
            <Bar 
              dataKey="count" 
              fill="#EF4444" 
              name="Number of Complaints"
              label={{ position: 'right', fill: 'white' }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top & Bottom Performing Agents */}
      <div className="grid grid-cols-1 gap-8 mt-8">
        {/* Top Performing Agents */}
        <div className="bg-gray-900 p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-green-500">Top Performing Agents</h3>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            {/* Swiggy Instamart Card */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-white mb-3">Swiggy Instamart</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg. Rating:</span>
                  <span className="text-green-400">3.02</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Order Accuracy:</span>
                  <span className="text-yellow-400">49.92%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Delivery Time:</span>
                  <span className="text-blue-400">35.1 min</span>
                </div>
              </div>
            </div>

            {/* Zepto Card */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-white mb-3">Zepto</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg. Rating:</span>
                  <span className="text-green-400">3.01</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Order Accuracy:</span>
                  <span className="text-yellow-400">52.18%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Delivery Time:</span>
                  <span className="text-blue-400">35.06 min</span>
                </div>
              </div>
            </div>

            {/* Blinkit Card */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-white mb-3">Blinkit</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg. Rating:</span>
                  <span className="text-green-400">2.99</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Order Accuracy:</span>
                  <span className="text-yellow-400">50.16%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Delivery Time:</span>
                  <span className="text-blue-400">34.64 min</span>
                </div>
              </div>
            </div>

            {/* JioMart Card */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-white mb-3">JioMart</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg. Rating:</span>
                  <span className="text-green-400">2.98</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Order Accuracy:</span>
                  <span className="text-yellow-400">48.86%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Delivery Time:</span>
                  <span className="text-blue-400">35.02 min</span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Comparison Chart */}
          <div className="mt-6 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  {
                    name: 'Swiggy Instamart',
                    rating: 3.02,
                    accuracy: 49.92,
                    deliveryTime: 35.1
                  },
                  {
                    name: 'Zepto',
                    rating: 3.01,
                    accuracy: 52.18,
                    deliveryTime: 35.06
                  },
                  {
                    name: 'Blinkit',
                    rating: 2.99,
                    accuracy: 50.16,
                    deliveryTime: 34.64
                  },
                  {
                    name: 'JioMart',
                    rating: 2.98,
                    accuracy: 48.86,
                    deliveryTime: 35.02
                  }
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="gray" />
                <XAxis dataKey="name" stroke="white" />
                <YAxis stroke="white" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    color: 'white',
                    border: '1px solid #374151'
                  }}
                />
                <Legend />
                <Bar dataKey="rating" name="Avg. Rating" fill="#10B981" />
                <Bar dataKey="accuracy" name="Order Accuracy %" fill="#F59E0B" />
                <Bar dataKey="deliveryTime" name="Delivery Time (min)" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Performing Agents Note */}
        <div className="bg-gray-900 p-6 rounded-xl shadow-md mt-4">
          <h3 className="text-lg font-semibold mb-4 text-red-500">Bottom Performing Agents</h3>
          <p className="text-gray-300 leading-relaxed">
            Interestingly, the bottom performers are the same agents but ranked differently due to low ratings and higher complaints. 
            This suggests that performance varies across orders rather than any one company dominating consistently.
          </p>
          <div className="mt-4 bg-gray-800 p-4 rounded-lg">
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Performance varies significantly across different orders and locations</li>
              <li>No single company consistently underperforms</li>
              <li>Ratings and complaints fluctuate based on specific deliveries</li>
              <li>Suggests opportunity for all companies to improve consistency</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
