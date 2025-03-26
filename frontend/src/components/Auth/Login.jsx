import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const createAdminAccount = async () => {
    try {
      // Initialize admin account
      await axios.post('http://localhost:5000/api/auth/init-admin');
      console.log('Admin account initialized');
    } catch (error) {
      console.error('Admin initialization error:', error);
      // We don't throw the error here as the admin might already exist
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      // If trying to login as admin, ensure admin account exists
      if (formData.email.toLowerCase() === 'admin' || formData.email.toLowerCase() === 'admin@admin.com') {
        await createAdminAccount();
      }

      // Proceed with login
      const loginData = {
        email: formData.email.toLowerCase(),
        password: formData.email.toLowerCase() === 'admin' || formData.email.toLowerCase() === 'admin@admin.com' 
          ? 'admin123' 
          : formData.password
      };

      const response = await axios.post('http://localhost:5000/api/auth/login', loginData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError(
        error.response?.data?.error || 
        error.response?.data?.details || 
        'Login failed. Please try again.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-black">
          Delivery Agent Reviews
        </h2>
        <h3 className="mt-6 text-center text-2xl font-bold text-gray-900">
          Sign in to your account
        </h3>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border-2 border-mustard-500">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email or Username
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="text"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-mustard-500 focus:border-mustard-500"
                  placeholder="Enter email or username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-mustard-500 focus:border-mustard-500"
                  placeholder="Enter your password"
                />
              </div>
              {(formData.email.toLowerCase() === 'admin' || formData.email.toLowerCase() === 'admin@admin.com') && (
                <p className="mt-2 text-sm text-gray-500">
                  Default admin password: admin123
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-mustard-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mustard-500"
              >
                Sign in
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Don't have an account?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/signup"
                className="font-medium text-mustard-600 hover:text-mustard-500"
              >
                Sign up now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 