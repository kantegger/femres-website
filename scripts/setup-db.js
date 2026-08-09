// Database setup script for D1
// Run this after creating your D1 database with: wrangler d1 create femres-db

import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the schema file
const schemaPath = join(__dirname, '..', 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

console.log('Database Schema for D1:');
console.log('======================');
console.log(schema);

console.log('\n\nNext steps:');
console.log('1. Create D1 database: npx wrangler d1 create femres-db');
console.log('2. Update wrangler.toml with the database_id from step 1');
console.log('3. Apply schema: npx wrangler d1 execute femres-db --file=./schema.sql');
console.log('4. For local dev: npx wrangler d1 execute femres-db --local --file=./schema.sql');