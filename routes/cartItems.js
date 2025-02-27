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

        const getCartItemsQuery = await query(
            `SELECT *
            FROM cart_items
            WHERE cart_id=$1`,
            [cartId]
        );

        res.status(200).send(getCartItemsQuery.rows);
    } catch(err) {
        next(err);
    }
});

router.get('/:cartItemId', async (req, res, next) => {
    const { cartItemId } = req.params;

    try {
        const getCartItemQuery = await query(
            `SELECT *
            FROM cart_items
            WHERE id=$1`,
            [cartItemId]
        );

        if (getCartItemQuery.rows?.length == 0) {
            res.status(404).send('Cart Item not found');
            return;
        }

        res.status(200).send(getCartItemQuery.rows[0]);
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
    const { quantity, productId } = req.body;

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

        const addCartItemQuery = await query(
            `INSERT INTO cart_items
            (quantity, cart_id, product_id)
            VALUES
            ($1, $2, $3)
            RETURNING *`,
            [quantity, cartId, productId]
        );

        res.status(201).send(`Item added to cart with ID: ${addCartItemQuery.rows[0].id}`);
    } catch(err) {
        next(err);
    }
});

router.put('/:cartItemId', async (req, res, next) => {
    const { cartItemId } = req.params;
    const { quantity, productId } = req.body;

    try {
        const getCartItemQuery = await query(
            `SELECT *
            FROM cart_items
            WHERE id=$1`,
            [cartItemId]
        );

        if (getCartItemQuery.rows?.length == 0) {
            res.status(404).send('Cart Item not found');
            return;
        }

        const updateCartItemQuery = await query(
            `UPDATE cart_items
            SET quantity=$1,
            product_id=$2
            WHERE id=$3
            RETURNING *`,
            [quantity, productId, cartItemId]
        );

        res.status(200).send(`Cart Item updated with ID: ${updateCartItemQuery.rows[0].id}`)
    } catch(err) {
        next(err);
    }
});

router.delete('/:cartItemId', async (req, res, next) => {
    const { cartItemId } = req.params;

    try {
        const getCartItemQuery = await query(
            `SELECT *
            FROM cart_items
            WHERE id=$1`,
            [cartItemId]
        );

        if (getCartItemQuery.rows?.length == 0) {
            res.status(404).send('Cart Item not found');
            return;
        }

        await query(
            `DELETE
            FROM cart_items
            WHERE id=$1`,
            [cartItemId]
        );

        res.status(204).send();
    } catch(err) {
        next(err);
    }
});

module.exports = router;