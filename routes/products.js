const express = require('express');
const query = require('../db/index');

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const allProductsQuery = await query(
            `SELECT *
            FROM products`
        );

        res.status(200).send(allProductsQuery.rows);
    } catch(err) {
        next(err);
    }
});

router.get('/:productId', async (req, res, next) => {
    const { productId } = req.params;

    try {
        const singleProductQuery = await query(
            `SELECT *
            FROM products
            WHERE id=$1`,
            [productId]
        );

        res.status(200).send(singleProductQuery.rows[0]);
    } catch(err) {
        next(err);
    }
});

module.exports = router;