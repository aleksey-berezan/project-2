const express = require('express');
const router = express.Router({ mergeParams: true });
const dbUtil = require('../utils/dbutil');
const onReady = dbUtil.onReady;

module.exports = router;

// GET
router.get('/', (req, res, next) => {
    dbUtil.get(req.db, 'employee', { $id: req.employeeId }, onReady(res, {
        onNotFound: 404,
        callback: () => {
            dbUtil.all(req.db, 'timesheet', { $employee_id: req.employeeId },
                onReady(res, (rows) => {
                    res.status(200).send({ timesheets: rows });
                }))
        }
    }));
});

// POST
router.post('/', (req, res, next) => {
    const timesheet = req.body.timesheet;
    if (!timesheet || !timesheet.hours || !timesheet.rate || !timesheet.date) {
        res.sendStatus(400);
        return;
    }

    dbUtil.get(req.db, 'employee', { $id: req.employeeId }, onReady(res, {
        onNotFound: 404,
        callback: () => {
            const values = { $hours: timesheet.hours, $rate: timesheet.rate, $date: timesheet.date, $employee_id: req.employeeId };
            dbUtil.insert(req.db, 'timesheet', values, onReady(res, (_, lastId) => {
                dbUtil.get(req.db, 'timesheet', { $id: lastId },
                    onReady(res, (row) => {
                        res.status(201).send({ timesheet: row });
                    }))
            }));
        }
    }));
});

// PUT
router.put('/:timesheetId', (req, res, next) => {
    // TODO: move validations into separate handlers
    const timesheet = req.body.timesheet;
    if (!timesheet || !timesheet.hours || !timesheet.rate || !timesheet.date) {
        res.sendStatus(400);
        return;
    }

    dbUtil.get(req.db, 'employee', { $id: req.employeeId }, onReady(res, {
        onNotFound: 404,
        callback: () => {
            const values = { $hours: timesheet.hours, $rate: timesheet.rate, $date: timesheet.date, $employee_id: req.employeeId };
            dbUtil.update(req.db, 'timesheet', { $id: req.timesheetId }, values, onReady(res,
                (ignored1, ignored2, changes) => {
                    if (!changes) {
                        res.sendStatus(404);
                        return;
                    }
                    dbUtil.get(req.db, 'timesheet', { $id: req.timesheetId },
                        onReady(res, (row) => {
                            res.status(200).send({ timesheet: row });
                        }))
                }));
        }
    }));
});

// DELETE
router.delete('/:timesheetId', (req, res, next) => {
    dbUtil.del(req.db, 'timesheet', { $id: req.timesheetId }, onReady(res, {
        callback: (ignored1, ignored2, changes) => {
            res.sendStatus(changes ? 204 : 404);
        }
    }));
});