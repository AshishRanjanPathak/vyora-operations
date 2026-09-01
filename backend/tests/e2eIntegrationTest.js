import app from '../src/app.js';

let server;

const startServer = () => {
  return new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      console.log(`Ephemeral test server listening on port ${port}`);
      resolve(`http://localhost:${port}/api`);
    });
  });
};

const runE2E = async () => {
  console.log('====================================================');
  console.log('   FULL-STACK MINI ERP + CRM E2E INTEGRATION TEST   ');
  console.log('====================================================\n');

  const BASE_URL = await startServer();

  const api = async (endpoint, options = {}) => {
    const url = `${BASE_URL}${endpoint}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    let raw = null;
    try {
      raw = await res.json();
    } catch (e) {
      raw = null;
    }

    const data = raw && raw.data !== undefined ? raw.data : raw;
    return { status: res.status, ok: res.ok, data, raw };
  };

  try {
    let adminToken = '';
    let salesToken = '';
    let warehouseToken = '';
    let accountsToken = '';

    let customerId = '';
    let productId = '';
    let draftChallanId = '';

    // 1. Authenticate All 4 Roles
    console.log('[1/10] Authenticating test accounts...');
    const [adminRes, salesRes, whRes, accRes] = await Promise.all([
      api('/auth/login', { method: 'POST', body: { email: 'admin@minierp.com', password: 'password123' } }),
      api('/auth/login', { method: 'POST', body: { email: 'sales@minierp.com', password: 'password123' } }),
      api('/auth/login', { method: 'POST', body: { email: 'warehouse@minierp.com', password: 'password123' } }),
      api('/auth/login', { method: 'POST', body: { email: 'accounts@minierp.com', password: 'password123' } }),
    ]);

    if (!adminRes.ok || !salesRes.ok || !whRes.ok || !accRes.ok) {
      console.error('❌ Failed Step 1: Login failed', { adminRes, salesRes, whRes, accRes });
      process.exit(1);
    }

    adminToken = adminRes.data.token;
    salesToken = salesRes.data.token;
    warehouseToken = whRes.data.token;
    accountsToken = accRes.data.token;

    console.log('  ✔ Admin logged in as:', adminRes.data.user.role);
    console.log('  ✔ Sales logged in as:', salesRes.data.user.role);
    console.log('  ✔ Warehouse logged in as:', whRes.data.user.role);
    console.log('  ✔ Accounts logged in as:', accRes.data.user.role);

    // 2. Sales Creates Customer Account
    console.log('\n[2/10] Sales user creates customer account...');
    const custRes = await api('/customers', {
      method: 'POST',
      headers: { Authorization: `Bearer ${salesToken}` },
      body: {
        name: 'Vikram Mehta',
        businessName: `E2E Wholesale Traders ${Date.now()}`,
        mobile: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
        email: `contact_${Date.now()}@e2etraders.com`,
        customerType: 'WHOLESALE',
        status: 'LEAD',
        address: 'Sector 18, Commercial Hub, Gurugram',
      },
    });

    if (!custRes.ok) {
      console.error('❌ Failed Step 2:', custRes);
      process.exit(1);
    }
    customerId = custRes.data.id;
    console.log('  ✔ Customer created successfully with ID:', customerId);

    // 3. Sales Logs Follow-Up Note
    console.log('\n[3/10] Sales user logs CRM follow-up interaction...');
    const followRes = await api(`/customers/${customerId}/followups`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${salesToken}` },
      body: {
        note: 'Customer requested quotation for 50 units. Follow-up scheduled for Friday.',
        followUpDate: new Date(Date.now() + 86400000 * 3).toISOString(),
      },
    });

    if (!followRes.ok) {
      console.error('❌ Failed Step 3:', followRes);
      process.exit(1);
    }
    console.log('  ✔ Follow-up recorded. Note ID:', followRes.data.id);

    const custDetail = await api(`/customers/${customerId}`, {
      headers: { Authorization: `Bearer ${salesToken}` },
    });
    if (custDetail.data.followUps.length >= 1) {
      console.log('  ✔ Customer timeline verified. Follow-up count:', custDetail.data.followUps.length);
    }

    // 4. Warehouse Creates New Product
    console.log('\n[4/10] Warehouse creates new product with initial stock...');
    const sku = `E2E-SCAN-${Date.now().toString().slice(-4)}`;
    const prodRes = await api('/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${warehouseToken}` },
      body: {
        name: 'E2E Laser Barcode Scanner',
        sku,
        category: 'Electronics',
        unitPrice: 3500.0,
        currentStock: 25,
        minimumStock: 5,
        warehouseLocation: 'Aisle 4, Shelf C1',
      },
    });

    if (!prodRes.ok) {
      console.error('❌ Failed Step 4:', prodRes);
      process.exit(1);
    }
    productId = prodRes.data.id;
    console.log(`  ✔ Product created. SKU: ${sku}, Stock: ${prodRes.data.currentStock}, ID: ${productId}`);

    // 5. Sales Creates DRAFT Challan
    console.log('\n[5/10] Sales creates DRAFT Challan for 5 units...');
    const challanRes = await api('/challans', {
      method: 'POST',
      headers: { Authorization: `Bearer ${salesToken}` },
      body: {
        customerId,
        items: [{ productId, quantity: 5 }],
      },
    });

    if (!challanRes.ok) {
      console.error('❌ Failed Step 5:', challanRes);
      process.exit(1);
    }
    draftChallanId = challanRes.data.id;
    console.log(`  ✔ Draft Challan created. Number: ${challanRes.data.challanNumber}, Status: ${challanRes.data.status}`);

    // Verify stock is UNCHANGED (still 25)
    const prodCheck1 = await api(`/products/${productId}`, {
      headers: { Authorization: `Bearer ${salesToken}` },
    });
    if (prodCheck1.data.currentStock === 25) {
      console.log('  ✔ Stock verification: Stock is still 25 (Draft does NOT decrement inventory)');
    } else {
      console.error(`❌ Stock expected 25, got ${prodCheck1.data.currentStock}`);
      process.exit(1);
    }

    // 6. Warehouse Confirms Challan (Atomic Stock Deduction)
    console.log('\n[6/10] Warehouse confirms delivery challan...');
    const confirmRes = await api(`/challans/${draftChallanId}/confirm`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${warehouseToken}` },
    });

    if (!confirmRes.ok) {
      console.error('❌ Failed Step 6:', confirmRes);
      process.exit(1);
    }
    console.log(`  ✔ Challan confirmed. Status: ${confirmRes.data.status}`);

    // Verify stock is now 20 (25 - 5)
    const prodCheck2 = await api(`/products/${productId}`, {
      headers: { Authorization: `Bearer ${warehouseToken}` },
    });
    if (prodCheck2.data.currentStock === 20) {
      console.log('  ✔ Stock decremented atomically: Stock is now 20');
    } else {
      console.error(`❌ Stock expected 20, got ${prodCheck2.data.currentStock}`);
      process.exit(1);
    }

    // 7. Verify Dashboard Aggregates
    console.log('\n[7/10] Checking real-time Dashboard metrics...');
    const dashRes = await api('/dashboard/stats', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!dashRes.ok) {
      console.error('❌ Failed Step 7:', dashRes);
      process.exit(1);
    }
    console.log('  ✔ Dashboard stats:');
    console.log(`    - Total Customers: ${dashRes.data.totalCustomers}`);
    console.log(`    - Total Products: ${dashRes.data.totalProducts}`);
    console.log(`    - Confirmed Challans: ${dashRes.data.confirmedChallans}`);
    console.log(`    - Recent Challan Count: ${dashRes.data.recentChallans.length}`);

    // 8. Warehouse Manual Inflow Adjustment
    console.log('\n[8/10] Warehouse records manual stock restock (IN 10 units)...');
    const moveRes = await api('/stock/movements', {
      method: 'POST',
      headers: { Authorization: `Bearer ${warehouseToken}` },
      body: {
        productId,
        quantity: 10,
        type: 'IN',
        reason: 'Shipment container restock PO #99102',
      },
    });

    if (!moveRes.ok) {
      console.error('❌ Failed Step 8:', moveRes);
      process.exit(1);
    }
    console.log(`  ✔ Movement recorded. Movement ID: ${moveRes.data.id}`);

    // Verify stock is now 30 (20 + 10)
    const prodCheck3 = await api(`/products/${productId}`, {
      headers: { Authorization: `Bearer ${warehouseToken}` },
    });
    if (prodCheck3.data.currentStock === 30) {
      console.log('  ✔ Stock increased atomically: Stock is now 30');
    } else {
      console.error(`❌ Stock expected 30, got ${prodCheck3.data.currentStock}`);
      process.exit(1);
    }

    // 9. Negative Stock Prevention Check
    console.log('\n[9/10] Negative stock prevention test (creating & confirming challan for 9999 units)...');
    const oversizedDraft = await api('/challans', {
      method: 'POST',
      headers: { Authorization: `Bearer ${salesToken}` },
      body: {
        customerId,
        items: [{ productId, quantity: 9999 }],
      },
    });

    const oversizedConfirm = await api(`/challans/${oversizedDraft.data.id}/confirm`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${warehouseToken}` },
    });

    if (oversizedConfirm.status === 400) {
      console.log('  ✔ Correctly rejected confirmation with HTTP 400:', oversizedConfirm.raw?.message || oversizedConfirm.data?.message);
    } else {
      console.error('❌ Expected HTTP 400 Insufficient Stock, but got:', oversizedConfirm);
      process.exit(1);
    }

    // 10. Role-Based Access Control Guards
    console.log('\n[10/10] Role-Based Access Control check (Accounts role attempting customer creation)...');
    const forbiddenCust = await api('/customers', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accountsToken}` },
      body: {
        name: 'Forbidden Contact',
        businessName: 'Forbidden Corp',
        mobile: '9999999999',
      },
    });

    if (forbiddenCust.status === 403) {
      console.log('  ✔ Correctly blocked with HTTP 403 Forbidden:', forbiddenCust.raw?.message || forbiddenCust.data?.message);
    } else {
      console.error('❌ Expected HTTP 403 Forbidden for Accounts role, but got:', forbiddenCust);
      process.exit(1);
    }

    console.log('\n====================================================');
    console.log('   🎉 ALL 10 E2E INTEGRATION SCENARIOS PASSED!     ');
    console.log('====================================================\n');
  } finally {
    if (server) server.close();
  }
};

runE2E();