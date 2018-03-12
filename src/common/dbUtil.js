// helper functions
function dbUtil(db) {
    const currentDb = db;

    const capitalize = (s) => {
        return s.charAt(0).toUpperCase() + s.substr(1);
    }

    const wrapCallback = (callback) => {
        if (!callback) {
            throw "'callback' must be specified!";
        }

        // critical to have it as plain old 'function' - in sake of access to 'this.lastID'
        return function (err, dbResult) {
            if (err) {
                console.log(err);
            }

            callback({
                row: dbResult,
                rows: dbResult,
                notFound: dbResult === undefined,
                lastId: this.lastID,
                changes: this.changes,
                err: err
            });
        };
    };

    const getParams = (values) => {
        const argNames = Object.keys(values);
        const columnNames = Object.keys(values).map(x => x.substr(1));

        const columnToArgMap = [];
        for (let i = 0; i < columnNames.length; i++) {
            columnToArgMap.push({ columnName: columnNames[i], argName: argNames[i] });
        }

        return { argNames, columnNames, columnToArgMap };
    };

    const getFilterString = (criterias) => {
        if (!criterias) {
            return '';
        }

        const params = getParams(criterias);
        return `${params.columnToArgMap.map(x => `${x.columnName}=${x.argName}`).join('AND')}`;
    };

    const runSelect = (entityName, criterias, selectAll, selectCount, callback) => {
        const noFilter = Object.keys(criterias).length === 0 && criterias.constructor === Object;
        const params = getParams(criterias);
        const query = `SELECT ` +
            (selectCount ? 'COUNT(*) as count' : `*`) +
            ` FROM ${capitalize(entityName)}` +
            (noFilter ? `` : ` WHERE ${getFilterString(criterias)}`);

        if (selectAll) {
            if (noFilter) {
                return currentDb.all(query, callback);
            } else {
                return currentDb.all(query, criterias, callback);
            }
        } else {
            if (noFilter) {
                return currentDb.get(query, callback);
            }
            else {
                return currentDb.get(query, criterias, callback);
            }
        }
    }

    // exported functions

    return w = {

        all: (entityName, criterias, callback) => {
            return runSelect(entityName, criterias, true, false, wrapCallback(callback));
        },

        get: (entityName, criterias, callback) => {
            return runSelect(entityName, criterias, false, false, wrapCallback(callback));
        },

        count: (entityName, criterias, callback) => {
            return runSelect(entityName, criterias, false, true, wrapCallback(callback));
        },

        insert: (entityName, values, callback) => {
            const params = getParams(values);
            const query = `INSERT INTO ${capitalize(entityName)} (${params.columnNames.join(',')}) VALUES (${params.argNames.join(',')})`;
            return currentDb.run(
                query,
                values,
                wrapCallback(callback));
        },

        update: (entityName, criterias, values, callback) => {
            const params = getParams(values);
            const query = `UPDATE ${capitalize(entityName)} ` +
                `SET ${params.columnToArgMap.map(x => `${x.columnName}=${x.argName}`).join(',')} ` +
                `WHERE ${getFilterString(criterias)}`
            return currentDb.run(
                query,
                Object.assign(values, criterias),
                wrapCallback(callback));
        },

        del: (entityName, criterias, callback) => {
            const params = getParams(criterias);
            const query = `DELETE FROM ${capitalize(entityName)} WHERE ${getFilterString(criterias)}`;
            return currentDb.run(query, criterias, wrapCallback(callback));
        }
    };
}

// exports
module.exports = {
    dbUtil: dbUtil
};