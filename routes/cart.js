const express = require('express');
const query = require('../db/index');

const router = express.Router();

router.get('/', async (req, res, next) => {
    const { id } = req.user;

    try {
        const getCartQuery = await query(
            `SELECT *
            FROM carts
            WHERE user_id=$1`,
            [id]
        );

        res.status(200).send(getCartQuery.rows[0]);
    } catch(err) {
        next(err);
    }
});

router.post('/', async (req, res, next) => {
    const { id } = req.user;

    try {
        const addCartQuery = await query(
            `INSERT INTO carts (user_id)
            VALUES ($1)
            RETURNING *`,
            [id]
        );

        res.status(201).send(`Cart added with ID: ${addCartQuery.rows[0].id}`);
    } catch(err) {
        next(err);
    }
});

module.exports = router;