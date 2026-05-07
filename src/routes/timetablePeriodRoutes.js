const express = require('express');
const router = express.Router();
const {
  createPeriod,
  getPeriods,
  updatePeriod,
  deletePeriod,
  bulkSyncPeriods
} = require('../controllers/timetablePeriodController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: TimetablePeriods
 *   description: Management of predefined timetable slots (periods)
 */

router.use(authMiddleware);

/**
 * @swagger
 * /timetable-periods:
 *   post:
 *     summary: Create a new timetable period
 *     tags: [TimetablePeriods]
 */
router.post('/', createPeriod);

/**
 * @swagger
 * /timetable-periods:
 *   get:
 *     summary: Get all periods for an academic year
 *     tags: [TimetablePeriods]
 */
router.get('/', getPeriods);

/**
 * @swagger
 * /timetable-periods/bulk:
 *   post:
 *     summary: Bulk sync periods for an academic year
 *     tags: [TimetablePeriods]
 */
router.post('/bulk', bulkSyncPeriods);

/**
 * @swagger
 * /timetable-periods/{id}:
 *   put:
 *     summary: Update a period
 *     tags: [TimetablePeriods]
 */
router.put('/:id', updatePeriod);

/**
 * @swagger
 * /timetable-periods/{id}:
 *   delete:
 *     summary: Delete a period
 *     tags: [TimetablePeriods]
 */
router.delete('/:id', deletePeriod);

module.exports = router;
