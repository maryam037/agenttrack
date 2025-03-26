const express = require("express");
const ReviewModel = require("../models/Review");
const authenticate = require("../utils/auth/authenticate");
const router = express.Router();

// Get unique locations
router.get("/locations", authenticate, async (req, res) => {
  try {
    // First get all reviews to check the data
    const allReviews = await ReviewModel.find({}, 'location');
    console.log('Total reviews:', allReviews.length);
    
    // Get unique locations
    const locations = await ReviewModel.distinct("location");
    console.log('Unique locations:', locations);
    
    // Sort locations alphabetically
    locations.sort();
    
    res.json({ locations });
  } catch (error) {
    console.error('Error in locations endpoint:', error);
    res.status(500).json({ error: "Failed to fetch locations" });
  }
});

// Get unique agent names
router.get("/agents", authenticate, async (req, res) => {
  try {
    // Get unique agent names
    const agents = await ReviewModel.distinct("agentName");
    console.log('Unique agents:', agents);
    
    // Sort agent names alphabetically
    agents.sort();
    
    res.json({ agents });
  } catch (error) {
    console.error('Error in agents endpoint:', error);
    res.status(500).json({ error: "Failed to fetch agent names" });
  }
});

// Add new endpoints for specific metrics
router.get("/location-ratings", authenticate, async (req, res) => {
  try {
    const results = await ReviewModel.aggregate([
      { $group: { 
        _id: "$location", 
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 }
      }},
      { $sort: { avgRating: -1 } }
    ]);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch location ratings" });
  }
});

router.get("/agent-performance", authenticate, async (req, res) => {
  try {
    const { top = 10, bottom = 10 } = req.query;
    
    // Calculate performance scores with weighted factors
    const results = await ReviewModel.aggregate([
      // First, group by agent
      { 
        $group: { 
          _id: "$agentId",
          agentName: { $first: "$agentName" },
          avgRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 },
          // Calculate recent average (last 30 days)
          recentReviews: {
            $push: {
              rating: "$rating",
              date: "$date"
            }
          }
        }
      },
      // Add performance score calculation
      {
        $addFields: {
          // Weight recent reviews more heavily
          recentAvgRating: {
            $avg: {
              $filter: {
                input: "$recentReviews",
                as: "review",
                cond: {
                  $gte: [
                    "$$review.date",
                    { $subtract: [new Date(), 1000 * 60 * 60 * 24 * 30] } // last 30 days
                  ]
                }
              }
            }
          }
        }
      },
      {
        $addFields: {
          // Calculate weighted performance score
          performanceScore: {
            $multiply: [
              // Base average rating (40% weight)
              { $multiply: ["$avgRating", 0.4] },
              // Recent performance (40% weight)
              { $multiply: [{ $ifNull: ["$recentAvgRating", "$avgRating"] }, 0.4] },
              // Review count factor (20% weight) - normalized between 0 and 1
              { 
                $add: [
                  0.2,
                  { 
                    $multiply: [
                      0.8,
                      { 
                        $min: [
                          1,
                          { $divide: ["$reviewCount", 100] } // normalize review count
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        }
      },
      // Sort by performance score
      { $sort: { performanceScore: -1 } },
      // Project only needed fields
      {
        $project: {
          _id: 1,
          agentName: 1,
          avgRating: 1,
          reviewCount: 1,
          recentAvgRating: 1,
          performanceScore: 1
        }
      }
    ]);
    
    res.json({
      top: results.slice(0, parseInt(top)),
      bottom: results.slice(-parseInt(bottom))
    });
  } catch (error) {
    console.error('Error in agent-performance endpoint:', error);
    res.status(500).json({ error: "Failed to fetch agent performance" });
  }
});

// Dashboard metrics
router.get("/dashboard", authenticate, async (req, res) => {
  try {
    const { location, agentName, rating, sentiment } = req.query;
    
    // Build the match stage for filtering
    const matchStage = {};
    if (location) matchStage.location = location;
    if (agentName) matchStage.agentName = agentName;
    if (rating) matchStage.rating = parseInt(rating);
    if (sentiment) matchStage['tags.sentiment'] = sentiment;

    const [
      totalReviews,
      averageRating,
      sentimentDistribution,
      complaintStats,
      performanceStats
    ] = await Promise.all([
      ReviewModel.countDocuments(matchStage),
      ReviewModel.aggregate([
        { $match: matchStage },
        { $group: { _id: null, avg: { $avg: "$rating" } } }
      ]),
      ReviewModel.aggregate([
        { $match: matchStage },
        { $group: { _id: "$tags.sentiment", count: { $sum: 1 } } }
      ]),
      ReviewModel.aggregate([
        { $match: matchStage },
        { $unwind: "$complaints" },
        { $group: { _id: "$complaints", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),
      ReviewModel.aggregate([
        { $match: matchStage },
        { $group: { _id: "$tags.performance", count: { $sum: 1 } } }
      ])
    ]);

    res.json({
      totalReviews,
      averageRating: averageRating[0]?.avg || 0,
      sentimentDistribution,
      complaintStats,
      performanceStats
    });
  } catch (error) {
    console.error('Error in dashboard endpoint:', error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

// Get orders by price range
router.get("/orders-by-price", authenticate, async (req, res) => {
  try {
    const results = await ReviewModel.aggregate([
      {
        $bucket: {
          groupBy: "$orderPrice",
          boundaries: [0, 500, 1000, 1500, 2000, 2500, 3000],
          default: "3000+",
          output: {
            count: { $sum: 1 },
            avgRating: { $avg: "$rating" }
          }
        }
      },
      {
        $project: {
          priceRange: {
            $switch: {
              branches: [
                { case: { $eq: ["$_id", "3000+"] }, then: "₹3000+" },
                { case: { $eq: ["$_id", 0] }, then: "₹0-500" },
                { case: { $eq: ["$_id", 500] }, then: "₹500-1000" },
                { case: { $eq: ["$_id", 1000] }, then: "₹1000-1500" },
                { case: { $eq: ["$_id", 1500] }, then: "₹1500-2000" },
                { case: { $eq: ["$_id", 2000] }, then: "₹2000-2500" },
                { case: { $eq: ["$_id", 2500] }, then: "₹2500-3000" }
              ],
              default: "Unknown"
            }
          },
          count: 1,
          avgRating: 1
        }
      },
      { $sort: { "_id": 1 } }
    ]);
    
    res.json(results);
  } catch (error) {
    console.error('Error in orders-by-price endpoint:', error);
    res.status(500).json({ error: "Failed to fetch orders by price range" });
  }
});

module.exports = router;