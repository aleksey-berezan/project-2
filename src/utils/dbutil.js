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
const onReady = (res, opt) => {
    // critical to have it as plain old 'function' - in sake of access to 'this.lastID'
    return function (err, dbResult) {
        if (handleFailure(err, res)) {
            return;
        }

        if (!opt) {
            throw 'At least callback must be specified!';
        }

        const callback = opt.callback;

        if (dbResult === undefined && opt && opt.onNotFound) {
            res.sendStatus(opt.onNotFound);
            return;
        }

        callback(dbResult, this.lastID);
    };
};

const extractParams = (values) => {
    const argNames = Object.keys(values);
    const columnNames = Object.keys(values).map(x => x.substr(1));

    const columnToArgMap = [];
    for (let i = 0; i < columnNames.length; i++) {
        columnToArgMap.push({ columnName: columnNames[i], argName: argNames[i] });
    }

    return { argNames, columnNames, columnToArgMap };
};

const runSelect = (db, entityName, criterias, selectAll, callback) => {
    const params = extractParams(criterias);
    const query = `SELECT * FROM ${capitalize(entityName)} WHERE ` +
        `${params.columnToArgMap.map(x => `${x.columnName}=${x.argName}`).join('AND')}`;
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

const insert = (db, entityName, values, callback) => {
    const params = extractParams(values);
    return db.run(
        `INSERT INTO ${capitalize(entityName)} (${params.columnNames.join(',')}) VALUES (${params.argNames.join(',')})`,
        values,
        callback);
}

// exports
module.exports = {
    onReady: onReady,
    insert: insert,
    all: all,
    get: get
};