const express = require('express');
const router = express.Router({ mergeParams: true });
const dbUtil = require('../common/dbUtil');

module.exports = router;

// common
const validateMenu = (req, res, next) => {
    const menu = req.body.menu;
    if (!menu || !menu.title) {
        res.sendStatus(400);
        return;
    }

    next();
};

// GET
router.get('/', (req, res, next) => {
    req.dbUtil.all('menu', {}, (data) => {
        if (data.notFound) {
            res.sendStatus(404);
            return;
        }
        res.status(200).send({ menus: data.rows });
    });
});

router.get('/:menuId', (req, res, next) => {
    req.dbUtil.get('menu', { $id: req.menuId }, (data) => {
        if (data.notFound) {
            res.sendStatus(404);
            return;
        }
        res.status(200).send({ menu: data.row });
    });
});

// POST
router.post('/', validateMenu, (req, res, next) => {
    const menu = req.body.menu;
    req.dbUtil.insert('menu', { $title: menu.title }, (data) => {
        req.dbUtil.get('menu', { $id: data.lastId }, (data) => {
            res.status(201).send({ menu: data.row });
        });
    });
});

// PUT
router.put('/:menuId', validateMenu, (req, res, next) => {
    const menu = req.body.menu;
    req.dbUtil.update('menu', { $id: req.menuId }, { $title: menu.title }, (data) => {
        if (!data.changes) {
            res.sendStatus(404);
            return;
        }
        req.dbUtil.get('menu', { $id: req.menuId }, (data) => {
            res.status(200).send({ menu: data.row });
        });
    });
});

// DELETE
router.delete('/:menuId', (req, res, next) => {// TODO: remove redundant count here
    req.dbUtil.count('menuItem', { $menu_id: req.menuId }, (data) => {
        if (data.row.count > 0) {
            res.sendStatus(400);
            return;
        }

        req.dbUtil.del('menu', { $id: req.menuId }, () => {
            req.dbUtil.get('menu', { $id: req.menuId }, () => {
                res.sendStatus(204);
            });
        });
    });
});