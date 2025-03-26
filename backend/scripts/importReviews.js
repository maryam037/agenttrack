const mongoose = require('mongoose');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const ReviewModel = require('../models/Review');
require('dotenv').config();

const results = [];

// Function to generate a random ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Function to determine sentiment from rating and feedback
const determineSentiment = (rating, feedback) => {
  if (rating >= 4) return "Positive";
  if (rating <= 2) return "Negative";
  return "Neutral";
};

// Function to determine performance from delivery time
const determinePerformance = (deliveryTime) => {
  const time = parseInt(deliveryTime);
  if (time <= 30) return "Fast";
  if (time >= 45) return "Slow";
  return "Average";
};

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Read and parse the CSV file
    fs.createReadStream(path.join(__dirname, '../delivery_reviews.csv'))
      .pipe(csv())
      .on('data', (data) => {
        // Transform the data to match our schema
        const rating = parseInt(data['Rating']) || 3;
        const deliveryTime = parseInt(data['Delivery Time (min)']) || 35;
        const orderAccuracy = data['Order Accuracy'] === 'Yes' ? "Order Accurate" : "Order Mistake";
        
        const review = {
          agentId: generateId(),
          agentName: data['Agent Name'],
          location: data['Location'],
          reviewText: data['Review Text'],
          rating: rating,
          orderPrice: parseFloat(data['Price Range'].replace(/[^\d.]/g, '')) || 500,
          discountApplied: data['Discount Applied'] === 'Yes' ? 50 : 0,
          customerId: generateId(),
          deliveryTime: deliveryTime,
          date: new Date(),
          tags: {
            sentiment: determineSentiment(rating, data['Customer Feedback Type']),
            performance: determinePerformance(deliveryTime),
            accuracy: orderAccuracy
          },
          complaints: []
        };

        // Add complaints based on feedback and accuracy
        if (data['Customer Feedback Type'] === 'Complaint') {
          if (deliveryTime > 45) review.complaints.push('Late Delivery');
          if (orderAccuracy === 'Order Mistake') review.complaints.push('Wrong Item');
          if (data['Product Availability'] === 'No') review.complaints.push('Missing Item');
        }

        results.push(review);
      })
      .on('end', async () => {
        try {
          // Clear existing reviews
          await ReviewModel.deleteMany({});
          console.log('Cleared existing reviews');

          // Insert new reviews in batches of 100
          const batchSize = 100;
          for (let i = 0; i < results.length; i += batchSize) {
            const batch = results.slice(i, i + batchSize);
            await ReviewModel.insertMany(batch, { ordered: false });
            console.log(`Imported reviews ${i + 1} to ${Math.min(i + batchSize, results.length)}`);
          }
          
          console.log(`Successfully imported ${results.length} reviews`);
        } catch (error) {
          console.error('Error importing reviews:', error);
        } finally {
          mongoose.connection.close();
        }
      });
  })
  .catch((err) => {
    console.error('MongoDB Connection Error:', err);
  }); 