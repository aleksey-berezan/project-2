const express = require('express');
const router = express.Router({ mergeParams: true });
const dbUtil = require('../common/dbUtil');
const onReady = dbUtil.onReady;
const verifyEntityExists = require('../common/commonHandlers').verifyEntityExists;

module.exports = router;

// common
const validateMenuItem = (req, res, next) => {
    const menuItem = req.body.menuItem;
    if (!menuItem.name || !menuItem.description || !menuItem.inventory || !menuItem.price) {
        res.sendStatus(400);
        return;
    }

    next();
};

// GET
router.get('/', verifyEntityExists('menu'), (req, res, next) => {
    dbUtil.all(req.db, 'menuItem', { $menu_id: req.menuId }, onReady(res, (rows) => {
        res.status(200).send({ menuItems: rows });
    }));
});

// POST
router.post('/', validateMenuItem, (req, res, next) => {
    const menuItem = req.body.menuItem;
    const values = { $name: menuItem.name, $description: menuItem.description, $inventory: menuItem.inventory, $price: menuItem.price, $menu_id: menuItem.menu_id };
    dbUtil.insert(req.db, 'menuItem', values, onReady(res, (_, lastId) => {
        dbUtil.get(req.db, 'menuItem', { $id: lastId }, onReady(res, (row) => {
            res.status(201).send({ menuItem: row });
        }));
    }));
});

// PUT
router.put('/:menuItemId', validateMenuItem, verifyEntityExists('menu'), (req, res, next) => {
    const menuItem = req.body.menuItem;
    const values = { $name: menuItem.name, $description: menuItem.description, $inventory: menuItem.inventory, $price: menuItem.price, };
    dbUtil.update(req.db, 'menuItem', { $id: req.menuItemId }, values, onReady(res,
        (ignored1, ignored2, changes) => {// TODO: move params into single object
            if (!changes) {
                res.sendStatus(404);
                return;
            }
            dbUtil.get(req.db, 'menuItem', { $id: req.menuItemId },
                onReady(res, (row) => {
                    res.status(200).send({ menuItem: row });
                }))
        }));
});

// DELETE
router.delete('/:menuItemId', (req, res, next) => {
    dbUtil.del(req.db, 'menuItem', { $id: req.menuItemId }, onReady(res, {
        callback: (ignored1, ignored2, changes) => {
            res.sendStatus(changes ? 204 : 404);
        }
    }));
});