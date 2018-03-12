const express = require('express');
const router = express.Router({ mergeParams: true });
const dbUtil = require('../common/dbUtil');
const onReady = dbUtil.onReady;
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
    dbUtil.all(req.db, 'timesheet', { $employee_id: req.employeeId },
        onReady(res, (data) => {
            res.status(200).send({ timesheets: data.rows });
        }))
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
    dbUtil.insert(req.db, 'timesheet', values, onReady(res, (data) => {
        dbUtil.get(req.db, 'timesheet', { $id: data.lastId },
            onReady(res, (data) => {
                res.status(201).send({ timesheet: data.row });
            }))
    }));
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
    dbUtil.update(req.db, 'timesheet', { $id: req.timesheetId }, values, onReady(res,
        (data) => {
            if (!data.changes) {
                res.sendStatus(404);
                return;
            }
            dbUtil.get(req.db, 'timesheet', { $id: req.timesheetId },
                onReady(res, (data) => {
                    res.status(200).send({ timesheet: data.row });
                }))
        }));
});

// DELETE
router.delete('/:timesheetId', (req, res, next) => {
    dbUtil.del(req.db, 'timesheet', { $id: req.timesheetId }, onReady(res, (data) => {
        res.sendStatus(data.changes ? 204 : 404);
    }));
});