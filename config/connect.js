const { MongoClient } = require('mongodb');

// Connection URL
// const url = 'mongodb://localhost:27017';
const url = ''; // Add your MongoDB connection string here
const client = new MongoClient(url);

// Database Name
const dbName = 'locateme';

async function main() {
  // Use connect method to connect to the server
  await client.connect();
  console.log('Connected successfully to server');
  LOCATEMEAPP.db = client.db(dbName);
}

module.exports = main;