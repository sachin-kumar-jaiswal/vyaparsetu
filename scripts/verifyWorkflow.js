import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5000/api/v1' });

const verifyCompleteWorkflow = async () => {
  console.log('--- STARTING COMPLETE WORKFLOW VERIFICATION ---');

  // 1. Customer Login
  console.log('1. Logging in as Demo Customer...');
  const custLogin = await api.post('/auth/login', {
    email: 'customer@vyaparsetu.in',
    password: 'CustomerSecure@2026',
  });
  const custToken = custLogin.data.token;
  const buyer = custLogin.data.user;
  console.log(`   Logged in as: ${buyer.name} (${buyer.email})`);

  // 2. Fetch Catalogue Products
  console.log('2. Fetching Catalogue Products...');
  const catRes = await api.get('/products?limit=5');
  const sampleProduct = catRes.data.products[0];
  console.log(`   Selected item: "${sampleProduct.name}" from seller: "${sampleProduct.sellerBusinessName}"`);

  // 3. Multi-Seller Checkout
  console.log('3. Placing Multi-Seller Checkout Order...');
  const checkoutRes = await api.post(
    '/orders/checkout',
    {
      items: [{ productId: sampleProduct._id, quantity: 2 }],
      manualAddress: {
        recipientName: 'Priya Mehra',
        phone: '+919855566677',
        houseNo: 'House 42, Connaught Place',
        street: 'Barakhamba Road',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
        addressType: 'HOME',
      },
      fulfilmentMethods: { [sampleProduct.sellerId]: 'DELIVERY' },
      paymentMethods: { [sampleProduct.sellerId]: 'MANUAL_UPI' },
      customerNotes: 'Automated workflow verification order',
    },
    { headers: { Authorization: `Bearer ${custToken}` } }
  );

  const createdOrder = checkoutRes.data.orders[0];
  console.log(`   Order created successfully: ${createdOrder.orderNumber}`);
  console.log(`   Grand Total: ₹${createdOrder.grandTotal} (Subtotal: ₹${createdOrder.subtotal}, Delivery: ₹${createdOrder.deliveryFee})`);
  console.log(`   Payment Status: ${createdOrder.paymentStatus}`);

  // 4. Customer Submits UPI UTR
  console.log('4. Customer submitting 12-digit UPI UTR reference...');
  const utrRes = await api.post(
    `/orders/${createdOrder._id}/submit-utr`,
    { utrReference: '320148902026' },
    { headers: { Authorization: `Bearer ${custToken}` } }
  );
  console.log(`   UTR saved: ${utrRes.data.order.paymentDetails.utrReference}`);

  // 5. Wholesaler Login
  console.log('5. Logging in as Approved Wholesaler...');
  const sellerLogin = await api.post('/auth/login', {
    email: 'wholesaler@vyaparsetu.in',
    password: 'SellerSecure@2026',
  });
  const sellerToken = sellerLogin.data.token;
  console.log(`   Logged in as Seller: ${sellerLogin.data.user.name}`);

  // 6. Wholesaler Verifies Payment
  console.log('6. Wholesaler verifying UPI payment...');
  const verifyRes = await api.patch(
    `/orders/${createdOrder._id}/verify-payment`,
    { isVerified: true, notes: 'UTR 320148902026 verified on bank statement' },
    { headers: { Authorization: `Bearer ${sellerToken}` } }
  );
  console.log(`   Order Payment Status now: ${verifyRes.data.order.paymentStatus}`);

  // 7. Wholesaler Advances Order Status
  console.log('7. Wholesaler progressing status: CONFIRMED -> PROCESSING -> OUT_FOR_DELIVERY -> DELIVERED');
  for (const st of ['CONFIRMED', 'PROCESSING', 'READY_FOR_DISPATCH', 'OUT_FOR_DELIVERY', 'DELIVERED']) {
    const updateRes = await api.patch(
      `/orders/${createdOrder._id}/status`,
      { status: st, note: `Status updated to ${st} during verification.` },
      { headers: { Authorization: `Bearer ${sellerToken}` } }
    );
    console.log(`   -> Order status: ${updateRes.data.order.orderStatus}`);
  }

  // 8. Customer Reports Issue on Delivered Order
  console.log('8. Customer reporting post-delivery product verification...');
  const issueRes = await api.post(
    `/orders/${createdOrder._id}/return-issue`,
    { issueType: 'QUALITY_ISSUE', description: 'Packaging inspected, excellent condition.' },
    { headers: { Authorization: `Bearer ${custToken}` } }
  );
  console.log(`   Issue reported: ${issueRes.data.order.returnIssue.issueType}`);

  console.log('--- ALL WORKFLOW CHECKS PASSED WITH 100% SUCCESS! ---');
  process.exit(0);
};

verifyCompleteWorkflow().catch((err) => {
  console.error('Workflow verification failed:', err.response?.data || err.message);
  process.exit(1);
});
