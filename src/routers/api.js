const express = require('express');
const app = express();

//
// root router
//
const apiRouter = express.Router();
app.use('/api', apiRouter);

//
// db
//
const withDb = (getDb) => {
	module.getDb = getDb;
	return apiRouter;
};

//
// common handlers
//
apiRouter.use('/', (req, res, next) => {
	if (!module.getDb) {
		throw "No db is specified! use '.withDb()' function in order to specify it."
	}

	req.db = module.getDb();
	next();
});

const idExtractor = (entityName) => {
	return (req, res, next, id) => {
		const idNumber = Number(id);
		req[entityName + 'Id'] = idNumber;
		next();
	};
}

// extractors for specifically named entities
apiRouter.param(':employeeId', idExtractor('employee'));

//
// sub routers
//

// api/employee
const employeeRouter = require('./employee');
employeeRouter.param(':id', idExtractor('employee'));
apiRouter.use('/employees', employeeRouter);

// api/employee/:employeeId/timesheets
const timesheetRouter = require('./timesheet');
// TODO: move param extractor closer to usages
timesheetRouter.param(':timesheetId', idExtractor('timesheet'));
apiRouter.use('/employees/:employeeId/timesheets', timesheetRouter);

//
// exports
//
module.exports = { withDb };