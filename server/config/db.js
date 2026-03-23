import mongoose from "mongoose";

export function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

/**
 * Send 503 if MongoDB is not ready. Call at the start of handlers that need the DB.
 * @returns {boolean} true if OK to proceed
 */
export function assertDbConnected(res) {
  if (isDbConnected()) return true;
  res.status(503).json({
    message:
      "Database is not connected. Start MongoDB (e.g. Docker: docker run -p 27017:27017 mongo:7) or set MONGO_URI in server/.env to a MongoDB Atlas connection string.",
  });
  return false;
}

const ConnectDb = async () => {
  if (!process.env.MONGO_URI?.trim()) {
    console.error("MONGO_URI is missing. Add it to server/.env");
    return false;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("Database Connected Successfully");
    return true;
  } catch (error) {
    console.error("Error Connecting to the Database:", error.message);
    return false;
  }
};

export default ConnectDb;
