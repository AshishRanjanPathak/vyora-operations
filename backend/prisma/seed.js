import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@minierp.com' },
    update: {},
    create: { name: 'Admin User', email: 'admin@minierp.com', password: hashedPassword, role: 'ADMIN' },
  });

  const sales = await prisma.user.upsert({
    where: { email: 'sales@minierp.com' },
    update: {},
    create: { name: 'Sales User', email: 'sales@minierp.com', password: hashedPassword, role: 'SALES' },
  });

  const warehouse = await prisma.user.upsert({
    where: { email: 'warehouse@minierp.com' },
    update: {},
    create: { name: 'Warehouse User', email: 'warehouse@minierp.com', password: hashedPassword, role: 'WAREHOUSE' },
  });

  await prisma.user.upsert({
    where: { email: 'accounts@minierp.com' },
    update: {},
    create: { name: 'Accounts User', email: 'accounts@minierp.com', password: hashedPassword, role: 'ACCOUNTS' },
  });

  console.log('Users created.');

  const tv = await prisma.product.upsert({
    where: { sku: 'TV-SAM-55' },
    update: {},
    create: { name: 'Samsung 55in 4K Smart TV', sku: 'TV-SAM-55', category: 'Electronics', unitPrice: 49999.00, currentStock: 20, minimumStock: 5, warehouseLocation: 'Shelf A1' },
  });

  const phone = await prisma.product.upsert({
    where: { sku: 'MOB-IPH-15' },
    update: {},
    create: { name: 'iPhone 15 128GB', sku: 'MOB-IPH-15', category: 'Mobile', unitPrice: 79999.00, currentStock: 3, minimumStock: 5, warehouseLocation: 'Shelf B2' },
  });

  const laptop = await prisma.product.upsert({
    where: { sku: 'LAP-DEL-15' },
    update: {},
    create: { name: 'Dell Inspiron 15 Laptop', sku: 'LAP-DEL-15', category: 'Electronics', unitPrice: 65000.00, currentStock: 10, minimumStock: 3, warehouseLocation: 'Shelf A3' },
  });

  const headphones = await prisma.product.upsert({
    where: { sku: 'AUD-SONY-WH' },
    update: {},
    create: { name: 'Sony WH-1000XM5 Headphones', sku: 'AUD-SONY-WH', category: 'Audio', unitPrice: 24999.00, currentStock: 2, minimumStock: 5, warehouseLocation: 'Shelf C1' },
  });

  console.log('Products created.');

  await prisma.customer.upsert({
    where: { id: 'seed-customer-001' },
    update: {},
    create: { id: 'seed-customer-001', name: 'Rahul Sharma', mobile: '9876543210', email: 'rahul@techbazaar.com', businessName: 'Tech Bazaar Wholesale', gstNumber: '27AAPFU0939F1ZV', customerType: 'WHOLESALE', status: 'ACTIVE', address: 'Shop 12, Nehru Market, Mumbai', notes: 'Regular bulk buyer.', createdById: admin.id },
  });

  console.log('Customer created.');

  await prisma.stockMovement.createMany({
    data: [
      { productId: tv.id, quantity: 20, type: 'IN', reason: 'Initial stock', createdById: warehouse.id },
      { productId: phone.id, quantity: 3, type: 'IN', reason: 'Initial stock', createdById: warehouse.id },
      { productId: laptop.id, quantity: 10, type: 'IN', reason: 'Initial stock', createdById: warehouse.id },
      { productId: headphones.id, quantity: 2, type: 'IN', reason: 'Initial stock', createdById: warehouse.id },
    ],
    skipDuplicates: true,
  });

  console.log('Stock movements created.');
  console.log('SEED COMPLETE');
  console.log('Credentials (password: password123): admin@minierp.com | sales@minierp.com | warehouse@minierp.com | accounts@minierp.com');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
