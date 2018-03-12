const express = require('express');
const router = express.Router({ mergeParams: true });
const dbUtil = require('../common/dbUtil');
const onReady = dbUtil.onReady;

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
    dbUtil.all(req.db, 'menu', {}, onReady(res, (data) => {
        if (data.notFound) {
            res.sendStatus(404);
            return;
        }
        res.status(200).send({ menus: data.rows });
    }));
});

router.get('/:menuId', (req, res, next) => {
    dbUtil.get(req.db, 'menu', { $id: req.menuId },
        onReady(res, (data) => {
            if (data.notFound) {
                res.sendStatus(404);
                return;
            }
            res.status(200).send({ menu: data.row });
        }));
});

// POST
router.post('/', validateMenu, (req, res, next) => {
    const menu = req.body.menu;
    dbUtil.insert(req.db, 'menu', { $title: menu.title },
        onReady(res, (data) => {
            dbUtil.get(req.db, 'menu', { $id: data.lastId }, onReady(res,
                (data) => {
                    res.status(201).send({ menu: data.row });
                }
            ));
        }));
});

// PUT
router.put('/:menuId', validateMenu, (req, res, next) => {
    const menu = req.body.menu;
    dbUtil.update(req.db, 'menu', { $id: req.menuId }, { $title: menu.title },
        onReady(res, (data) => {
            if (!data.changes) {
                res.sendStatus(404);
                return;
            }
            dbUtil.get(req.db, 'menu', { $id: req.menuId }, onReady(res,
                (data) => {
                    res.status(200).send({ menu: data.row });
                }
            ));
        }));
});

// DELETE
router.delete('/:menuId', (req, res, next) => {// TODO: remove redundant count here
    dbUtil.count(req.db, 'menuItem', { $menu_id: req.menuId }, onReady(res, (data) => {
        if (data.row.count > 0) {
            res.sendStatus(400);
            return;
        }

        dbUtil.del(req.db, 'menu', { $id: req.menuId },
            onReady(res, () => {
                dbUtil.get(req.db, 'menu', { $id: req.menuId },
                    onReady(res, () => {
                        res.sendStatus(204);
                    }));
            }));
    }));
});