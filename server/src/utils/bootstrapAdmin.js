import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { getMongoUri } from '../config/db.js';
import User from '../modules/users/User.js';

dotenv.config();

const bootstrapAdmin = async () => {
  const uri = getMongoUri();
  const name = process.env.ADMIN_NAME || 'VyaparSetu Administrator';
  const email = process.env.ADMIN_EMAIL || 'admin@vyaparsetu.in';
  const password = process.env.ADMIN_PASSWORD || 'AdminSecure@2026';
  const phone = process.env.ADMIN_PHONE || '+919876543210';

  console.log('[Admin Bootstrap] Connecting to MongoDB...');
  await mongoose.connect(uri);

  const existingAdmin = await User.findOne({ email: email.toLowerCase() });

  if (existingAdmin) {
    if (existingAdmin.role !== 'SUPER_ADMIN') {
      existingAdmin.role = 'SUPER_ADMIN';
      existingAdmin.status = 'ACTIVE';
      existingAdmin.isApproved = true;
      await existingAdmin.save();
      console.log(`[Admin Bootstrap] Existing user ${email} upgraded to SUPER_ADMIN.`);
    } else {
      console.log(`[Admin Bootstrap] Super Admin ${email} already exists.`);
    }
  } else {
    await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      isApproved: true,
    });
    console.log(`[Admin Bootstrap] Super Admin provisioned successfully: ${email}`);
  }

  await mongoose.disconnect();
  console.log('[Admin Bootstrap] Completed successfully.');
  process.exit(0);
};

bootstrapAdmin().catch((err) => {
  console.error('[Admin Bootstrap Error]', err);
  process.exit(1);
});
