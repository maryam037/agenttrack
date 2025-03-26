require('dotenv').config();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Review = require('../models/Review');
const { analyzeReview } = require('../utils/ReviewAnalysis/analyzeReview');
const connectDB = require('../config/db');
const natural = require('natural');
const tokenizer = new natural.WordTokenizer();

// Connect to DB
connectDB();

// Configuration
const BATCH_SIZE = 100;
const CSV_FILE_PATH = path.join(__dirname, '../delivery_reviews.csv');

const log = (message) => {
  console.log(`[${new Date().toISOString()}] ${message}`);
};

// Function to calculate sentiment score
function calculateSentiment(text) {
    if (!text) return 0;
    
    const tokens = tokenizer.tokenize(text.toLowerCase());
    let score = 0;
    let count = 0;

    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'perfect', 'fast', 'quick', 'friendly', 'helpful'];
    const negativeWords = ['bad', 'poor', 'terrible', 'awful', 'slow', 'late', 'unfriendly', 'rude', 'wrong', 'missing'];

    tokens.forEach(token => {
        if (positiveWords.includes(token)) {
            score += 1;
            count++;
        } else if (negativeWords.includes(token)) {
            score -= 1;
            count++;
        }
    });

    return count > 0 ? score / count : 0;
}

const processBatch = async (batch) => {
  try {
    const result = await Review.insertMany(batch, { ordered: false });
    log(`Processed batch of ${batch.length} records. MongoDB response: ${JSON.stringify(result)}`);
  } catch (error) {
    if (error.writeErrors) {
      log(`Partial batch failure: ${error.writeErrors.length} errors. First error: ${JSON.stringify(error.writeErrors[0])}`);
    } else {
      log(`Batch processing error: ${error.message}`);
    }
  }
};

const importReviews = async () => {
  if (!fs.existsSync(CSV_FILE_PATH)) {
    log(`Error: File not found at ${CSV_FILE_PATH}`);
    log('Please ensure the CSV file exists at backend/delivery_reviews.csv');
    process.exit(1);
  }

  let reviewsBatch = [];
  let totalImported = 0;
  let rowCount = 0;

  log(`Starting import from ${CSV_FILE_PATH}`);

  const stream = fs.createReadStream(CSV_FILE_PATH)
    .pipe(csv());

  for await (const data of stream) {
    rowCount++;
    
    try {
      const { tags, complaints } = analyzeReview(
        data['Review Text'], 
        parseFloat(data.Rating) || 3
      );

      const reviewDoc = {
        agentId: `AGENT_${rowCount}`,
        agentName: data['Agent Name']?.trim(),
        rating: parseFloat(data.Rating) || 3,
        reviewText: data['Review Text']?.trim(),
        location: data.Location?.trim(),
        orderPrice: parseFloat(data['Price Range'] === 'High' ? 100 : data['Price Range'] === 'Medium' ? 50 : 25),
        discountApplied: data['Discount Applied'] === 'Yes' ? 10 : 0,
        deliveryTime: parseInt(data['Delivery Time (min)']) || 0,
        customerId: `CUST_${rowCount}`,
        tags,
        complaints,
        sentimentScore: calculateSentiment(data['Review Text']?.trim())
      };

      log(`Processing row ${rowCount}: Agent Name = ${data['Agent Name']?.trim()}, Document = ${JSON.stringify(reviewDoc)}`);
      reviewsBatch.push(reviewDoc);

      if (reviewsBatch.length >= BATCH_SIZE) {
        await processBatch(reviewsBatch);
        totalImported += reviewsBatch.length;
        reviewsBatch = [];
      }
    } catch (error) {
      log(`Error processing row ${rowCount}: ${error.message}`);
    }
  }

  if (reviewsBatch.length > 0) {
    await processBatch(reviewsBatch);
    totalImported += reviewsBatch.length;
  }

  log(`Import completed. Total rows processed: ${rowCount}`);
  log(`Successfully imported ${totalImported} reviews`);
  await mongoose.disconnect();
  process.exit(0);
};

importReviews().catch(error => {
  log(`Fatal error: ${error.message}`);
  process.exit(1);
});