const { Pool } = require('pg');

const pool = new Pool({
  user: 'labber',
  password: '***',
  host: 'localhost',
  database: 'lightbnb'
});

pool.connect()
  .then(() => console.log("Connected"))
  .catch(err => console.error("Error: ", err));

// Export the query function
module.exports.query = (text, params, callback) => {
  return pool.query(text, params, callback);
};

// Import individual query functions
const getUserWithEmail = require('./queries/getUserWithEmail');
const getUserWithId = require('./queries/getUserWithId');
const addUser = require('./queries/addUser');
const getAllReservations = require('./queries/getAllReservations');
const getAllProperties = require('./queries/getAllProperties');
const addProperty = require('./queries/addProperty');

module.exports = {
  query: module.exports.query,
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty
};