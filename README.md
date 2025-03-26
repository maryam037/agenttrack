# AgentTrack - Delivery Agent Analytics Dashboard

A MERN stack application that processes delivery agent reviews and provides insights through a comprehensive dashboard.

## Features

- **Data Processing & Tagging**
  - Automatic review tagging based on sentiment, performance, and accuracy
  - Manual review tagging through admin panel
  - Support for 5000+ delivery reviews

- **Dashboard & Analytics**
  - Average Agent Ratings per location
  - Top & Bottom Performing Agents
  - Most Common Customer Complaints
  - Orders by Price Range & Discount Applied
  - Interactive charts and visualizations
  - Detailed review table with filtering and pagination

- **Role-Based Access Control**
  - Admin: Full access to analytics and review management
  - User: View-only access to analytics
  - JWT-based authentication

## Tech Stack

- **Frontend**: React.js, TailwindCSS, Recharts
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT, bcrypt

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/agenttrack.git
cd agenttrack
```

2. Install dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables
Create `.env` files in both frontend and backend directories:

Backend `.env`:
```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

Frontend `.env`:
```
REACT_APP_API_URL=http://localhost:5000
```

4. Start the application
```bash
# Start backend server
cd backend
npm start

# Start frontend development server
cd frontend
npm start
```

## Project Structure

```
agenttrack/
├── backend/
│   ├── config/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── utils/
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.js
│   └── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Dataset: Fast Delivery Agent Reviews
- Icons: Heroicons
- Charts: Recharts 