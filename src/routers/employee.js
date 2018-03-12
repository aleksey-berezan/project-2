const express = require('express');
const router = express.Router({ mergeParams: true });
const dbUtil = require('../utils/dbUtil');
const onReady = dbUtil.onReady;

module.exports = router;

// common
const validateEmployee = (req, res, next) => {
    const employee = req.body.employee;
    if (!employee || !employee.name || !employee.position || !employee.wage) {
        res.sendStatus(400);
        return;
    }

    next();
};

// GET
router.get('/', (req, res, next) => {
    dbUtil.all(req.db, 'employee', { $is_current_employee: 1 }, onReady(res, {
        onNotFound: 404,
        callback: (rows) => {
            res.status(200).send({ employees: rows });
        }
    }));
});

router.get('/:employeeId', (req, res, next) => {
    dbUtil.get(req.db, 'employee', { $id: req.employeeId },
        onReady(res, {
            onNotFound: 404,
            callback: (row) => {
                res.status(200).send({ employee: row });
            }
        }));
});

// POST
router.post('/', validateEmployee, (req, res, next) => {
    const employee = req.body.employee;
    dbUtil.insert(req.db, 'employee', { $name: employee.name, $position: employee.position, $wage: employee.wage },
        onReady(res, (_, lastId) => {
            dbUtil.get(req.db, 'employee', { $id: lastId }, onReady(res, {
                onNotFound: 404,
                callback: (row) => {
                    res.status(201).send({ employee: row });
                }
            }));
        }));
});

// PUT
router.put('/:employeeId', validateEmployee, (req, res, next) => {
    const employee = req.body.employee;
    dbUtil.update(req.db, 'employee', { $id: req.employeeId }, { $name: employee.name, $position: employee.position, $wage: employee.wage },
        onReady(res, () => {
            dbUtil.get(req.db, 'employee', { $id: req.employeeId }, onReady(res, {
                onNotFound: 404,
                callback: (row) => {
                    res.status(200).send({ employee: row });
                }
            }));
        }));
});

// DELETE
router.delete('/:employeeId', (req, res, next) => {
    dbUtil.update(req.db, 'employee', { $id: req.employeeId }, { $is_current_employee: 0 },
        onReady(res, () => {
            dbUtil.get(req.db, 'employee', { $id: req.employeeId },
                onReady(res, (row) => {
                    res.status(200).send({ employee: row });
                }));
        }));
});