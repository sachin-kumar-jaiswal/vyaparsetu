import mongoose from 'mongoose';

export const getMongoUri = () => {
  const configuredUri = process.env.MONGODB_URI?.trim();
  const uri = configuredUri
    ? configuredUri.replace(/^MONGODB_URI\s*=\s*/i, '').replace(/^(['"])(.*)\1$/, '$2').trim()
    : 'mongodb://127.0.0.1:27017/vyaparsetu?directConnection=true';

  if (!/^mongodb(?:\+srv)?:\/\//i.test(uri)) {
    throw new Error('MONGODB_URI must start with mongodb:// or mongodb+srv://');
  }

  return uri;
};

export const connectDB = async () => {
  const uri = getMongoUri();
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[VyaparSetu Database] Connected to MongoDB host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[VyaparSetu Database Error] Failed to connect to MongoDB: ${error.message}`);
    throw error;
  }
};
