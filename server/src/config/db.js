import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vyaparsetu?directConnection=true';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[VyaparSetu Database] Connected to MongoDB host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[VyaparSetu Database Error] Failed to connect to MongoDB at ${uri}: ${error.message}`);
    console.warn(`[VyaparSetu Database Warning] Ensure MongoDB is running locally or set MONGODB_URI in server/.env`);
    return null;
  }
};
