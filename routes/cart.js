const express = require('express');
const query = require('../db/index');
const cartItemsRouter = require('./cartItems');

const router = express.Router();

router.use('/items', cartItemsRouter);

router.get('/', async (req, res, next) => {
    if (!req.user) {
        res.status(401).send('No user logged in');
        return;
    }

    const { id } = req.user;

    try {
        const getCartQuery = await query(
            `SELECT *
            FROM carts
            WHERE user_id=$1`,
            [id]
        );

        if (getCartQuery.rows?.length == 0) {
            res.status(404).send('No cart found for current user');
            return;
        }

        res.status(200).send(getCartQuery.rows[0]);
    } catch(err) {
        next(err);
    }
});

router.post('/', async (req, res, next) => {
    if (!req.user) {
        res.status(401).send('No user logged in');
        return;
    }

    const { id } = req.user;

    try {
        const addCartQuery = await query(
            `INSERT INTO carts 
            (user_id)
            VALUES 
            ($1)
            RETURNING *`,
            [id]
        );

        res.status(201).send(`Cart added with ID: ${addCartQuery.rows[0].id}`);
    } catch(err) {
        next(err);
    }
});

router.post('/checkout', async(req, res, next) => {
    if (!req.user) {
        res.status(401).send('No user logged in');
        return;
    }

    const { id } = req.user;

    try {
        const getCartQuery = await query(
            `SELECT *
            FROM carts
            WHERE user_id=$1`,
            [id]
        );

        if (getCartQuery.rows?.length == 0) {
            res.status(404).send('No cart found for current user');
            return;
        }

        const cartId = getCartQuery.rows[0].id;

        const getTotalQuery = await query(
            `SELECT ROUND(SUM(ci.quantity * p.price) * 100) / 100 AS total
            FROM cart_items ci
            INNER JOIN products p
            ON ci.product_id = p.id
            WHERE ci.cart_id=$1`,
            [cartId]
        );

        const total = getTotalQuery.rows[0].total;

        const addOrderQuery = await query(
            `INSERT INTO orders 
            (total, date, user_id)
            VALUES
            ($1, CURRENT_DATE, $2)
            RETURNING *`,
            [total, id]
        );

        const orderId = addOrderQuery.rows[0].id;

        await query(
            `INSERT INTO order_items 
            (quantity, order_id, product_id)
            SELECT quantity, $1, product_id
            FROM cart_items
            WHERE cart_id=$2`,
            [orderId, cartId]
        );

        res.status(201).send(`Order added with ID: ${orderId}`)
    } catch(err) {
        next(err);
    }
});

module.exports = router;