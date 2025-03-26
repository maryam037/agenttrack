const express = require("express");
const ReviewModel = require("../models/Review");
const { analyzeReview } = require("../utils/ReviewAnalysis/analyzeReview");
const authenticate = require("../utils/auth/authenticate");
const authorizeAdmin = require("../utils/auth/authorize");
const router = express.Router();

// Get all reviews
// Update getreviews with filtering
router.get("/getreviews", authenticate, async (req, res) => {
  try {
    const { location, minRating, maxRating, sentiment } = req.query;
    const query = {};
    
    if (location) query.location = location;
    if (minRating) query.rating = { ...query.rating, $gte: parseFloat(minRating) };
    if (maxRating) query.rating = { ...query.rating, $lte: parseFloat(maxRating) };
    if (sentiment) query["tags.sentiment"] = sentiment;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      ReviewModel.find(query)
        .skip(skip)
        .limit(limit),
      ReviewModel.countDocuments(query)
    ]);

    res.json({
      data: reviews,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// Submit a new review
router.post("/submit-reviews", authenticate, async (req, res) => {
  try {
    const {
      agentId,
      agentName,
      location,
      reviewText,
      rating,
      orderPrice,
      discountApplied,
      customerId,
    } = req.body;
    
    if (!agentId) {
      return res.status(400).json({ error: "agentId is required" });
    }

    const { tags, complaints } = analyzeReview(reviewText, rating);

    const newReview = new ReviewModel({
      agentId,
      agentName,
      location,
      reviewText,
      rating,
      orderPrice,
      discountApplied,
      customerId,
      tags,
      complaints,
    });

    await newReview.save();
    res
      .status(201)
      .json({ message: "Review created successfully", data: newReview });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ error: "Failed to create review" });
  }
});

// Update review tags (admin only)
router.put("/updatetag/:id", authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { sentiment, performance, accuracy, complaints } = req.body;

    const updatedReview = await ReviewModel.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          "tags.sentiment": sentiment,
          "tags.performance": performance,
          "tags.accuracy": accuracy,
          complaints: complaints || [],
        },
      },
      { new: true }
    );

    if (!updatedReview) {
      return res.status(404).json({ error: "Review not found" });
    }

    res.json({ message: "Review updated successfully", data: updatedReview });
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ error: "Failed to update review" });
  }
});

module.exports = router;