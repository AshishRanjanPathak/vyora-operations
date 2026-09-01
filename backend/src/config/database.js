import { PrismaClient } from '@prisma/client';

// Singleton pattern — we create ONE PrismaClient instance for the whole app.
// Why? Because each PrismaClient opens a connection pool to the database.
// Creating multiple instances would waste connections.
// By exporting a single instance, every file that imports this gets the same one.

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export default prisma;
