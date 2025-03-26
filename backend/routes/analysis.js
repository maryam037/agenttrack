const express = require("express");
const ReviewModel = require("../models/Review");
const UserModel = require("../models/User");
const authenticate = require("../utils/auth/authentication");
const { authorizeAdmin } = require("../utils/auth/authorization");
const router = express.Router();

// Get all unique locations
router.get("/locations", authenticate, async (req, res) => {
  try {
    const locations = await ReviewModel.distinct("location");
    res.json({ locations });
  } catch (error) {
    console.error("Error fetching locations:", error);
    res.status(500).json({ error: "Failed to fetch locations" });
  }
});

// Get all agents with their performance metrics
router.get("/agents", authenticate, async (req, res) => {
  try {
    const agents = await ReviewModel.aggregate([
      {
        $group: {
          _id: "$agentId",
          agentName: { $first: "$agentName" },
          location: { $first: "$location" },
          totalReviews: { $sum: 1 },
          averageRating: { $avg: "$rating" },
          totalComplaints: { $sum: { $size: "$complaints" } },
          performance: { $avg: { $cond: [{ $eq: ["$tags.performance", "good"] }, 1, 0] } },
          accuracy: { $avg: { $cond: [{ $eq: ["$tags.accuracy", "good"] }, 1, 0] } },
          sentiment: { $avg: { $cond: [{ $eq: ["$tags.sentiment", "positive"] }, 1, 0] } }
        }
      },
      {
        $project: {
          _id: 1,
          agentName: 1,
          location: 1,
          totalReviews: 1,
          averageRating: { $round: ["$averageRating", 2] },
          totalComplaints: 1,
          performance: { $round: [{ $multiply: ["$performance", 100] }, 2] },
          accuracy: { $round: [{ $multiply: ["$accuracy", 100] }, 2] },
          sentiment: { $round: [{ $multiply: ["$sentiment", 100] }, 2] }
        }
      }
    ]);

    res.json({ agents });
  } catch (error) {
    console.error("Error fetching agents:", error);
    res.status(500).json({ error: "Failed to fetch agents data" });
  }
});

// Get analytics overview (admin only)
router.get("/overview", authenticate, authorizeAdmin, async (req, res) => {
  try {
    const [
      totalReviews,
      totalUsers,
      averageRating,
      totalComplaints,
      performanceMetrics
    ] = await Promise.all([
      ReviewModel.countDocuments(),
      UserModel.countDocuments({ role: "user" }),
      ReviewModel.aggregate([{ $group: { _id: null, avg: { $avg: "$rating" } } }]),
      ReviewModel.aggregate([{ $group: { _id: null, total: { $sum: { $size: "$complaints" } } } }]),
      ReviewModel.aggregate([
        {
          $group: {
            _id: null,
            performance: { $avg: { $cond: [{ $eq: ["$tags.performance", "good"] }, 1, 0] } },
            accuracy: { $avg: { $cond: [{ $eq: ["$tags.accuracy", "good"] }, 1, 0] } },
            sentiment: { $avg: { $cond: [{ $eq: ["$tags.sentiment", "positive"] }, 1, 0] } }
          }
        }
      ])
    ]);

    res.json({
      totalReviews,
      totalUsers,
      averageRating: averageRating[0]?.avg || 0,
      totalComplaints: totalComplaints[0]?.total || 0,
      performanceMetrics: {
        performance: performanceMetrics[0]?.performance * 100 || 0,
        accuracy: performanceMetrics[0]?.accuracy * 100 || 0,
        sentiment: performanceMetrics[0]?.sentiment * 100 || 0
      }
    });
  } catch (error) {
    console.error("Error fetching overview:", error);
    res.status(500).json({ error: "Failed to fetch overview data" });
  }
});

// Get dashboard data with filters
router.get("/dashboard", authenticate, async (req, res) => {
  try {
    const { location, agentName, rating, sentiment } = req.query;
    const query = {};
    
    if (location) query.location = location;
    if (agentName) query.agentName = agentName;
    if (rating) query.rating = parseInt(rating);
    if (sentiment) query["tags.sentiment"] = sentiment;

    const [
      totalReviews,
      averageRating,
      totalComplaints,
      performanceMetrics,
      reviewsByLocation,
      sentimentDistribution,
      performanceStats
    ] = await Promise.all([
      ReviewModel.countDocuments(query),
      ReviewModel.aggregate([
        { $match: query },
        { $group: { _id: null, avg: { $avg: "$rating" } } }
      ]),
      ReviewModel.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: { $size: "$complaints" } } } }
      ]),
      ReviewModel.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            performance: { $avg: { $cond: [{ $eq: ["$tags.performance", "good"] }, 1, 0] } },
            accuracy: { $avg: { $cond: [{ $eq: ["$tags.accuracy", "good"] }, 1, 0] } },
            sentiment: { $avg: { $cond: [{ $eq: ["$tags.sentiment", "positive"] }, 1, 0] } }
          }
        }
      ]),
      ReviewModel.aggregate([
        { $match: query },
        {
          $group: {
            _id: "$location",
            count: { $sum: 1 },
            avgRating: { $avg: "$rating" }
          }
        },
        { $project: { location: "$_id", count: 1, avgRating: { $round: ["$avgRating", 2] } } }
      ]),
      ReviewModel.aggregate([
        { $match: query },
        {
          $group: {
            _id: "$tags.sentiment",
            count: { $sum: 1 }
          }
        }
      ]),
      ReviewModel.aggregate([
        { $match: query },
        {
          $group: {
            _id: "$tags.performance",
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    res.json({
      totalReviews,
      averageRating: averageRating[0]?.avg || 0,
      totalComplaints: totalComplaints[0]?.total || 0,
      performanceMetrics: {
        performance: performanceMetrics[0]?.performance * 100 || 0,
        accuracy: performanceMetrics[0]?.accuracy * 100 || 0,
        sentiment: performanceMetrics[0]?.sentiment * 100 || 0
      },
      reviewsByLocation,
      sentimentDistribution: sentimentDistribution || [],
      performanceStats: performanceStats || []
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

// Get location ratings
router.get("/location-ratings", authenticate, async (req, res) => {
  try {
    const locationRatings = await ReviewModel.aggregate([
      {
        $group: {
          _id: "$location",
          count: { $sum: 1 },
          avgRating: { $avg: "$rating" },
          totalComplaints: { $sum: { $size: "$complaints" } }
        }
      },
      {
        $project: {
          location: "$_id",
          count: 1,
          avgRating: { $round: ["$avgRating", 2] },
          totalComplaints: 1
        }
      }
    ]);

    res.json(locationRatings);
  } catch (error) {
    console.error("Error fetching location ratings:", error);
    res.status(500).json({ error: "Failed to fetch location ratings" });
  }
});

// Get agent performance
router.get("/agent-performance", authenticate, async (req, res) => {
  try {
    const agentPerformance = await ReviewModel.aggregate([
      {
        $group: {
          _id: "$agentId",
          agentName: { $first: "$agentName" },
          location: { $first: "$location" },
          totalReviews: { $sum: 1 },
          averageRating: { $avg: "$rating" },
          performance: { $avg: { $cond: [{ $eq: ["$tags.performance", "good"] }, 1, 0] } },
          accuracy: { $avg: { $cond: [{ $eq: ["$tags.accuracy", "good"] }, 1, 0] } },
          sentiment: { $avg: { $cond: [{ $eq: ["$tags.sentiment", "positive"] }, 1, 0] } }
        }
      },
      {
        $project: {
          _id: 1,
          agentName: 1,
          location: 1,
          totalReviews: 1,
          averageRating: { $round: ["$averageRating", 2] },
          performance: { $round: [{ $multiply: ["$performance", 100] }, 2] },
          accuracy: { $round: [{ $multiply: ["$accuracy", 100] }, 2] },
          sentiment: { $round: [{ $multiply: ["$sentiment", 100] }, 2] }
        }
      },
      { $sort: { averageRating: -1 } }
    ]);

    const topAgents = agentPerformance.slice(0, 5);
    const bottomAgents = agentPerformance.slice(-5).reverse();

    res.json({
      top: topAgents,
      bottom: bottomAgents
    });
  } catch (error) {
    console.error("Error fetching agent performance:", error);
    res.status(500).json({ error: "Failed to fetch agent performance" });
  }
});

module.exports = router;