const { Pool } = require('pg');
const properties = require("./json/properties.json");
const users = require("./json/users.json");


const pool = new Pool({
  user: 'labber',
  password: '***',
  host: 'localhost',
  database: 'lightbnb'
});

pool.connect()
  .then(() => console.log("Connected"))
  .catch(err => console.error("Error: ", err));

 
/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function (email) {
  return pool
    .query(`SELECT * FROM users  WHERE email = $1`, [email])
    .then((result) => {
      if (result.rows.length === 0) {
        return null; // No user found with the provided email
      } else {
        return result.rows[0]; // Return the user object
      }
    })
    .catch((err) => {
      console.log(err.message);
    });
};

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function (id) {
  return pool
    .query(`SELECT * FROM users  WHERE id = $1`, [id])
    .then((result) => {
      if (result.rows.length === 0) {
        return null; // No user found with the provided id
      } else {
        return result.rows[0]; // Return the user object
      }
    })
    .catch((err) => {
      console.log(err.message);
    });
};

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function (user) {
  const { name, email, password } = user;

  return pool.query(
    `INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *`,
    [name, email, password]
  )
    .then((result) => {
      return result.rows[0]; // Return the inserted user object
    })
    .catch((err) => {
      console.log(err.message);
    });
};

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function (guest_id, limit = 10) {
  const query = `
    SELECT
      reservations.id,
      properties.title,
      properties.number_of_bathrooms,
      properties.number_of_bedrooms,
      properties.parking_spaces,
      properties.cost_per_night,
      reservations.start_date,
      AVG(property_reviews.rating) AS average_rating
    FROM
      reservations
      JOIN properties ON reservations.property_id = properties.id
      JOIN property_reviews ON properties.id = property_reviews.property_id
    WHERE
      reservations.guest_id = $1
    GROUP BY
      properties.id,
      reservations.id
    ORDER BY
      reservations.start_date
    LIMIT $2;
  `;

  return pool.query(query, [guest_id, limit])
    .then((result) => {
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
     });
};

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = (options, limit = 10) => {
  const queryParams = [];
  let queryString = `
    SELECT properties.*, AVG(property_reviews.rating) AS average_rating
    FROM properties
    JOIN property_reviews ON properties.id = property_id
  `;

  const filterClauses = [];
// Filter by city if provided
  if (options.city) {
    queryParams.push(`%${options.city}%`);
    filterClauses.push(`properties.city LIKE $${queryParams.length}`);
  }
// Filter by minimum_price_per_night if provided
  if (options.minimum_price_per_night) {
    queryParams.push(options.minimum_price_per_night * 100); // Convert to cents
    filterClauses.push(`properties.cost_per_night >= $${queryParams.length}`);
  }
// Filter by maximum_price_per_night if provided
  if (options.maximum_price_per_night) {
    queryParams.push(options.maximum_price_per_night * 100); // Convert to cents
    filterClauses.push(`properties.cost_per_night <= $${queryParams.length}`);
  }
// // Filter by minimum_rating if provided
  if (options.minimum_rating) {
    queryParams.push(options.minimum_rating);
    filterClauses.push(`property_reviews.rating >= $${queryParams.length}`);
  }

  if (options.owner_id) {
    queryParams.push(options.owner_id);
    filterClauses.push(`properties.owner_id = $${queryParams.length}`);
  }
// Add WHERE clause if any filters are provided
  if (filterClauses.length > 0) {
    queryString += `WHERE ${filterClauses.join(' AND ')} `;
  }
// Add GROUP BY, ORDER BY, and LIMIT clauses
  queryParams.push(limit);
  queryString += `
    GROUP BY properties.id
    ORDER BY cost_per_night
    LIMIT $${queryParams.length};
  `;
// Execute the query and return results
  return pool.query(queryString, queryParams)
    .then((res) => res.rows)
    .catch((err) => {
      console.log(err.message);
    });
};

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
  // Prepare the parameter values for the query
  const queryParams = [
    property.owner_id,
    property.title,
    property.description,
    property.thumbnail_photo_url,
    property.cover_photo_url,
    property.cost_per_night * 100, // Convert to cents
    property.street,
    property.city,
    property.province,
    property.post_code,
    property.country,
    property.parking_spaces,
    property.number_of_bathrooms,
    property.number_of_bedrooms
  ];

  // Construct the query for inserting a new property
  const queryString = `
    INSERT INTO properties (
      owner_id,
      title,
      description,
      thumbnail_photo_url,
      cover_photo_url,
      cost_per_night,
      street,
      city,
      province,
      post_code,
      country,
      parking_spaces,
      number_of_bathrooms,
      number_of_bedrooms
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING *;
  `;

  // Execute the query and return the saved property
  return pool.query(queryString, queryParams)
    .then((res) => res.rows[0]) // Return the inserted property object
    .catch((err) => {
      console.log(err.message);
      throw err; 
    });
};

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};
