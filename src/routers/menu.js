const express = require('express');
const router = express.Router({ mergeParams: true });
const dbUtil = require('../utils/dbutil');
const onReady = dbUtil.onReady;

module.exports = router;

// GET
router.get('/', (req, res, next) => {
    dbUtil.all(req.db, 'menu', {}, onReady(res, {
        onNotFound: 404,
        callback: (rows) => {
            res.status(200).send({ menus: rows });
        }
    }));
});

router.get('/:id', (req, res, next) => {
    dbUtil.get(req.db, 'menu', { $id: req.menuId },
        onReady(res, {
            onNotFound: 404,
            callback: (row) => {
                res.status(200).send({ menu: row });
            }
        }));
});

// POST
router.post('/', (req, res, next) => {
    const menu = req.body.menu;
    if (!menu || !menu.title) {
        res.sendStatus(400);
        return;
    }

    dbUtil.insert(req.db, 'menu', { $title: menu.title },
        onReady(res, (_, lastId) => {
            dbUtil.get(req.db, 'menu', { $id: lastId }, onReady(res, {
                onNotFound: 404,
                callback: (row) => {
                    res.status(201).send({ menu: row });
                }
            }));
        }));
});

// PUT
router.put('/:id', (req, res, next) => {
    const menu = req.body.menu;
    if (!menu || !menu.title) {
        res.sendStatus(400);
        return;
    }

    dbUtil.update(req.db, 'menu',
        { $id: req.menuId },
        { $title: menu.title },
        onReady(res, () => {
            dbUtil.get(req.db, 'menu', { $id: req.menuId }, onReady(res, {
                onNotFound: 404,
                callback: (row) => {
                    res.status(200).send({ menu: row });
                }
            }));
        }));
});

// DELETE
router.delete('/:id', (req, res, next) => {
    dbUtil.count(req.db, 'menuItem', { $menu_id: req.menuId }, onReady(res, (row) => {
        if (row.count > 0) {
            res.sendStatus(400);
            return;
        }

        dbUtil.del(req.db, 'menu', { $id: req.menuId },
            onReady(res, () => {
                dbUtil.get(req.db, 'menu', { $id: req.menuId },
                    onReady(res, (row) => {
                        res.sendStatus(204);
                    }));
            }));
    }));
});