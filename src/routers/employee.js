const express = require('express');
const router = express.Router({ mergeParams: true });

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
    req.dbUtil.all('employee', { $is_current_employee: 1 }, (data) => {
        res.status(200).send({ employees: data.rows });
    });
});

router.get('/:employeeId', (req, res, next) => {
    req.dbUtil.get('employee', { $id: req.employeeId }, (data) => {
        if (data.notFound) {
            res.sendStatus(404);
            return;
        }

        res.status(200).send({ employee: data.row });
    });
});

// POST
router.post('/', validateEmployee, (req, res, next) => {
    const employee = req.body.employee;
    const values = { $name: employee.name, $position: employee.position, $wage: employee.wage };
    req.dbUtil.insert('employee', values, (data) => {
        req.dbUtil.get('employee', { $id: data.lastId }, (data) => {
            res.status(201).send({ employee: data.row });
        });
    });
});

// PUT
router.put('/:employeeId', validateEmployee, (req, res, next) => {
    const employee = req.body.employee;
    const values = { $name: employee.name, $position: employee.position, $wage: employee.wage };
    req.dbUtil.update('employee', { $id: req.employeeId }, values, (data) => {
        if (!data.changes) {
            res.sendStatus(404);
            return;
        }
        req.dbUtil.get('employee', { $id: req.employeeId }, (data) => {
            res.status(200).send({ employee: data.row });
        });
    });
});

// DELETE
router.delete('/:employeeId', (req, res, next) => {
    req.dbUtil.update('employee', { $id: req.employeeId }, { $is_current_employee: 0 }, () => {
        req.dbUtil.get('employee', { $id: req.employeeId }, (data) => {
            res.status(200).send({ employee: data.row });
        });
    });
});