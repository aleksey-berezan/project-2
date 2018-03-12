// helper functions
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

        // TODO: pass data as object
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

const runSelect = (db, entityName, criterias, selectAll, selectCount, callback) => {
    const noFilter = Object.keys(criterias).length === 0 && criterias.constructor === Object;
    const params = getParams(criterias);
    const query = `SELECT ` +
        (selectCount ? 'COUNT(*) as count' : `*`) +
        ` FROM ${capitalize(entityName)}` +
        (noFilter ? `` : ` WHERE ${getFilterString(criterias)}`);

    if (selectAll) {
        if (noFilter) {
            return db.all(query, callback);
        } else {
            return db.all(query, criterias, callback);
        }
    } else {
        if (noFilter) {
            return db.get(query, callback);
        }
        else {
            return db.get(query, criterias, callback);
        }
    }
}

// exported functions

const all = (db, entityName, criterias, callback) => {
    return runSelect(db, entityName, criterias, true, false, wrapCallback(callback));
}

const get = (db, entityName, criterias, callback) => {
    return runSelect(db, entityName, criterias, false, false, wrapCallback(callback));
}

const count = (db, entityName, criterias, callback) => {
    return runSelect(db, entityName, criterias, false, true, wrapCallback(callback));
}

const insert = (db, entityName, values, callback) => {
    const params = getParams(values);
    const query = `INSERT INTO ${capitalize(entityName)} (${params.columnNames.join(',')}) VALUES (${params.argNames.join(',')})`;
    return db.run(
        query,
        values,
        wrapCallback(callback));
}

const update = (db, entityName, criterias, values, callback) => {
    const params = getParams(values);
    const query = `UPDATE ${capitalize(entityName)} ` +
        `SET ${params.columnToArgMap.map(x => `${x.columnName}=${x.argName}`).join(',')} ` +
        `WHERE ${getFilterString(criterias)}`
    return db.run(
        query,
        Object.assign(values, criterias),
        wrapCallback(callback));
}

const del = (db, entityName, criterias, callback) => {
    const params = getParams(criterias);
    const query = `DELETE FROM ${capitalize(entityName)} WHERE ${getFilterString(criterias)}`;
    return db.run(query, criterias, wrapCallback(callback));
}

// exports
module.exports = {
    insert: insert,
    all: all,
    get: get,
    count: count,
    update: update,
    del: del
};