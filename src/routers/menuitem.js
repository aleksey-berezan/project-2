const express = require('express');
const router = express.Router({ mergeParams: true });
const dbUtil = require('../utils/dbutil');
const onReady = dbUtil.onReady;

module.exports = router;

// get
router.get('/', (req, res, next) => {
    dbUtil.count(req.db, 'menu', { $id: req.menuId }, onReady(res, (row) => {
        if (row.count === 0) {
            res.sendStatus(404);
            return;
        }

        dbUtil.all(req.db, 'menuItem', { $menu_id: req.menuId }, onReady(res, (rows) => {
            res.status(200).send({ menuItems: rows });
        }));
    }));
});

// POST
router.post('/', (req, res, next) => {
    const menuItem = req.body.menuItem;
    if (!menuItem.name || !menuItem.description || !menuItem.inventory || !menuItem.price || !menuItem.menu_id) {
        res.sendStatus(400);
        return;
    }

    const values = { $name: menuItem.name, $description: menuItem.description, $inventory: menuItem.inventory, $price: menuItem.price, $menu_id: menuItem.menu_id };
    dbUtil.insert(req.db, 'menuItem', values, onReady(res, (_, lastId) => {
        dbUtil.get(req.db, 'menuItem', { $id: lastId }, onReady(res, (row) => {
            res.status(201).send({ menuItem: row });
        }));
    }));
});

// PUT
router.put('/:menuItemId', (req, res, next) => {
    // TODO: move validations into separate handlers
    const menuItem = req.body.menuItem;
    if (!menuItem.name || !menuItem.description || !menuItem.inventory || !menuItem.price) {
        res.sendStatus(400);
        return;
    }

    dbUtil.count(req.db, 'menu', { $id: req.menuId }, onReady(res, (row) => {
        if (row.count === 0) {
            res.sendStatus(404);
            return;
        }

        const values = { $name: menuItem.name, $description: menuItem.description, $inventory: menuItem.inventory, $price: menuItem.price, };
        dbUtil.update(req.db, 'menuItem', { $id: req.menuItemId }, values, onReady(res,
            (ignored1, ignored2, changes) => {
                if (!changes) {
                    res.sendStatus(404);
                    return;
                }
                dbUtil.get(req.db, 'menuItem', { $id: req.menuItemId },
                    onReady(res, (row) => {
                        res.status(200).send({ menuItem: row });
                    }))
            }));
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