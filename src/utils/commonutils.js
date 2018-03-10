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

// db
const then = (res, opt) => {
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

// exports
module.exports = {
    then: then
};