const mongoose = require("mongoose");
const logger = require("./logger");

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

const connectDB = async (retries = MAX_RETRIES) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI);
      logger.info(`MongoDB connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      if (attempt === retries) {
        logger.fatal({ err: error }, "MongoDB connection failed after all retries");
        process.exit(1);
      }
      logger.warn(`MongoDB connection attempt ${attempt}/${retries} failed, retrying in ${RETRY_DELAY_MS / 1000}s...`);
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    }
  }
};

module.exports = connectDB;
