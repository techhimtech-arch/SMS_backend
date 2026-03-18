/**
 * Pagination Utility
 * Provides reusable pagination functionality for all APIs
 */

/**
 * Get pagination parameters from query
 * @param {Object} query - Express query object
 * @returns {Object} Pagination parameters
 */
const getPaginationParams = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;

  // Validate page and limit
  if (page < 1) throw new Error('Page must be greater than 0');
  if (limit < 1 || limit > 100) throw new Error('Limit must be between 1 and 100');

  return { page, limit, skip };
};

/**
 * Build pagination metadata
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total number of items
 * @returns {Object} Pagination metadata
 */
const buildPaginationMeta = (page, limit, total) => {
  const pages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    pages,
    hasNext: page < pages,
    hasPrev: page > 1,
    nextPage: page < pages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null
  };
};

/**
 * Apply pagination to a Mongoose query
 * @param {Object} query - Mongoose query object
 * @param {Object} queryParams - Query parameters from request
 * @returns {Object} Paginated query and pagination info
 */
const applyPagination = async (query, queryParams) => {
  const { page, limit, skip } = getPaginationParams(queryParams);

  // Get total count
  const total = await query.model.countDocuments(query.getQuery());

  // Apply pagination
  query.skip(skip).limit(limit);

  // Build pagination metadata
  const pagination = buildPaginationMeta(page, limit, total);

  return { query, pagination };
};

/**
 * Get paginated results
 * @param {Object} model - Mongoose model
 * @param {Object} filter - Query filter
 * @param {Object} queryParams - Query parameters from request
 * @param {Object} options - Additional options (sort, populate, select)
 * @returns {Object} Paginated results
 */
const getPaginatedResults = async (model, filter = {}, queryParams = {}, options = {}) => {
  const { page, limit, skip } = getPaginationParams(queryParams);
  
  const {
    sort = { createdAt: -1 },
    populate = '',
    select = '-password'
  } = options;

  // Get total count
  const total = await model.countDocuments(filter);

  // Get paginated data
  const data = await model
    .find(filter)
    .select(select)
    .populate(populate)
    .sort(sort)
    .skip(skip)
    .limit(limit);

  // Build pagination metadata
  const pagination = buildPaginationMeta(page, limit, total);

  return { data, pagination };
};

/**
 * Build search filter for text search
 * @param {Object} filter - Existing filter object
 * @param {string} searchTerm - Search term
 * @param {Array} searchFields - Fields to search in
 * @returns {Object} Updated filter with search criteria
 */
const buildSearchFilter = (filter = {}, searchTerm = '', searchFields = []) => {
  if (!searchTerm || searchFields.length === 0) {
    return filter;
  }

  const searchRegex = { $regex: searchTerm, $options: 'i' };
  const searchConditions = searchFields.map(field => ({ [field]: searchRegex }));

  return {
    ...filter,
    $or: searchConditions
  };
};

/**
 * Build date range filter
 * @param {Object} filter - Existing filter object
 * @param {string} startDate - Start date (ISO string)
 * @param {string} endDate - End date (ISO string)
 * @param {string} dateField - Date field name (default: 'createdAt')
 * @returns {Object} Updated filter with date range
 */
const buildDateRangeFilter = (filter = {}, startDate, endDate, dateField = 'createdAt') => {
  const dateFilter = {};

  if (startDate) {
    dateFilter.$gte = new Date(startDate);
  }

  if (endDate) {
    dateFilter.$lte = new Date(endDate);
  }

  if (Object.keys(dateFilter).length > 0) {
    return {
      ...filter,
      [dateField]: dateFilter
    };
  }

  return filter;
};

module.exports = {
  getPaginationParams,
  buildPaginationMeta,
  applyPagination,
  getPaginatedResults,
  buildSearchFilter,
  buildDateRangeFilter
};
