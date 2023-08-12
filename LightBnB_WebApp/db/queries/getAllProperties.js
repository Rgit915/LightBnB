const db = require('../database'); 

/// Properties

/**
 * Get all properties.
 * @param {{ city: string, minimum_price_per_night: number, maximum_price_per_night: number, minimum_rating: number, owner_id: number }} options An object containing query options.
 * @param {number} limit The number of results to return.
 * @return {Promise<[{}]>} A promise to the properties.
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
  return db.query(queryString, queryParams)
    .then((res) => res.rows)
    .catch((err) => {
      console.log(err.message);
    });
};

module.exports = getAllProperties;