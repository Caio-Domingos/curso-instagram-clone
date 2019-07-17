async function connection() {
  const MongoClient = require('mongodb').MongoClient;

  // Connection URL
  const url = 'mongodb://localhost:27017/curso-instagram';

  // // Database Name
  // const dbName = 'curso-instagram';

  // Create a new MongoClient
  const client = new MongoClient(url, { useNewUrlParser: true });

  // Use connect method to connect to the Server
  const connect = await client.connect();

  return client;
}

module.exports = connection();
