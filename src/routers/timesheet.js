const express = require('express');
const router = express.Router({ mergeParams: true });
const dbUtil = require('../common/dbUtil');
const verifyEntityExists = require('../common/commonHandlers').verifyEntityExists;

module.exports = router;

// common
const validateTimesheet = (req, res, next) => {
    const timesheet = req.body.timesheet;
    if (!timesheet || !timesheet.hours || !timesheet.rate || !timesheet.date) {
        res.sendStatus(400);
        return;
    }

    next();
};

// GET
router.get('/', verifyEntityExists('employee'), (req, res, next) => {
    req.dbUtil.all('timesheet', { $employee_id: req.employeeId }, (data) => {
        res.status(200).send({ timesheets: data.rows });
    })
});

// POST
router.post('/', validateTimesheet, verifyEntityExists('employee'), (req, res, next) => {
    const timesheet = req.body.timesheet;
    const values = {
        $hours: timesheet.hours,
        $rate: timesheet.rate,
        $date: timesheet.date,
        $employee_id: req.employeeId
    };
    req.dbUtil.insert('timesheet', values, (data) => {
        req.dbUtil.get('timesheet', { $id: data.lastId }, (data) => {
            res.status(201).send({ timesheet: data.row });
        })
    });
});

// PUT
router.put('/:timesheetId', validateTimesheet, verifyEntityExists('employee'), (req, res, next) => {
    const timesheet = req.body.timesheet;
    const values = {
        $hours: timesheet.hours,
        $rate: timesheet.rate,
        $date: timesheet.date,
        $employee_id: req.employeeId
    };
    req.dbUtil.update('timesheet', { $id: req.timesheetId }, values, (data) => {
        if (!data.changes) {
            res.sendStatus(404);
            return;
        }
        req.dbUtil.get('timesheet', { $id: req.timesheetId }, (data) => {
            res.status(200).send({ timesheet: data.row });
        })
    });
});

// DELETE
router.delete('/:timesheetId', (req, res, next) => {
    req.dbUtil.del('timesheet', { $id: req.timesheetId }, (data) => {
        res.sendStatus(data.changes ? 204 : 404);
    });
});