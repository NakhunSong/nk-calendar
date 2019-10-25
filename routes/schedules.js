const express = require('express');
const db = require('../models');

const router = express.Router();

/**
 * Get /schedules?date=yearmonthdate
 */
router.get('/', async (req, res, next) => {
  try {
    const Op = db.Sequelize.Op;
    const date = parseInt(req.query.date, 10);
    
    let where = {};

    if(date) {
      where = {
        [Op.and]: {
          startDate: {
            [Op.lte]: (date+200).toString(),
          },
          endDate: {
            [Op.gte]: (date-200).toString(),
          }
        }
      }
    }

    // Find all datas where startDate <= date-200 && endDate >= date+200
    const schedules = await db.Schedule.findAll({
      where,
      order: [['startDate', 'ASC'], ['startTime', 'ASC'], ['createdAt', 'ASC']],
    });

    return res.json(schedules);
  } catch(e) {
    console.error(e);
    return next(e);
  }
});

module.exports = router;