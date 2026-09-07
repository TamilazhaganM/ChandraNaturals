import mongoose from 'mongoose';

/**
 * Connect to MongoDB Atlas (Cloud) or local MongoDB instance
 */
export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ MONGODB_URI is not defined in environment variables!');
    console.warn('⚠️  Please add MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/chandra_naturals to backend/.env');
    throw new Error('MONGODB_URI environment variable is missing');
  }

  // Detect unreplaced placeholder in Atlas connection string
  if (uri.includes('<password>') || uri.includes('<db_password>') || uri.includes('<username>')) {
    console.error('❌ MONGODB_URI contains unreplaced placeholder text (<password> or <username>)!');
    console.warn('⚠️  Please replace <password> with your actual MongoDB Atlas database user password in backend/.env');
    throw new Error('MongoDB Atlas connection string contains unreplaced password placeholder');
  }

  const isAtlas = uri.startsWith('mongodb+srv://') || uri.includes('.mongodb.net');

  // Connection options optimized for MongoDB Atlas and serverless/cloud environments
  const mongooseOptions = {
    serverSelectionTimeoutMS: 15000, // 15 seconds to allow cloud DNS SRV resolution
    socketTimeoutMS: 45000,
    maxPoolSize: isAtlas ? 25 : 10,
    minPoolSize: 2,
    retryWrites: true,
    w: 'majority',
    family: 4 // Prefer IPv4 to prevent Node.js 18+ dual-stack IPv6 DNS delays
  };

  // Fallback to 'chandra_naturals' db if not specified in connection string
  const dbName = process.env.DB_NAME || 'chandra_naturals';
  if (!uri.includes('mongodb.net/') || uri.match(/mongodb\.net\/\?/)) {
    mongooseOptions.dbName = dbName;
  }

  try {
    const conn = await mongoose.connect(uri, mongooseOptions);

    console.log(`🌿 MongoDB Connected: ${isAtlas ? '☁️  MongoDB Atlas Cluster' : '💻 Local Database'}`);
    console.log(`📡 Host: ${conn.connection.host}`);
    console.log(`📂 Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);

    if (isAtlas) {
      console.warn('\n--- 🛠️  MongoDB Atlas Troubleshooting Guide ---');
      if (error.name === 'MongooseServerSelectionError' || error.message.includes('ENOTFOUND') || error.message.includes('querySrv')) {
        console.warn('1. 🌐 IP Whitelist: Go to MongoDB Atlas -> "Network Access" -> ensure "0.0.0.0/0" (Allow Access from Anywhere) is active.');
        console.warn('2. 📡 DNS/Network: Verify your internet connection or firewall permits DNS SRV records.');
      }
      if (error.message.includes('bad auth') || error.message.includes('Authentication failed')) {
        console.warn('1. 🔑 User Credentials: Verify the username & password in Atlas -> "Database Access".');
        console.warn('2. 🔤 Special characters: If your password contains characters like @, #, $, or %, ensure it is URL-encoded.');
      }
      console.warn('------------------------------------------------\n');
    } else {
      console.warn('⚠️  Hint: Ensure local MongoDB service is running, or switch MONGODB_URI to MongoDB Atlas in backend/.env');
    }

    throw error;
  }
};

// Connection event listeners
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected. Attempting automatic reconnection...');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconnected successfully.');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB runtime error:', err.message);
});

export default connectDB;
