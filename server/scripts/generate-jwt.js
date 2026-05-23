#!/usr/bin/env node
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const path = require('path');

// Load environment from project root .env
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const val = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
      out[key] = val;
      if (val !== true) i++;
    }
  }
  return out;
}

const opts = parseArgs();

const payload = {
  id: Number(opts.id || opts.i || 1),
  employeeId: Number(opts.employeeId || opts.eid || opts.employee || 1),
  email: opts.email || opts.e || 'test@example.com',
  role: opts.role || 'SUPER_ADMIN',
};

const secret = process.env.JWT_SECRET;
if (!secret) {
  console.error('JWT_SECRET not set in environment (.env)');
  process.exit(2);
}

const expiresIn = process.env.JWT_EXPIRES_IN || '1d';

const token = jwt.sign(payload, secret, { expiresIn });

console.log(token);
