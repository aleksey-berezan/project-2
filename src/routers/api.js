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

//
// sub routers
//

// api/employee
const employeeRouter = require('./employee');
employeeRouter.param(':employeeId', idExtractor('employee'));

apiRouter.use('/employees', employeeRouter);

// api/employee/:employeeId/timesheets
const timesheetRouter = require('./timesheet');
timesheetRouter.param(':timesheetId', idExtractor('timesheet'));
apiRouter.param(':employeeId', idExtractor('employee'));

apiRouter.use('/employees/:employeeId/timesheets', timesheetRouter);

// api/menus
const menuRouter = require('./menu');
menuRouter.param(':menuId', idExtractor('menu'));

apiRouter.use('/menus', menuRouter);

// api/menus/:menuId/menu-items
const menuItemRouter = require('./menuitem');
menuItemRouter.param(':menuItemId', idExtractor('menuItem'));
apiRouter.param(':menuId', idExtractor('menu'));

apiRouter.use('/menus/:menuId/menu-items', menuItemRouter);

//
// exports
//
module.exports = { withDb };