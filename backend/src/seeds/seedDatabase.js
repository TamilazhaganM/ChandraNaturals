import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { connectDB } from '../config/db.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { ROLES } from '../config/constants.js';
import { seedCategories, seedProducts } from './seedData.js';

/**
 * Core Seeding Function
 * @param {Object} options
 * @param {boolean} options.closeOnFinish - Whether to close mongoose connection and exit process
 * @param {boolean} options.silent - Whether to suppress detailed logs
 */
export const seedDatabase = async ({ closeOnFinish = true, silent = false } = {}) => {
  try {
    if (!silent) console.log('🌱 Starting Chandra Naturals Database Seed...');

    // Connect if not already connected
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    // 1. Seed Categories
    if (!silent) console.log('📂 Seeding categories...');
    for (const cat of seedCategories) {
      await Category.findOneAndUpdate(
        { slug: cat.slug },
        { $set: cat },
        { upsert: true, new: true }
      );
    }
    if (!silent) console.log(`✅ Seeded ${seedCategories.length} categories.`);

    // 2. Map Category references & Seed Products
    if (!silent) console.log('📦 Seeding products & combos...');
    const allCategories = await Category.find();
    const categoryMap = {};
    allCategories.forEach((c) => {
      categoryMap[c.slug] = c._id;
    });

    for (const prod of seedProducts) {
      const prodWithRef = {
        ...prod,
        categoryRef: categoryMap[prod.category] || null
      };

      await Product.findOneAndUpdate(
        { slug: prod.slug },
        { $set: prodWithRef },
        { upsert: true, new: true }
      );
    }
    if (!silent) console.log(`✅ Seeded ${seedProducts.length} authentic products and bundles.`);

    // 3. Seed Default Admin User
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@chandranaturals.com').toLowerCase();
    const adminPhone = (process.env.ADMIN_PHONE || '9876500000').trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPass@Chandra2026';
    const adminName = process.env.ADMIN_NAME || 'Chandra Admin';

    let adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      adminUser = await User.create({
        name: adminName,
        email: adminEmail,
        phone: adminPhone,
        password: adminPassword,
        role: ROLES.ADMIN,
        emailVerified: true,
        phoneVerified: true,
        isActive: true
      });
      if (!silent) console.log(`👑 Super Admin account created: ${adminEmail}`);
    } else {
      adminUser.role = ROLES.ADMIN;
      adminUser.emailVerified = true;
      adminUser.phoneVerified = true;
      adminUser.isActive = true;
      await adminUser.save();
      if (!silent) console.log(`👑 Super Admin account verified: ${adminEmail}`);
    }

    if (!silent) console.log('🌿 Database seeding successfully completed!');

    if (closeOnFinish) {
      await mongoose.connection.close();
      process.exit(0);
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Seeding failed with error:', error.message);
    if (closeOnFinish) {
      try {
        await mongoose.connection.close();
      } catch (e) {}
      process.exit(1);
    }
    throw error;
  }
};

/**
 * Auto-Seed Initializer
 * Automatically runs on server startup if connecting to a fresh/empty MongoDB database
 */
export const autoSeedIfEmpty = async () => {
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('📦 Fresh MongoDB database detected (0 products found). Initializing default inventory & admin...');
      await seedDatabase({ closeOnFinish: false, silent: false });
    } else {
      console.log(`🌿 Database verified: ${productCount} active products loaded from MongoDB.`);
    }
  } catch (err) {
    console.warn('⚠️  Auto-seed check encountered an issue:', err.message);
  }
};

// If run directly from terminal: `node src/seeds/seedDatabase.js`
const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isDirectRun) {
  seedDatabase({ closeOnFinish: true, silent: false });
}
