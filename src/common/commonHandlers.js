const express = require('express');
const router = express.Router({ mergeParams: true });
const dbUtil = require('../common/dbUtil');

const verifyEntityExists = (entityName, identityColumnName) => {
    return (req, res, next) => {
        const criterias = {};
        criterias['$' + (identityColumnName || 'id')] = req[entityName + 'Id'];

        dbUtil.count(req.db, entityName, criterias, (data) => {
            if (data.row.count === 0) {
                res.sendStatus(404);
                return;
            }

            next();
        });
    }
};

module.exports = { verifyEntityExists: verifyEntityExists };