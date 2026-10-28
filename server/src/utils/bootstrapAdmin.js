import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { pathToFileURL } from 'node:url';
import { getMongoUri } from '../config/db.js';
import User from '../modules/users/User.js';

dotenv.config();

export const getAdminBootstrapConfig = (env = process.env) => {
  const email = env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set to bootstrap an administrator.');
  }
  if (password.length < 16) {
    throw new Error('ADMIN_PASSWORD must be at least 16 characters long.');
  }

  return {
    name: env.ADMIN_NAME?.trim() || 'VyaparSetu Administrator',
    email,
    password,
    phone: env.ADMIN_PHONE?.trim() || '+919876543210',
  };
};

export const provisionAdmin = async (config = getAdminBootstrapConfig()) => {
  const existingUser = await User.findOne({ email: config.email });

  if (existingUser && existingUser.role !== 'SUPER_ADMIN') {
    throw new Error('The configured administrator email already belongs to a non-admin user.');
  }

  if (existingUser) {
    existingUser.name = config.name;
    existingUser.password = config.password;
    existingUser.phone = config.phone;
    existingUser.status = 'ACTIVE';
    existingUser.isApproved = true;
    await existingUser.save();
    console.log(`[Admin Bootstrap] Administrator credentials refreshed for ${config.email}.`);
    return;
  }

  await User.create({
    ...config,
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    isApproved: true,
  });
  console.log(`[Admin Bootstrap] Administrator provisioned for ${config.email}.`);
};

const runAdminBootstrap = async () => {
  console.log('[Admin Bootstrap] Connecting to MongoDB...');
  await mongoose.connect(getMongoUri());
  try {
    await provisionAdmin();
    console.log('[Admin Bootstrap] Completed successfully.');
  } finally {
    await mongoose.disconnect();
  }
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runAdminBootstrap().catch((error) => {
    console.error(`[Admin Bootstrap Error] ${error.message}`);
    process.exitCode = 1;
  });
}
