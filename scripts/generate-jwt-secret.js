#!/usr/bin/env node

/**
 * Generate JWT Secret for Railway Deployment
 * 
 * This script generates a cryptographically secure random string
 * to be used as JWT_SECRET in Railway environment variables.
 */

const crypto = require('crypto');

console.log('\n🔐 JWT Secret Generator\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Generate 64-byte (512-bit) random string
const jwtSecret = crypto.randomBytes(64).toString('hex');

console.log('Generated JWT Secret (128 characters):');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(jwtSecret);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('📋 How to use:\n');
console.log('1. Copy the secret above');
console.log('2. Set in Railway Dashboard:');
console.log('   Railway Dashboard → Backend Service → Variables');
console.log('   Add: JWT_SECRET=<paste-secret-here>\n');

console.log('Or via Railway CLI:');
console.log(`   railway variables set JWT_SECRET="${jwtSecret}"\n`);

console.log('⚠️  IMPORTANT:');
console.log('   - Keep this secret safe and private');
console.log('   - Never commit to git');
console.log('   - Use different secrets for staging/production');
console.log('   - Store securely in Railway environment variables\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
