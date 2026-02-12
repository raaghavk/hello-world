require('dotenv').config();
const bcrypt = require('bcryptjs');
const { initDatabase, userDb } = require('./database');

async function setup() {
  console.log('Setting up Uptime Monitor SaaS...\n');

  // Initialize database
  console.log('1. Initializing database...');
  initDatabase();

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'changeme123';

  console.log('2. Creating admin user...');
  const existingAdmin = userDb.findByEmail(adminEmail);

  if (existingAdmin) {
    console.log(`   Admin user already exists: ${adminEmail}`);
  } else {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    userDb.create(adminEmail, passwordHash);
    console.log(`   Admin user created: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('   ⚠️  CHANGE THIS PASSWORD AFTER FIRST LOGIN!');
  }

  console.log('\n✅ Setup complete!');
  console.log('\nNext steps:');
  console.log('1. Copy .env.example to .env and configure your settings');
  console.log('2. Run: npm install');
  console.log('3. Run: npm start');
  console.log('4. Open http://localhost:3000 in your browser');
}

setup().catch(console.error);
