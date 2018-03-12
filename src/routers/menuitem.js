const express = require('express');
const router = express.Router({ mergeParams: true });
const dbUtil = require('../common/dbUtil');
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
    req.dbUtil.all('menuItem', { $menu_id: req.menuId }, (data) => {
        res.status(200).send({ menuItems: data.rows });
    });
});

// POST
router.post('/', validateMenuItem, (req, res, next) => {
    const menuItem = req.body.menuItem;
    const values = {
        $name: menuItem.name,
        $description: menuItem.description,
        $inventory: menuItem.inventory,
        $price: menuItem.price,
        $menu_id: menuItem.menu_id
    };
    req.dbUtil.insert('menuItem', values, (data) => {
        req.dbUtil.get('menuItem', { $id: data.lastId }, (data) => {
            res.status(201).send({ menuItem: data.row });
        });
    });
});

// PUT
router.put('/:menuItemId', validateMenuItem, verifyEntityExists('menu'), (req, res, next) => {
    const menuItem = req.body.menuItem;
    const values = {
        $name: menuItem.name,
        $description: menuItem.description,
        $inventory: menuItem.inventory,
        $price: menuItem.price,
    };
    req.dbUtil.update('menuItem', { $id: req.menuItemId }, values, (data) => {
        if (!data.changes) {
            res.sendStatus(404);
            return;
        }
        req.dbUtil.get('menuItem', { $id: req.menuItemId }, (data) => {
            res.status(200).send({ menuItem: data.row });
        })
    });
});

// DELETE
router.delete('/:menuItemId', (req, res, next) => {
    req.dbUtil.del('menuItem', { $id: req.menuItemId }, (data) => {
        res.sendStatus(data.changes ? 204 : 404);
    });
});