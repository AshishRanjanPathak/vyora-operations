import 'dotenv/config';

const env = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET,
  databaseUrl: process.env.DATABASE_URL,
};

const requiredVars = ['JWT_SECRET'];

for (const key of requiredVars) {
  if (!process.env[key]) {
    console.error('Missing required environment variable: ' + key);
    process.exit(1);
  }
}

export default env;
