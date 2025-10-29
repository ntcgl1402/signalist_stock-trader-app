import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

// Load .env file if present (simple parser to avoid adding dotenv dependency)
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, 'utf8');
  env.split(/\r?\n/).forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    const idx = line.indexOf('=');
    if (idx === -1) return;
    const key = line.substring(0, idx).trim();
    let val = line.substring(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.substring(1, val.length - 1);
    }
    if (!(key in process.env)) process.env[key] = val;
  });
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('No MONGODB_URI found in environment or .env');
  process.exit(2);
}

async function run() {
  try {
    mongoose.set('strictQuery', false);
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, { bufferCommands: false, connectTimeoutMS: 10000 });
    console.log('Connected to MongoDB');
    try {
      const db = mongoose.connection.db;
      console.log('Database name:', db.databaseName);
    } catch {
      // ignore
    }
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (err) {
    console.error('Failed to connect to MongoDB:');
    console.error(err && err.message ? err.message : err);
    process.exit(1);
  }
}

run();
