const express = require('express');
const router = express.Router({ mergeParams: true });
const dbUtil = require('../utils/dbutil');
const onReady = dbUtil.onReady;

module.exports = router;

// GET
router.get('/', (req, res, next) => {
    dbUtil.all(req.db, 'employee', { $is_current_employee: 1 }, onReady(res, {
        callback: (rows) => {
            res.status(200).send({ employees: rows });
        }
    }));
});

router.get('/:id', (req, res, next) => {
    dbUtil.get(req.db, 'employee', { $id: req.employeeId },
        onReady(res, {
            onNotFound: 404,
            callback: (row) => {
                res.status(200).send({ employee: row });
            }
        }));
});

// POST
router.post('/', (req, res, next) => {
    const employee = req.body.employee;
    if (!employee || !employee.name || !employee.position || !employee.wage) {
        res.sendStatus(400);
        return;
    }

    dbUtil.insert(req.db, 'employee', { $name: employee.name, $position: employee.position, $wage: employee.wage },
        onReady(res, {
            callback: (_, lastId) => {
                dbUtil.get(req.db, 'employee', { $id: lastId }, onReady(res, {
                    onNotFound: 404,
                    callback: (row) => {
                        res.status(201).send({ employee: row });
                    }
                }));
            }
        }));
});