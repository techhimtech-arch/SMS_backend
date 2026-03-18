/**
 * Soft Delete Utility
 * Provides methods for implementing soft delete functionality across models
 */

/**
 * Add soft delete filter to mongoose queries
 * This ensures soft-deleted records are excluded by default
 */
const addSoftDeleteFilter = (schema) => {
  // Pre-find hooks to exclude soft-deleted documents
  schema.pre(['find', 'findOne', 'findOneAndUpdate'], function() {
    if (!this.getOptions().includeDeleted) {
      this.where({ isDeleted: { $ne: true } });
    }
  });

  // Pre-count hook to exclude soft-deleted documents
  schema.pre('countDocuments', function() {
    if (!this.getOptions().includeDeleted) {
      this.where({ isDeleted: { ne: true } });
    }
  });

  // Pre-aggregate hook to exclude soft-deleted documents
  schema.pre('aggregate', function() {
    if (!this.options().includeDeleted) {
      this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
    }
  });
};

/**
 * Soft delete a document
 * @param {Object} document - Mongoose document
 * @param {string} deletedBy - User ID who performed the deletion
 * @returns {Promise} - Updated document
 */
const softDelete = async (document, deletedBy) => {
  document.isDeleted = true;
  document.deletedAt = new Date();
  document.deletedBy = deletedBy;
  
  return await document.save();
};

/**
 * Restore a soft-deleted document
 * @param {Object} document - Mongoose document
 * @returns {Promise} - Updated document
 */
const restore = async (document) => {
  document.isDeleted = false;
  document.deletedAt = undefined;
  document.deletedBy = undefined;
  
  return await document.save();
};

/**
 * Query options to include soft-deleted documents
 */
const includeDeletedOptions = {
  includeDeleted: true
};

/**
 * Find only soft-deleted documents
 * @param {Model} Model - Mongoose model
 * @param {Object} filter - Additional filter criteria
 * @returns {Query} - Mongoose query
 */
const findDeletedOnly = (Model, filter = {}) => {
  return Model.find({ ...filter, isDeleted: true });
};

/**
 * Permanently delete documents that were soft deleted before a specific date
 * @param {Model} Model - Mongoose model
 * @param {Date} beforeDate - Delete documents deleted before this date
 * @returns {Promise} - Delete result
 */
const permanentlyDeleteOld = async (Model, beforeDate) => {
  return await Model.deleteMany({
    isDeleted: true,
    deletedAt: { $lt: beforeDate }
  });
};

module.exports = {
  addSoftDeleteFilter,
  softDelete,
  restore,
  includeDeletedOptions,
  findDeletedOnly,
  permanentlyDeleteOld
};
