import dotenv from '../server/node_modules/dotenv/lib/main.js';
import mongoose from '../server/node_modules/mongoose/index.js';
import { getMongoUri } from '../server/src/config/db.js';
import User from '../server/src/modules/users/User.js';
import SellerProfile from '../server/src/modules/sellers/SellerProfile.js';
import Address from '../server/src/modules/addresses/Address.js';

dotenv.config({ path: '../server/.env' });
if (!process.env.MONGODB_URI) dotenv.config();

const seedAccounts = async () => {
  const uri = getMongoUri();
  console.log('[Seed Demo Accounts] Connecting to MongoDB...');
  await mongoose.connect(uri);

  const accounts = [
    {
      name: 'VyaparSetu Super Administrator',
      email: 'admin@vyaparsetu.in',
      password: 'AdminSecure@2026',
      phone: '+919876543210',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      isApproved: true,
    },
    {
      name: 'Ramesh Patel (Bharat Wholesale)',
      email: 'wholesaler@vyaparsetu.in',
      password: 'SellerSecure@2026',
      phone: '+919811122233',
      role: 'WHOLESALER',
      status: 'APPROVED',
      isApproved: true,
      sellerData: {
        businessName: 'Bharat Wholesale Bazaar Pvt Ltd',
        businessType: 'PVT_LTD',
        businessCategory: 'FMCG & Groceries Wholesale',
        description: 'Leading Delhi-NCR master distributor for branded food staples, dairy, edible oils, and packaged daily goods.',
        yearsInBusiness: 12,
        gstin: '07AAAAA0000A1Z5',
        tradeLicense: 'TRD-DL-2015-8849',
        fssaiLicense: '10019011000123',
        verificationStatus: 'VERIFIED',
        businessAddress: {
          houseNo: 'Plot No. 42-B, Wholesale Mandi',
          street: 'Main APMC Market Road, Azadpur',
          landmark: 'Opposite State Bank of India',
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110033',
          contactPerson: 'Ramesh Patel',
          contactPhone: '+919811122233',
        },
        dispatchAddress: {
          houseNo: 'Warehouse Block C-4',
          street: 'Transport Nagar, GT Karnal Road',
          landmark: 'Near Ring Road Toll',
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110036',
          contactPerson: 'Suresh Kumar (Logistics Head)',
          contactPhone: '+919811122234',
        },
        deliverySettings: {
          deliveryEnabled: true,
          pickupEnabled: true,
          serviceablePincodes: [
            '110001', '110002', '110003', '110004', '110005', '110006', '110007', '110008',
            '110009', '110010', '110011', '110020', '110025', '110033', '110036', '110085', '110092'
          ],
          deliveryFee: 49,
          freeDeliveryThreshold: 799,
          minOrderValue: 250,
          estimatedDeliveryTime: 'Same Day Dispatch (Order before 2 PM)',
          operatingHours: '7:30 AM - 9:00 PM (Mon-Sat)',
          deliveryNotes: 'Temperature controlled dispatch for dairy. Dedicated transport fleet within Delhi-NCR.',
          codAvailable: true,
          upiId: 'bharatwholesale@upi',
        },
        onboardingStep: 6,
        isSubmitted: true,
      },
    },
    {
      name: 'Mohan Lal (Shree Ganesh Traders)',
      email: 'pending.seller@vyaparsetu.in',
      password: 'SellerSecure@2026',
      phone: '+919822233344',
      role: 'WHOLESALER',
      status: 'PENDING_APPROVAL',
      isApproved: false,
      sellerData: {
        businessName: 'Shree Ganesh Traders',
        businessType: 'PROPRIETORSHIP',
        businessCategory: 'Rice & Pulses Wholesale',
        description: 'Direct procurement of Basmati rice and premium pulses from agricultural producers.',
        yearsInBusiness: 4,
        gstin: '07BBBBB1111B2Z6',
        tradeLicense: 'TRD-DL-2022-1092',
        fssaiLicense: '10022011000999',
        verificationStatus: 'PENDING',
        businessAddress: {
          houseNo: 'Shop 18, Grain Market',
          street: 'Narela Mandi',
          landmark: 'Grain Market Gate 2',
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110040',
          contactPerson: 'Mohan Lal',
          contactPhone: '+919822233344',
        },
        onboardingStep: 6,
        isSubmitted: true,
      },
    },
    {
      name: 'Vikram Joshi (Joshi Kirana Mart)',
      email: 'retailer@vyaparsetu.in',
      password: 'RetailerSecure@2026',
      phone: '+919833344455',
      role: 'RETAILER',
      status: 'APPROVED',
      isApproved: true,
    },
    {
      name: 'Anjali Sharma (Sharma Superstore)',
      email: 'pending.retailer@vyaparsetu.in',
      password: 'RetailerSecure@2026',
      phone: '+919844455566',
      role: 'RETAILER',
      status: 'PENDING_APPROVAL',
      isApproved: false,
    },
    {
      name: 'Priya Mehra (Verified Customer)',
      email: 'customer@vyaparsetu.in',
      password: 'CustomerSecure@2026',
      phone: '+919855566677',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      isApproved: true,
    },
  ];

  for (const acc of accounts) {
    let user = await User.findOne({ email: acc.email });
    if (!user) {
      user = await User.create({
        name: acc.name,
        email: acc.email,
        password: acc.password,
        phone: acc.phone,
        role: acc.role,
        status: acc.status,
        isApproved: acc.isApproved,
      });
      console.log(`[Created User] ${acc.role}: ${acc.email}`);
    } else {
      user.role = acc.role;
      user.status = acc.status;
      user.isApproved = acc.isApproved;
      await user.save();
      console.log(`[Updated User] ${acc.role}: ${acc.email}`);
    }

    // Attach Seller Profile if Wholesaler
    if (acc.sellerData) {
      let profile = await SellerProfile.findOne({ userId: user._id });
      if (!profile) {
        await SellerProfile.create({
          userId: user._id,
          ...acc.sellerData,
        });
        console.log(`  -> Created SellerProfile for "${acc.sellerData.businessName}"`);
      } else {
        Object.assign(profile, acc.sellerData);
        await profile.save();
        console.log(`  -> Updated SellerProfile for "${acc.sellerData.businessName}"`);
      }
    }

    // Add a default address for Customer & Retailer
    if (acc.role === 'CUSTOMER' || acc.role === 'RETAILER') {
      const addrCount = await Address.countDocuments({ userId: user._id });
      if (addrCount === 0) {
        await Address.create({
          userId: user._id,
          recipientName: acc.name.split('(')[0].trim(),
          phone: acc.phone,
          houseNo: 'Flat 402, Green Valley Apartments',
          street: 'Barakhamba Road, Connaught Place',
          landmark: 'Near Metro Station Gate 3',
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110001',
          addressType: acc.role === 'RETAILER' ? 'SHOP' : 'HOME',
          isDefault: true,
        });
        console.log(`  -> Added default address (PIN: 110001) for ${acc.email}`);
      }
    }
  }

  await mongoose.disconnect();
  console.log('[Seed Demo Accounts] All demonstration accounts created/verified successfully!');
};

seedAccounts().catch((err) => {
  console.error('[Seed Demo Accounts Error]', err);
  process.exit(1);
});
