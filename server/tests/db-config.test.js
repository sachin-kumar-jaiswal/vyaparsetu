import test from 'node:test';
import assert from 'node:assert/strict';
import { getMongoUri } from '../src/config/db.js';

test('getMongoUri accepts a Render value accidentally containing the variable name', () => {
  const previousUri = process.env.MONGODB_URI;
  process.env.MONGODB_URI = 'MONGODB_URI=mongodb+srv://user:password@example.mongodb.net/vyaparsetu';

  try {
    assert.equal(
      getMongoUri(),
      'mongodb+srv://user:password@example.mongodb.net/vyaparsetu'
    );
  } finally {
    if (previousUri === undefined) delete process.env.MONGODB_URI;
    else process.env.MONGODB_URI = previousUri;
  }
});

test('getMongoUri rejects values that are not MongoDB connection strings', () => {
  const previousUri = process.env.MONGODB_URI;
  process.env.MONGODB_URI = 'not-a-mongodb-uri';

  try {
    assert.throws(getMongoUri, /must start with mongodb:\/\/ or mongodb\+srv:\/\//);
  } finally {
    if (previousUri === undefined) delete process.env.MONGODB_URI;
    else process.env.MONGODB_URI = previousUri;
  }
});
