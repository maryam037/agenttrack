import React from 'react';
import { Link } from 'react-router-dom';

const Admin = () => {
  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Admin Panel</h2>
        <Link to="/dashboard" className="btn btn-secondary">Back to Dashboard</Link>
      </div>

      <div className="row">
        <div className="col-md-4 mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">User Management</h5>
              <div className="list-group">
                <button className="list-group-item list-group-item-action">
                  View All Users
                </button>
                <button className="list-group-item list-group-item-action">
                  Add New User
                </button>
                <button className="list-group-item list-group-item-action">
                  Manage Roles
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Data Management</h5>
              <div className="list-group">
                <button className="list-group-item list-group-item-action">
                  Import Reviews
                </button>
                <button className="list-group-item list-group-item-action">
                  Export Data
                </button>
                <button className="list-group-item list-group-item-action">
                  Data Analytics
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">System Settings</h5>
              <div className="list-group">
                <button className="list-group-item list-group-item-action">
                  General Settings
                </button>
                <button className="list-group-item list-group-item-action">
                  API Configuration
                </button>
                <button className="list-group-item list-group-item-action">
                  Notification Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">System Status</h5>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Component</th>
                      <th>Status</th>
                      <th>Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Database</td>
                      <td><span className="badge bg-success">Online</span></td>
                      <td>Just now</td>
                    </tr>
                    <tr>
                      <td>API Server</td>
                      <td><span className="badge bg-success">Online</span></td>
                      <td>Just now</td>
                    </tr>
                    <tr>
                      <td>Analytics Engine</td>
                      <td><span className="badge bg-success">Online</span></td>
                      <td>Just now</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin; 