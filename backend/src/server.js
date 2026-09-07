import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';
import { autoSeedIfEmpty } from './seeds/seedDatabase.js';
import mongoose from 'mongoose';

const PORT = process.env.PORT || 5000;

// Start server function
const startServer = async () => {
  try {
    // Attempt database connection
    try {
      await connectDB();
      // Auto-initialize inventory, categories, and admin if database is empty
      await autoSeedIfEmpty();
    } catch (dbErr) {
      console.warn('⚠️  Database connection postponed or failed. Server will still start to allow configuration verification.');
    }

    const server = app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🌿 Chandra Naturals API Server running on port ${PORT}`);
      console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
      console.log(`=======================================================`);
    });

    // Graceful Shutdown Handler
    const shutdown = async (signal) => {
      console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        console.log('💤 HTTP server closed.');
        try {
          await mongoose.connection.close(false);
          console.log('🌿 MongoDB connection closed.');
        } catch (e) {
          // ignore error on close
        }
        process.exit(0);
      });

      // Force shutdown if stuck after 10s
      setTimeout(() => {
        console.error('❌ Forcefully shutting down after timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Fatal error during server startup:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

startServer();
