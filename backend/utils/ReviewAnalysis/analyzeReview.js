const natural = require("natural");
const SentimentAnalyzer = natural.SentimentAnalyzer;
const stemmer = natural.PorterStemmer;
const analyzer = new SentimentAnalyzer("English", stemmer, "afinn");

// Performance analysis based on rating
function analyzePerformance(rating) {
  return rating >= 4 ? "Fast" : rating <= 2 ? "Slow" : "Average";
}

// Check order accuracy from review text
function checkAccuracy(text) {
  if (!text) return "Order Accurate";
  const lowerText = text.toLowerCase();
  return lowerText.includes("wrong") ||
    lowerText.includes("missing") ||
    lowerText.includes("incorrect")
    ? "Order Mistake"
    : "Order Accurate";
}

// Detect complaints in review text
function detectComplaints(text) {
  if (!text) return [];

  const complaintsList = {
    "Late Delivery": ["late", "delayed", "took too long", "waiting"],
    "Damaged Package": ["damaged", "broken", "cracked", "torn"],
    "Wrong Item": ["wrong item", "incorrect", "not what I ordered"],
    "Rude Behavior": ["rude", "impolite", "bad attitude"],
    "Missing Item": ["missing", "not included", "wasn't there"],
  };

  return Object.keys(complaintsList).filter((complaint) =>
    complaintsList[complaint].some((word) => text.toLowerCase().includes(word))
  );
}

// Analyze sentiment of review text
function analyzeSentiment(text) {
  if (!text) return "Neutral";

  const tokenized = text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/);

  try {
    const score = analyzer.getSentiment(tokenized);
    console.log(`Sentiment Score: ${score} | Text: "${text}"`);

    if (score > 0) return "Positive";
    if (score < 0) return "Negative";

    const positiveWords = [
      "good",
      "great",
      "excellent",
      "love",
      "happy",
      "fast",
    ];
    const negativeWords = ["bad", "terrible", "poor", "hate", "slow", "worst"];

    if (positiveWords.some((word) => text.includes(word))) return "Positive";
    if (negativeWords.some((word) => text.includes(word))) return "Negative";

    return "Neutral";
  } catch (error) {
    console.error("Sentiment Analysis Error:", error);
    return "Neutral";
  }
}

// Main review analysis function that combines all analyses
function analyzeReview(text, rating) {
  return {
    tags: {
      sentiment: analyzeSentiment(text),
      performance: analyzePerformance(rating),
      accuracy: checkAccuracy(text),
    },
    complaints: detectComplaints(text),
  };
}

module.exports = {
  analyzeReview,
  analyzePerformance,
  checkAccuracy,
  detectComplaints,
  analyzeSentiment,
};