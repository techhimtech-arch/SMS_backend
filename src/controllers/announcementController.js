const asyncHandler = require('express-async-handler');
const Announcement = require('../models/Announcement');
const User = require('../models/User');
const Class = require('../models/Class');
const Section = require('../models/Section');
const auditLogger = require('../utils/auditLogger');
const logger = require('../utils/logger');
const notificationService = require('../services/notificationService');

/**
 * @desc    Create new announcement
 * @route   POST /api/v1/announcements
 * @access  Private (Admin, Teacher)
 */
const createAnnouncement = asyncHandler(async (req, res) => {
  const {
    title,
    content,
    message,
    type,
    priority,
    status: statusFromReq,
    targetAudience,
    targetClasses,
    targetSections,
    targetUsers,
    expiryDate,
    publishDate,
    scheduledDate,
    deliveryMethods,
    tags,
    allowComments,
    isPinned
  } = req.body;

  // Validate required fields
  const messageContent = message || content;
  if (!title || !messageContent) {
    return res.status(400).json({
      success: false,
      message: 'Title and content/message are required'
    });
  }

  // Debug: Log user info
  logger.info('Creating announcement', {
    user: req.user,
    userId: req.user?.id,
    userName: req.user?.name
  });

  // Validate target audience
  if (targetAudience && targetAudience.includes('specific_classes') && (!targetClasses || targetClasses.length === 0)) {
    return res.status(400).json({
      success: false,
      message: 'Target classes are required when targeting specific classes'
    });
  }

  if (targetAudience && targetAudience.includes('specific_sections') && (!targetSections || targetSections.length === 0)) {
    return res.status(400).json({
      success: false,
      message: 'Target sections are required when targeting specific sections'
    });
  }

  // Convert lowercase to UPPERCASE for enum values
  const convertToUpperCase = (value) => value ? value.toUpperCase() : value;
  const finalType = convertToUpperCase(type) || 'GENERAL';
  const finalPriority = convertToUpperCase(priority) || 'MEDIUM';
  const finalStatus = convertToUpperCase(statusFromReq) || 'PUBLISHED';

  // Determine status based on scheduled date if not explicitly provided
  let status = statusFromReq ? finalStatus : 'DRAFT';
  if (scheduledDate) {
    const scheduleDate = new Date(scheduledDate);
    if (scheduleDate > new Date()) {
      status = 'DRAFT';
    } else {
      status = 'PUBLISHED';
    }
  } else if (!statusFromReq) {
    status = 'PUBLISHED';
  }

  const announcement = new Announcement({
    title,
    message: messageContent,
    type: finalType,
    priority: finalPriority,
    status,
    targetAudience: targetAudience || ['all'],
    targetClasses,
    targetSections,
    targetUsers,
    createdBy: req.user.id,
    expiryDate: expiryDate ? new Date(expiryDate) : null,
    publishDate: publishDate ? new Date(publishDate) : new Date(),
    deliveryMethods: {
      email: deliveryMethods?.email || false,
      sms: deliveryMethods?.sms || false,
      push: deliveryMethods?.push !== false,
      dashboard: deliveryMethods?.dashboard !== false || deliveryMethods?.portal !== false
    },
    tags: tags || [],
    allowComments: allowComments || false,
    isPinned: isPinned || false
  });

  const savedAnnouncement = await announcement.save();

  // Log audit
  await auditLogger.log({
    action: 'ANNOUNCEMENT_CREATE',
    userId: req.user.id,
    userType: req.user.role,
    schoolId: req.user.schoolId,
    targetId: savedAnnouncement._id,
    targetType: 'Announcement',
    details: { title, type: finalType, priority: finalPriority, status },
    ipAddress: req.ip
  });

  res.status(201).json({
    success: true,
    message: 'Announcement created successfully',
    data: savedAnnouncement
  });
});

/**
 * @desc    Get all announcements with filtering
 * @route   GET /api/v1/announcements
 * @access  Private
 */
const getAnnouncements = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    type,
    priority,
    targetAudience,
    author,
    search,
    sortBy = 'publishDate',
    sortOrder = 'desc',
    startDate,
    endDate
  } = req.query;

  // Build query
  const query = {};

  // If no status filter is provided, default to published announcements
  if (!status) {
    query.status = 'published';
  }

  // Filter by status (don't filter if status is "all")
  if (status && status !== 'all') {
    query.status = status;
  }

  // Filter by type (don't filter if type is "all")
  if (type && type !== 'all') {
    query.type = type;
  }

  // Filter by priority (don't filter if priority is "all")
  if (priority && priority !== 'all') {
    query.priority = priority;
  }

  // Filter by target audience
  if (targetAudience) {
    query.targetAudience = targetAudience;
  }

  // Filter by author
  if (author) {
    query.author = author;
  }

  // Search in title and content
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  // Filter by date range
  if (startDate || endDate) {
    query.publishDate = {};
    if (startDate) {
      query.publishDate.$gte = new Date(startDate);
    }
    if (endDate) {
      query.publishDate.$lte = new Date(endDate);
    }
  }

  // Sort options
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const [announcements, total] = await Promise.all([
    Announcement.find(query)
      .populate('author', 'name email')
      .populate('targetClasses.classId', 'name')
      .populate('targetSections.sectionId', 'name')
      .populate('targetUsers.userId', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
    Announcement.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    count: announcements.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data: announcements
  });
});

/**
 * @desc    Get announcements for current user
 * @route   GET /api/v1/announcements/my
 * @access  Private
 */
const getMyAnnouncements = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, unreadOnly = false } = req.query;

  // Get user details
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Find announcements for this user
  let query;
  if (unreadOnly === 'true') {
    // Get unread announcements
    query = Announcement.findForUser(req.user.id, user.role, user.classId, user.sectionId)
      .where('readBy').nin([{ userId: req.user.id }]);
  } else {
    // Get all announcements
    query = Announcement.findForUser(req.user.id, user.role, user.classId, user.sectionId);
  }

  // Pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const [announcements, total] = await Promise.all([
    query.skip(skip).limit(limitNum),
    Announcement.findForUser(req.user.id, user.role, user.classId, user.sectionId).countDocuments()
  ]);

  res.status(200).json({
    success: true,
    count: announcements.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data: announcements
  });
});

/**
 * @desc    Get single announcement by ID
 * @route   GET /api/v1/announcements/:id
 * @access  Private
 */
const getAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id)
    .populate('author', 'name email')
    .populate('targetClasses.classId', 'name')
    .populate('targetSections.sectionId', 'name')
    .populate('targetUsers.userId', 'name email')
    .populate('comments.userId', 'name email');

  if (!announcement) {
    return res.status(404).json({
      success: false,
      message: 'Announcement not found'
    });
  }

  // Check if user has access to this announcement
  const user = await User.findById(req.user.id);
  const hasAccess = await checkAnnouncementAccess(announcement, user);
  
  if (!hasAccess) {
    return res.status(403).json({
      success: false,
      message: 'Access denied to this announcement'
    });
  }

  // Mark as read
  await announcement.markAsRead(req.user.id);

  res.status(200).json({
    success: true,
    data: announcement
  });
});

/**
 * @desc    Update announcement
 * @route   PUT /api/v1/announcements/:id
 * @access  Private (Author, Admin)
 */
const updateAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    return res.status(404).json({
      success: false,
      message: 'Announcement not found'
    });
  }

  // Check if user can update this announcement
  if (announcement.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this announcement'
    });
  }

  // Don't allow updating published announcements if not admin
  if (announcement.status === 'PUBLISHED' && req.user.role !== 'admin') {
    return res.status(400).json({
      success: false,
      message: 'Cannot update published announcement'
    });
  }

  let updates = { ...req.body };
  let wasPublished = false;

  // Convert enum values to uppercase
  if (updates.type) updates.type = updates.type.toUpperCase();
  if (updates.priority) updates.priority = updates.priority.toUpperCase();
  if (updates.status) updates.status = updates.status.toUpperCase();
  
  // Handle content → message field mapping
  if (updates.content) {
    updates.message = updates.content;
    delete updates.content;
  }

  // Handle status changes
  if (updates.status === 'PUBLISHED' && announcement.status === 'DRAFT') {
    updates.publishDate = new Date();
    wasPublished = true;
  }

  const updatedAnnouncement = await Announcement.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  ).populate('createdBy', 'name email');

  // Create notifications if announcement was published
  if (wasPublished) {
    await notificationService.createAnnouncementNotifications(updatedAnnouncement);
  }

  // Log audit
  await auditLogger.log({
    action: 'ANNOUNCEMENT_UPDATE',
    userId: req.user.id,
    userType: req.user.role,
    schoolId: req.user.schoolId,
    targetId: announcement._id,
    targetType: 'Announcement',
    details: { updates },
    ipAddress: req.ip
  });

  res.status(200).json({
    success: true,
    message: 'Announcement updated successfully',
    data: updatedAnnouncement
  });
});

/**
 * @desc    Delete announcement
 * @route   DELETE /api/v1/announcements/:id
 * @access  Private (Author, Admin)
 */
const deleteAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    return res.status(404).json({
      success: false,
      message: 'Announcement not found'
    });
  }

  // Check if user can delete this announcement
  if (announcement.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this announcement'
    });
  }

  await Announcement.findByIdAndDelete(req.params.id);

  // Log audit
  await auditLogger.log({
    action: 'ANNOUNCEMENT_DELETE',
    userId: req.user.id,
    userType: req.user.role,
    schoolId: req.user.schoolId,
    targetId: announcement._id,
    targetType: 'Announcement',
    details: { title: announcement.title },
    ipAddress: req.ip
  });

  res.status(200).json({
    success: true,
    message: 'Announcement deleted successfully'
  });
});

/**
 * @desc    Mark announcement as read
 * @route   POST /api/v1/announcements/:id/read
 * @access  Private
 */
const markAsRead = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    return res.status(404).json({
      success: false,
      message: 'Announcement not found'
    });
  }

  await announcement.markAsRead(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Announcement marked as read'
  });
});

/**
 * @desc    Add comment to announcement
 * @route   POST /api/v1/announcements/:id/comments
 * @access  Private
 */
const addComment = asyncHandler(async (req, res) => {
  const { comment } = req.body;

  if (!comment) {
    return res.status(400).json({
      success: false,
      message: 'Comment is required'
    });
  }

  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    return res.status(404).json({
      success: false,
      message: 'Announcement not found'
    });
  }

  if (!announcement.allowComments) {
    return res.status(400).json({
      success: false,
      message: 'Comments are not allowed for this announcement'
    });
  }

  await announcement.addComment(req.user.id, req.user.name, comment);

  // Log audit
  await auditLogger.log({
    action: 'ADD_COMMENT',
    userId: req.user.id,
    userType: req.user.role,
    targetId: announcement._id,
    targetType: 'Announcement',
    details: { comment },
    ipAddress: req.ip
  });

  res.status(200).json({
    success: true,
    message: 'Comment added successfully'
  });
});

/**
 * @desc    Get announcement statistics
 * @route   GET /api/v1/announcements/stats
 * @access  Private (Admin)
 */
const getAnnouncementStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  // Date filter
  const dateFilter = {};
  if (startDate || endDate) {
    dateFilter.publishDate = {};
    if (startDate) dateFilter.publishDate.$gte = new Date(startDate);
    if (endDate) dateFilter.publishDate.$lte = new Date(endDate);
  }

  const [
    totalAnnouncements,
    publishedAnnouncements,
    draftAnnouncements,
    scheduledAnnouncements,
    expiredAnnouncements,
    announcementsByType,
    announcementsByPriority
  ] = await Promise.all([
    Announcement.countDocuments(dateFilter),
    Announcement.countDocuments({ ...dateFilter, status: 'published' }),
    Announcement.countDocuments({ ...dateFilter, status: 'draft' }),
    Announcement.countDocuments({ ...dateFilter, status: 'scheduled' }),
    Announcement.countDocuments({ ...dateFilter, status: 'expired' }),
    Announcement.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]),
    Announcement.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ])
  ]);

  res.status(200).json({
    success: true,
    data: {
      total: totalAnnouncements,
      published: publishedAnnouncements,
      draft: draftAnnouncements,
      scheduled: scheduledAnnouncements,
      expired: expiredAnnouncements,
      byType: announcementsByType,
      byPriority: announcementsByPriority
    }
  });
});

/**
 * @desc    Publish announcement
 * @route   POST /api/v1/announcements/:id/publish
 * @access  Private (Author, Admin)
 */
const publishAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    return res.status(404).json({
      success: false,
      message: 'Announcement not found'
    });
  }

  // Check permission
  if (announcement.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to publish this announcement'
    });
  }

  // Update status to PUBLISHED
  announcement.status = 'PUBLISHED';
  announcement.publishDate = new Date();
  await announcement.save();

  // Create notifications for targeted users
  await notificationService.createAnnouncementNotifications(announcement);

  // Log audit
  await auditLogger.log({
    action: 'ANNOUNCEMENT_PUBLISH',
    userId: req.user.id,
    userType: req.user.role,
    schoolId: req.user.schoolId,
    targetId: announcement._id,
    targetType: 'Announcement',
    ipAddress: req.ip
  });

  res.status(200).json({
    success: true,
    message: 'Announcement published successfully',
    data: announcement
  });
});

/**
 * @desc    Unpublish announcement
 * @route   POST /api/v1/announcements/:id/unpublish
 * @access  Private (Author, Admin)
 */
const unpublishAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    return res.status(404).json({
      success: false,
      message: 'Announcement not found'
    });
  }

  // Check permission
  if (announcement.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to unpublish this announcement'
    });
  }

  // Update status to DRAFT
  announcement.status = 'DRAFT';
  await announcement.save();

  // Log audit
  await auditLogger.log({
    action: 'ANNOUNCEMENT_UNPUBLISH',
    userId: req.user.id,
    userType: req.user.role,
    schoolId: req.user.schoolId,
    targetId: announcement._id,
    targetType: 'Announcement',
    ipAddress: req.ip
  });

  res.status(200).json({
    success: true,
    message: 'Announcement unpublished successfully',
    data: announcement
  });
});

/**
 * Helper function to check if user has access to announcement
 */
const checkAnnouncementAccess = async (announcement, user) => {
  // Admin can access all announcements
  if (user.role === 'admin') return true;

  // Author can access their own announcements
  if (announcement.author.toString() === user._id.toString()) return true;

  // Check target audience
  if (announcement.targetAudience.includes('all')) return true;
  if (announcement.targetAudience.includes(user.role)) return true;

  // Check specific user targeting
  if (announcement.targetUsers.some(target => target.userId.toString() === user._id.toString())) {
    return true;
  }

  // Check class targeting
  if (user.classId && announcement.targetAudience.includes('specific_classes')) {
    const hasClassAccess = announcement.targetClasses.some(target => 
      target.classId.toString() === user.classId.toString()
    );
    if (hasClassAccess) return true;
  }

  // Check section targeting
  if (user.sectionId && announcement.targetAudience.includes('specific_sections')) {
    const hasSectionAccess = announcement.targetSections.some(target => 
      target.sectionId.toString() === user.sectionId.toString()
    );
    if (hasSectionAccess) return true;
  }

  return false;
};

module.exports = {
  createAnnouncement,
  getAnnouncements,
  getMyAnnouncements,
  getAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  markAsRead,
  addComment,
  getAnnouncementStats,
  publishAnnouncement,
  unpublishAnnouncement
};
