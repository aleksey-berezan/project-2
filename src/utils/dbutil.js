// common
const handleFailure = (err, res, status, message) => {
    if (!err) {
        return false;
    }

    console.log(err);
    if (!res) {
        throw err;
    }

    res.status(status || 500);
    res.send(message || err);
    return true;
};

const capitalize = (s) => {
    return s.charAt(0).toUpperCase() + s.substr(1);
}

// db
const onReady = (res, optOrCallback) => {
    if (!optOrCallback) {
        throw "'optOrCallback' must be non empty object!";
    }

    const isFunction = typeof optOrCallback === 'function';
    const callback = isFunction ? optOrCallback : optOrCallback.callback;
    const opt = isFunction ? {} : optOrCallback;

    if (!callback) {
        throw "'callback' must be specified!";
    }

    // critical to have it as plain old 'function' - in sake of access to 'this.lastID'
    return function (err, dbResult) {
        if (handleFailure(err, res)) {
            return;
        }

        if (dbResult === undefined && opt && opt.onNotFound) {
            res.sendStatus(opt.onNotFound);
            return;
        }

        // TODO: pass data as object
        callback(dbResult, this.lastID, this.changes);
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

// select
const runSelect = (db, entityName, criterias, selectAll, callback) => {
    const params = getParams(criterias);
    const query = `SELECT * FROM ${capitalize(entityName)} WHERE ${getFilterString(criterias)}`;
    if (selectAll) {
        return db.all(query, criterias, callback);
    } else {
        return db.get(query, criterias, callback);
    }
}

const all = (db, entityName, criterias, callback) => {
    return runSelect(db, entityName, criterias, true, callback);
}

const get = (db, entityName, criterias, callback) => {
    return runSelect(db, entityName, criterias, false, callback);
}

// insert
const insert = (db, entityName, values, callback) => {
    const params = getParams(values);
    const query = `INSERT INTO ${capitalize(entityName)} (${params.columnNames.join(',')}) VALUES (${params.argNames.join(',')})`;
    return db.run(
        query,
        values,
        callback);
}

// update
const update = (db, entityName, criterias, values, callback) => {
    const params = getParams(values);
    const query = `UPDATE ${capitalize(entityName)} ` +
        `SET ${params.columnToArgMap.map(x => `${x.columnName}=${x.argName}`).join(',')} ` +
        `WHERE ${getFilterString(criterias)}`
    return db.run(
        query,
        Object.assign(values, criterias),
        callback);
}

// delete
const del = (db, entityName, criterias, callback) => {
    const params = getParams(criterias);
    const query = `DELETE FROM ${capitalize(entityName)} WHERE ${getFilterString(criterias)}`;
    return db.run(query, criterias, callback);
}

// exports
module.exports = {
    onReady: onReady,
    insert: insert,
    all: all,
    get: get,
    update: update,
    del: del
};