const express = require('express');
const query = require('../db/index');

const router = express.Router();

router.get('/', async (req, res, next) => {
    if (!req.user) {
        res.status(401).send('No user logged in');
        return;
    }

    const { id } = req.user;

    try {
        const getOrdersQuery = await query(
            `SELECT *
            FROM orders
            WHERE user_id=$1`,
            [id]
        );

        if (getOrdersQuery.rows?.length == 0) {
            res.status(404).send('No orders found for current user');
            return;
        }

        res.status(200).send(getOrdersQuery.rows);
    } catch(err) {
        next(err);
    }
});

router.get('/:orderId', async (req, res, next) => {
    const { orderId } = req.params;

    try {
        const getOrderQuery = await query(
            `SELECT *
            FROM orders
            WHERE id=$1`,
            [orderId]
        );

        res.status(200).send(getOrderQuery.rows[0]);
    } catch(err) {
        next(err);
    }
});

router.get('/:orderId/items', async (req, res, next) => {
    const { orderId } = req.params;

    try {
        const getCartItemQuery = await query(
            `SELECT *
            FROM order_items
            WHERE order_id=$1`,
            [orderId]
        );

        res.status(200).send(getCartItemQuery.rows);
    } catch(err) {
        next(err);
    }
});

router.get('/:orderId/items/:orderItemId', async (req, res, next) => {
    const { orderId, orderItemId } = req.params;

    try {
        const getCartItemQuery = await query(
            `SELECT *
            FROM order_items
            WHERE order_id=$1
            AND id=$2`,
            [orderId, orderItemId]
        );

        res.status(200).send(getCartItemQuery.rows[0]);
    } catch(err) {
        next(err);
    }
});

module.exports = router;