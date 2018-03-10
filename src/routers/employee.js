const express = require('express');
const router = express.Router({ mergeParams: true });
const commonutils = require('../utils/commonutils');
const then = commonutils.then;

module.exports = router;

// GET

router.get('/', (req, res, next) => {
    req.db.all(`SELECT * FROM Employee WHERE is_current_employee=1`, then(res, {
        callback: (rows) => {
            res.status(200).send({ employees: rows });
        }
    }));
});

router.get('/:id', (req, res, next) => {
    req.db.get(`SELECT * FROM Employee WHERE id=${req.employeeId}`, then(res, {
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

    req.db.run(`INSERT INTO Employee (name, position, wage) VALUES('${employee.name}','${employee.position}','${employee.wage}')`, then(res, {
        callback: (_, lastId) => {
            req.db.get(`SELECT * FROM Employee WHERE id=${lastId}`, then(res, {
                onNotFound: 404,
                callback: (row) => {
                    res.status(201).send({ employee: row });
                }
            }));
        }
    }));
});