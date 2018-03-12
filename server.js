const express = require('express');
const app = express();

//
// Middleware
//

// cors
const cors = require('cors');
app.use(cors());

if (!module.parent) {
    // logging
    // use only when only running the app
    const morgan = require('morgan');
    app.use(morgan('common'));
}

// body parsing
const bodyParser = require('body-parser');
app.use(bodyParser.json());

//
// db
//
const withDb = (db) => {
    if (!db) {
        const sqlite3 = require('sqlite3');
        module.db = new sqlite3.Database('./database.sqlite');
    } else {
        module.db = db;
    }

    console.log(`server: using ${JSON.stringify(module.db)}`);
    return app;
};

//
// routers declarations
//
const apiRouter = require('./src/routers/api').withDb(() => module.db);
app.use('/api', apiRouter);

//
// bootstrap
//
var server;
const PORT = process.env.PORT || 4000;
if (!module.parent) {
    withDb();
    server = app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
}

module.exports = { withDb };